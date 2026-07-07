package services

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"image/png"
	"strings"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/promptpay"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
	"github.com/boombuler/barcode"
	"github.com/boombuler/barcode/qr"
)

// ErrInvalidMode is returned when the requested QR mode is not supported.
var ErrInvalidMode = errors.New("mode must be 'promptpay' or 'biller'")

type PaymentQRService struct {
	bookingRepo *repositories.BookingRepository
	invoiceRepo *repositories.InvoiceRepository
	storage     *StorageService
	cfg         config.PaymentConfig
}

func NewPaymentQRService(
	bookingRepo *repositories.BookingRepository,
	invoiceRepo *repositories.InvoiceRepository,
	storage *StorageService,
	cfg config.PaymentConfig,
) *PaymentQRService {
	return &PaymentQRService{
		bookingRepo: bookingRepo,
		invoiceRepo: invoiceRepo,
		storage:     storage,
		cfg:         cfg,
	}
}

// Generate builds the EMVCo payload for a booking's amount, renders it to a PNG
// stored in MinIO, and returns a presigned URL to the image. The invoice table is
// not consulted here — it is only used for tracking payment transactions.
func (s *PaymentQRService) Generate(ctx context.Context, req dto.GenerateQRRequest) (dto.GenerateQRResponse, error) {
	mode := strings.ToLower(strings.TrimSpace(req.Mode))
	if mode == "" {
		mode = "promptpay"
	}
	if mode != "promptpay" && mode != "biller" {
		return dto.GenerateQRResponse{}, ErrInvalidMode
	}

	// Amount always comes from the database, never the client. It is sourced from
	// the booking's total_price (the authoritative total for what the user owes).
	booking, err := s.bookingRepo.FindByID(req.BookingID)
	if err != nil {
		return dto.GenerateQRResponse{}, err
	}
	totalPrice := booking.TotalPrice
	amount := fmt.Sprintf("%.2f", float64(totalPrice))

	// ref1 is the reference embedded in the QR (e.g. "BK123" in biller mode; empty
	// in promptpay mode). It becomes the key an uploaded slip is matched back to.
	payload, ref1, err := s.buildPayload(mode, booking.ID, amount)
	if err != nil {
		return dto.GenerateQRResponse{}, err
	}

	pngBytes, err := renderQRCode(payload)
	if err != nil {
		return dto.GenerateQRResponse{}, fmt.Errorf("render qr: %w", err)
	}

	issuedAt := time.Now().UTC()
	objectKey := fmt.Sprintf("qr/booking-%d-%s-%s.png", booking.ID, issuedAt.Format("20060102150405"), randomSuffix())
	if err := s.storage.UploadBytes(ctx, objectKey, pngBytes, "image/png"); err != nil {
		return dto.GenerateQRResponse{}, fmt.Errorf("upload qr: %w", err)
	}

	// Persist the issued QR on the booking's invoice so a later uploaded slip can be
	// matched back to it (via ref1 / amount). Zero rows if no invoice exists yet.
	if err := s.invoiceRepo.UpdateQRByBookingID(booking.ID, ref1, payload, objectKey, issuedAt); err != nil {
		return dto.GenerateQRResponse{}, fmt.Errorf("persist qr: %w", err)
	}

	url, err := s.storage.PresignedURL(ctx, objectKey)
	if err != nil {
		return dto.GenerateQRResponse{}, err
	}

	return dto.GenerateQRResponse{
		BookingID: booking.ID,
		Amount:    float64(totalPrice),
		Payload:   payload,
		QRCodeURL: url,
		ExpiresIn: s.storage.URLExpirySeconds(),
	}, nil
}

// buildPayload returns the EMVCo payload and the ref1 embedded in it. In promptpay
// mode there is no reference, so ref1 is empty.
func (s *PaymentQRService) buildPayload(mode string, bookingID uint, amount string) (payload string, ref1 string, err error) {
	switch mode {
	case "promptpay":
		payload, err = promptpay.BuildPromptPayPayload(s.cfg.PromptPayID, s.cfg.MerchantName, s.cfg.MerchantCity, amount)
		return payload, "", err
	case "biller":
		ref1 = s.cfg.BillerRef1
		if strings.TrimSpace(ref1) == "" {
			// Default reference identifies the specific booking being paid.
			ref1 = fmt.Sprintf("BK%d", bookingID)
		}
		payload, err = promptpay.BuildBillerPayload(s.cfg.BillerID, ref1, s.cfg.BillerRef2, s.cfg.MerchantName, s.cfg.MerchantCity, amount)
		return payload, ref1, err
	default:
		return "", "", ErrInvalidMode
	}
}

func renderQRCode(payload string) ([]byte, error) {
	code, err := qr.Encode(payload, qr.H, qr.Auto)
	if err != nil {
		return nil, err
	}
	scaled, err := barcode.Scale(code, 512, 512)
	if err != nil {
		return nil, err
	}
	var buf bytes.Buffer
	if err := png.Encode(&buf, scaled); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
