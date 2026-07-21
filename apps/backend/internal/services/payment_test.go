package services

import "testing"

func TestPaymentCoversInvoice_ExactMatch(t *testing.T) {
	if !paymentCoversInvoice(1200, 1200) {
		t.Error("want covered: amount equals invoice total")
	}
}

func TestPaymentCoversInvoice_Underpaid(t *testing.T) {
	if paymentCoversInvoice(1000, 1200) {
		t.Error("want NOT covered: amount is less than invoice total")
	}
}

func TestPaymentCoversInvoice_Overpaid(t *testing.T) {
	// Consistent with evaluate()'s exact-match rule in payment_verify.go —
	// an amount that doesn't match exactly is flagged either way, not just underpayment.
	if paymentCoversInvoice(1500, 1200) {
		t.Error("want NOT covered: amount exceeds invoice total")
	}
}

func TestPaymentCoversInvoice_ZeroInvoice(t *testing.T) {
	if !paymentCoversInvoice(0, 0) {
		t.Error("want covered: zero-amount invoice paid with zero")
	}
}
