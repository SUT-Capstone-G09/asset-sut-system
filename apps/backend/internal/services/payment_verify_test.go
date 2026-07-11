package services

import (
	"testing"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/easyslip"
)

// newInvoice builds a booking(220)/invoice(qr=BK1, issued 1h ago) fixture.
func newInvoice() *models.Invoices {
	issued := time.Now().Add(-time.Hour)
	return &models.Invoices{
		TotalAmount: 150, // intentionally != booking to prove booking is the source
		QRRef1:      "BK1",
		QRIssuedAt:  &issued,
		Booking:     &models.Bookings{TotalPrice: 220},
	}
}

func svc() *PaymentVerifyService {
	return &PaymentVerifyService{cfg: config.PaymentConfig{ReceiverName: "มหาวิทยาลัยเทคโนโลยีสุรนารี"}}
}

func goodSlip() *easyslip.VerifyResult {
	return &easyslip.VerifyResult{
		Amount:       220, // matches booking.TotalPrice, NOT invoice.TotalAmount
		Ref1:         "BK1",
		ReceiverName: "มหาวิทยาลัยเทคโนโลยีสุรนารี",
		Date:         time.Now(),
	}
}

func TestEvaluate_AllMatch(t *testing.T) {
	v := svc().evaluate(newInvoice(), goodSlip())
	if len(v.hardReasons) != 0 {
		t.Errorf("hardReasons = %v, want none", v.hardReasons)
	}
	if !v.amountMatched || !v.refMatched || !v.receiverMatched {
		t.Errorf("expected all matched, got %+v", v)
	}
}

func TestEvaluate_AmountFromBookingNotInvoice(t *testing.T) {
	// Slip pays the invoice.TotalAmount (150) instead of booking.TotalPrice (220).
	slip := goodSlip()
	slip.Amount = 150
	v := svc().evaluate(newInvoice(), slip)
	if v.amountMatched {
		t.Error("amount should be compared against booking.total_price (220), not invoice.total_amount (150)")
	}
	if !hasReason(v.hardReasons, "amount") {
		t.Errorf("hardReasons = %v, want [amount]", v.hardReasons)
	}
}

func TestEvaluate_RefMismatch(t *testing.T) {
	slip := goodSlip()
	slip.Ref1 = "BK999"
	v := svc().evaluate(newInvoice(), slip)
	if v.refMatched || !hasReason(v.hardReasons, "ref1") {
		t.Errorf("expected ref1 mismatch, got %+v", v)
	}
}

func TestEvaluate_RefSkippedWhenNoQRRef(t *testing.T) {
	inv := newInvoice()
	inv.QRRef1 = "" // promptpay mode — no ref issued
	slip := goodSlip()
	slip.Ref1 = ""
	v := svc().evaluate(inv, slip)
	if !v.refMatched || hasReason(v.hardReasons, "ref1") {
		t.Errorf("ref check should be skipped when QRRef1 empty, got %+v", v)
	}
}

func TestEvaluate_PaidBeforeQRIssued(t *testing.T) {
	slip := goodSlip()
	slip.Date = time.Now().Add(-2 * time.Hour) // before QRIssuedAt (1h ago)
	v := svc().evaluate(newInvoice(), slip)
	if !hasReason(v.hardReasons, "paid_before_qr") {
		t.Errorf("hardReasons = %v, want paid_before_qr", v.hardReasons)
	}
}

func TestEvaluate_ReceiverMismatchIsSoft(t *testing.T) {
	slip := goodSlip()
	slip.ReceiverName = "นาย ใครก็ไม่รู้"
	v := svc().evaluate(newInvoice(), slip)
	if v.receiverMatched {
		t.Error("receiver should not match")
	}
	// Soft: receiver mismatch must NOT add a hard reason.
	if len(v.hardReasons) != 0 {
		t.Errorf("receiver mismatch must be soft, but hardReasons = %v", v.hardReasons)
	}
}

func TestEvaluate_ReceiverContainsMatch(t *testing.T) {
	slip := goodSlip()
	slip.ReceiverName = "  มหาวิทยาลัย เทคโนโลยี สุรนารี (สาขา) " // spaced/decorated
	if !svc().evaluate(newInvoice(), slip).receiverMatched {
		t.Error("receiver contains-match should tolerate whitespace/extra text")
	}
}

func hasReason(reasons []string, want string) bool {
	for _, r := range reasons {
		if r == want {
			return true
		}
	}
	return false
}
