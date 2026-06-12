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
	invoiceRepo *repositories.InvoiceRepository
	storage     *StorageService
	cfg         config.PaymentConfig
}

func NewPaymentQRService(
	invoiceRepo *repositories.InvoiceRepository,
	storage *StorageService,
	cfg config.PaymentConfig,
) *PaymentQRService {
	return &PaymentQRService{
		invoiceRepo: invoiceRepo,
		storage:     storage,
		cfg:         cfg,
	}
}

// Generate builds the EMVCo payload for an invoice's amount, renders it to a PNG
// stored in MinIO, persists the payload+object key on the invoice's payment, and
// returns a presigned URL to the image.
func (s *PaymentQRService) Generate(ctx context.Context, req dto.GenerateQRRequest) (dto.GenerateQRResponse, error) {
	mode := strings.ToLower(strings.TrimSpace(req.Mode))
	if mode == "" {
		mode = "promptpay"
	}
	if mode != "promptpay" && mode != "biller" {
		return dto.GenerateQRResponse{}, ErrInvalidMode
	}

	// Amount always comes from the database, never the client.
	invoice, err := s.invoiceRepo.FindByID(req.InvoiceID)
	if err != nil {
		return dto.GenerateQRResponse{}, err
	}
	amount := fmt.Sprintf("%.2f", float64(invoice.TotalAmount))

	payload, err := s.buildPayload(mode, invoice.ID, amount)
	if err != nil {
		return dto.GenerateQRResponse{}, err
	}

	pngBytes, err := renderQRCode(payload)
	if err != nil {
		return dto.GenerateQRResponse{}, fmt.Errorf("render qr: %w", err)
	}

	objectKey := fmt.Sprintf("qr/invoice-%d-%s-%s.png", invoice.ID, time.Now().UTC().Format("20060102150405"), randomSuffix())
	if err := s.storage.UploadBytes(ctx, objectKey, pngBytes, "image/png"); err != nil {
		return dto.GenerateQRResponse{}, fmt.Errorf("upload qr: %w", err)
	}

	url, err := s.storage.PresignedURL(ctx, objectKey)
	if err != nil {
		return dto.GenerateQRResponse{}, err
	}

	return dto.GenerateQRResponse{
		InvoiceID: invoice.ID,
		Amount:    float64(invoice.TotalAmount),
		Payload:   payload,
		QRCodeURL: url,
		ExpiresIn: s.storage.URLExpirySeconds(),
	}, nil
}

func (s *PaymentQRService) buildPayload(mode string, invoiceID uint, amount string) (string, error) {
	switch mode {
	case "promptpay":
		return promptpay.BuildPromptPayPayload(s.cfg.PromptPayID, s.cfg.MerchantName, s.cfg.MerchantCity, amount)
	case "biller":
		ref1 := s.cfg.BillerRef1
		if strings.TrimSpace(ref1) == "" {
			// Default reference identifies the specific invoice being paid.
			ref1 = fmt.Sprintf("INV%d", invoiceID)
		}
		return promptpay.BuildBillerPayload(s.cfg.BillerID, ref1, s.cfg.BillerRef2, s.cfg.MerchantName, s.cfg.MerchantCity, amount)
	default:
		return "", ErrInvalidMode
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
