package services

import (
	"context"
	"errors"
	"io"
	"math"
	"strings"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/easyslip"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
)

// ErrDuplicateSlip is returned when a slip's bank transaction reference has
// already been used by another payment.
var ErrDuplicateSlip = errors.New("slip has already been used")

// ErrNoSlipSource is returned when neither a document nor a payload was supplied.
var ErrNoSlipSource = errors.New("either document_id or payload is required")

type PaymentVerifyService struct {
	easyslip     *easyslip.Client
	paymentRepo  *repositories.PaymentRepository
	invoiceRepo  *repositories.InvoiceRepository
	documentRepo *repositories.DocumentRepository
	storage      *StorageService
	cfg          config.PaymentConfig
}

func NewPaymentVerifyService(
	esClient *easyslip.Client,
	paymentRepo *repositories.PaymentRepository,
	invoiceRepo *repositories.InvoiceRepository,
	documentRepo *repositories.DocumentRepository,
	storage *StorageService,
	cfg config.PaymentConfig,
) *PaymentVerifyService {
	return &PaymentVerifyService{
		easyslip:     esClient,
		paymentRepo:  paymentRepo,
		invoiceRepo:  invoiceRepo,
		documentRepo: documentRepo,
		storage:      storage,
		cfg:          cfg,
	}
}

// VerifySlip sends an uploaded slip to EasySlip, runs the auto-match verdict
// against the booking's invoice, and records a payment transaction. It stops at
// auto_verified / mismatch; a staff member confirms it separately (PaymentService.Verify).
func (s *PaymentVerifyService) VerifySlip(ctx context.Context, req dto.VerifySlipRequest) (dto.VerifySlipResponse, error) {
	// The invoice holds the "expected" side (issued ref + amount) to match against.
	invoice, err := s.invoiceRepo.FindByBookingID(req.BookingID)
	if err != nil {
		return dto.VerifySlipResponse{}, err
	}

	result, err := s.readSlip(ctx, req)
	if err != nil {
		return dto.VerifySlipResponse{}, err
	}

	// Dedupe: the same bank transaction must not settle two payments.
	if result.TransRef != "" {
		if existing, _ := s.paymentRepo.FindBySlipTransRef(result.TransRef); existing != nil && existing.ID != 0 {
			return dto.VerifySlipResponse{}, ErrDuplicateSlip
		}
	}

	verdict := s.evaluate(invoice, result)

	statusName := "auto_verified"
	if len(verdict.hardReasons) > 0 {
		statusName = "mismatch"
	}
	status, err := s.paymentRepo.FindStatusByName(statusName)
	if err != nil {
		return dto.VerifySlipResponse{}, errors.New("payment status not configured: " + statusName)
	}

	slipAmount := int(math.Round(result.Amount))
	tx := &models.PaymentTransactions{
		InvoiceID:    invoice.ID,
		AmountPaid:   slipAmount,
		MethodID:     s.bankTransferMethodID(),
		StatusID:     status.ID,
		SlipTransRef: result.TransRef,
		SlipRef1:     result.Ref1,
		SlipAmount:   slipAmount,
		SlipReceiver: result.ReceiverName,
		SlipSender:   result.SenderName,
		SlipPayload:  result.Payload,
		EasySlipRaw:  result.Raw,
		ReceiverFlag: !verdict.receiverMatched,
	}
	// paid_at reflects when the money actually moved: the bank transaction time
	// read from the slip, falling back to submission time if the slip carried none.
	if !result.Date.IsZero() {
		d := result.Date
		tx.SlipPaidAt = &d
		tx.PaidAt = &d
	} else {
		now := time.Now()
		tx.PaidAt = &now
	}
	if req.DocumentID != 0 {
		docID := req.DocumentID
		tx.SlipDocumentID = &docID
	}
	if err := s.paymentRepo.Create(tx); err != nil {
		return dto.VerifySlipResponse{}, err
	}

	return dto.VerifySlipResponse{
		TransactionID:   tx.ID,
		Status:          statusName,
		TransRef:        result.TransRef,
		Ref1:            result.Ref1,
		Amount:          slipAmount,
		MatchAmount:     verdict.amountMatched,
		MatchRef:        verdict.refMatched,
		ReceiverMatched: verdict.receiverMatched,
		ReceiverFlag:    !verdict.receiverMatched,
		Reasons:         verdict.hardReasons,
	}, nil
}

// readSlip resolves the slip source (payload for testing, otherwise the uploaded
// document image fetched from storage) and calls EasySlip.
func (s *PaymentVerifyService) readSlip(ctx context.Context, req dto.VerifySlipRequest) (*easyslip.VerifyResult, error) {
	if strings.TrimSpace(req.Payload) != "" {
		return s.easyslip.VerifyByPayload(ctx, req.Payload)
	}
	if req.DocumentID == 0 {
		return nil, ErrNoSlipSource
	}

	doc, err := s.documentRepo.FindByID(req.DocumentID)
	if err != nil {
		return nil, err
	}
	obj, _, err := s.storage.Stream(ctx, doc.ObjectKey)
	if err != nil {
		return nil, err
	}
	defer obj.Close()
	image, err := io.ReadAll(obj)
	if err != nil {
		return nil, err
	}
	return s.easyslip.VerifyByImage(ctx, doc.FileName, image)
}

type verdict struct {
	amountMatched   bool
	refMatched      bool
	receiverMatched bool
	hardReasons     []string // non-empty → mismatch
}

// evaluate compares the slip against the invoice. Amount / ref / paid-before-issue
// are hard failures; a receiver-name mismatch is a soft flag for staff review.
func (s *PaymentVerifyService) evaluate(invoice *models.Invoices, r *easyslip.VerifyResult) verdict {
	var v verdict

	// The billed amount is the booking's total_price — the same source the QR was
	// generated from. invoice.total_amount is only a fallback if the booking is
	// unavailable, since the two can drift apart.
	expectedAmount := invoice.TotalAmount
	if invoice.Booking != nil {
		expectedAmount = invoice.Booking.TotalPrice
	}

	v.amountMatched = int(math.Round(r.Amount)) == expectedAmount
	if !v.amountMatched {
		v.hardReasons = append(v.hardReasons, "amount")
	}

	// Ref is only checked when the QR carried one (biller mode).
	if invoice.QRRef1 != "" {
		v.refMatched = strings.EqualFold(strings.TrimSpace(r.Ref1), invoice.QRRef1)
		if !v.refMatched {
			v.hardReasons = append(v.hardReasons, "ref1")
		}
	} else {
		v.refMatched = true
	}

	// Slip must be paid at or after the QR was issued.
	if invoice.QRIssuedAt != nil && !r.Date.IsZero() && r.Date.Before(*invoice.QRIssuedAt) {
		v.hardReasons = append(v.hardReasons, "paid_before_qr")
	}

	v.receiverMatched = receiverMatches(r.ReceiverName, s.cfg.ReceiverName)

	return v
}

func (s *PaymentVerifyService) bankTransferMethodID() uint {
	if m, err := s.paymentRepo.FindMethodByName("bank_transfer"); err == nil {
		return m.ID
	}
	return 1 // fallback to the first seeded method
}

// receiverMatches does a lenient contains-match (banks format/mask payee names
// differently). An empty expected name means "not configured" → always matches.
func receiverMatches(slipName, expected string) bool {
	expected = normalizeName(expected)
	if expected == "" {
		return true
	}
	return strings.Contains(normalizeName(slipName), expected)
}

func normalizeName(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	return strings.Join(strings.Fields(s), "") // drop all whitespace
}
