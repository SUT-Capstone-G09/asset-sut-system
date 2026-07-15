package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
)

type PaymentService struct {
	paymentRepo *repositories.PaymentRepository
	invoiceRepo *repositories.InvoiceRepository
	bookingRepo *repositories.BookingRepository
}

func NewPaymentService(
	paymentRepo *repositories.PaymentRepository,
	invoiceRepo *repositories.InvoiceRepository,
	bookingRepo *repositories.BookingRepository,
) *PaymentService {
	return &PaymentService{
		paymentRepo: paymentRepo,
		invoiceRepo: invoiceRepo,
		bookingRepo: bookingRepo,
	}
}

func (s *PaymentService) GetAllStatuses() ([]dto.PaymentStatusResponse, error) {
	statuses, err := s.paymentRepo.FindAllStatuses()
	if err != nil {
		return nil, err
	}
	result := make([]dto.PaymentStatusResponse, len(statuses))
	for i, st := range statuses {
		result[i] = dto.PaymentStatusResponse{ID: st.ID, Status: st.Status}
	}
	return result, nil
}

func (s *PaymentService) GetAll() ([]dto.PaymentTransactionResponse, error) {
	txs, err := s.paymentRepo.FindAll()
	if err != nil {
		return nil, err
	}
	var result []dto.PaymentTransactionResponse
	for _, tx := range txs {
		result = append(result, toPaymentResponse(tx))
	}
	return result, nil
}

func (s *PaymentService) GetByInvoiceID(invoiceID uint) ([]dto.PaymentTransactionResponse, error) {
	txs, err := s.paymentRepo.FindByInvoiceID(invoiceID)
	if err != nil {
		return nil, err
	}
	var result []dto.PaymentTransactionResponse
	for _, tx := range txs {
		result = append(result, toPaymentResponse(tx))
	}
	return result, nil
}

func (s *PaymentService) GetByID(id uint) (*dto.PaymentTransactionResponse, error) {
	tx, err := s.paymentRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	res := toPaymentResponse(*tx)
	return &res, nil
}

func (s *PaymentService) Create(userID uint, role string, req dto.CreatePaymentRequest) (*dto.PaymentTransactionResponse, error) {
	invoice, err := s.invoiceRepo.FindByID(req.InvoiceID)
	if err != nil {
		return nil, errors.New("invoice not found")
	}

	// A regular requester may only create a payment against their own
	// booking's invoice — otherwise anyone could attach a pending payment to
	// someone else's invoice for staff to (mistakenly) confirm later.
	if role != "staff" && role != "admin" {
		booking, err := s.bookingRepo.FindByID(invoice.BookingID)
		if err != nil || booking.UserID != userID {
			return nil, errors.New("invoice not found")
		}
	}

	pendingStatus, err := s.paymentRepo.FindStatusByName("pending")
	if err != nil {
		return nil, errors.New("payment status not configured")
	}

	_, err = s.paymentRepo.FindMethodByID(req.MethodID)
	if err != nil {
		return nil, errors.New("payment method not found")
	}

	now := time.Now()
	tx := &models.PaymentTransactions{
		InvoiceID:  req.InvoiceID,
		AmountPaid: req.AmountPaid,
		MethodID:   req.MethodID,
		StatusID:   pendingStatus.ID,
		PaidAt:     &now,
	}
	if err := s.paymentRepo.Create(tx); err != nil {
		return nil, err
	}
	return s.GetByID(tx.ID)
}

// paymentCoversInvoice reports whether a transaction's paid amount fully
// covers what's owed on an invoice — the same rule the EasySlip auto-verify
// path already enforces in evaluate() (payment_verify.go), applied here so
// the manual staff-verify path can't confirm an arbitrary/wrong amount.
func paymentCoversInvoice(amountPaid, invoiceTotal int) bool {
	return amountPaid == invoiceTotal
}

func (s *PaymentService) Verify(id, verifierID uint, req dto.VerifyPaymentRequest) (*dto.PaymentTransactionResponse, error) {
	tx, err := s.paymentRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("transaction not found")
	}

	// Resolve whether this verification is a "confirmed" sign-off *before*
	// touching tx or the invoice/booking, so a rejected amount mismatch
	// leaves everything untouched instead of the transaction ending up
	// marked confirmed while the invoice/booking are left stale.
	confirmedStatus, statusErr := s.paymentRepo.FindStatusByName("confirmed")
	isConfirming := statusErr == nil && req.StatusID == confirmedStatus.ID

	var invoice *models.Invoices
	if isConfirming {
		invoice, err = s.invoiceRepo.FindByID(tx.InvoiceID)
		if err != nil {
			return nil, errors.New("invoice not found")
		}
		if !paymentCoversInvoice(tx.AmountPaid, invoice.TotalAmount) {
			return nil, fmt.Errorf(
				"payment amount (%d) does not match invoice total (%d)",
				tx.AmountPaid, invoice.TotalAmount,
			)
		}
	}

	tx.StatusID = req.StatusID
	tx.VerifyBy = &verifierID
	tx.VerifyNote = req.Note
	tx.Status = nil
	if err := s.paymentRepo.Update(tx); err != nil {
		return nil, err
	}

	// If the payment reaches "confirmed" (staff/auto-verify sign-off), mark
	// the invoice as paid and the booking as completed — without this, a
	// booking stays "approved" forever after payment, so screens that gate
	// the pay button on status=="approved" (e.g. my bookings) keep offering
	// to pay again.
	if isConfirming {
		paidStatus, err := s.invoiceRepo.FindStatusByName("paid")
		if err == nil {
			invoice.StatusID = paidStatus.ID
			invoice.Status = nil
			_ = s.invoiceRepo.Update(invoice)
		}

		if completedStatus, err := s.bookingRepo.FindStatusByName("completed"); err == nil {
			if booking, err := s.bookingRepo.FindByID(invoice.BookingID); err == nil {
				oldStatusID := booking.StatusID
				booking.StatusID = completedStatus.ID
				booking.Status = nil
				if err := s.bookingRepo.Update(booking); err == nil {
					_ = s.bookingRepo.CreateStatusLog(&models.BookingStatusLogs{
						BookingID:    booking.ID,
						FromStatusID: &oldStatusID,
						ToStatusID:   completedStatus.ID,
						ChangedBy:    verifierID,
						ChangedAt:    time.Now(),
						Note:         "ชำระเงินสำเร็จ",
					})
				}
			}
		}
	}

	return s.GetByID(tx.ID)
}

func (s *PaymentService) AttachSlip(txID, docID uint) error {
	tx, err := s.paymentRepo.FindByID(txID)
	if err != nil {
		return errors.New("transaction not found")
	}
	tx.SlipDocumentID = &docID
	return s.paymentRepo.Update(tx)
}

func toPaymentResponse(tx models.PaymentTransactions) dto.PaymentTransactionResponse {
	res := dto.PaymentTransactionResponse{
		ID:             tx.ID,
		InvoiceID:      tx.InvoiceID,
		AmountPaid:     tx.AmountPaid,
		StatusID:       tx.StatusID,
		SlipDocumentID: tx.SlipDocumentID,
		VerifyBy:       tx.VerifyBy,
		VerifyNote:     tx.VerifyNote,
		PaidAt:         tx.PaidAt,
		CreatedAt:      tx.CreatedAt,
	}
	if tx.Method != nil {
		res.Method = tx.Method.Method
	}
	if tx.Status != nil {
		res.Status = tx.Status.Status
	}
	if tx.Verifier != nil && tx.Verifier.Profiles != nil {
		res.VerifierName = tx.Verifier.Profiles.FirstName + " " + tx.Verifier.Profiles.LastName
	}
	if tx.Invoice != nil {
		res.BookingID = tx.Invoice.BookingID
		if tx.Invoice.Booking != nil {
			b := tx.Invoice.Booking
			if b.User != nil {
				if b.User.Profiles != nil {
					res.UserName = b.User.Profiles.FirstName + " " + b.User.Profiles.LastName
				} else {
					res.UserName = b.User.Email
				}
			}
			if len(b.Timeslots) > 0 && b.Timeslots[0].Location != nil {
				res.LocationName = b.Timeslots[0].Location.Name
			}
		}
	}
	return res
}
