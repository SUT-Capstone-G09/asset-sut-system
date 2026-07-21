package services

import "testing"

func TestIsValidBookingTransition_AllowedPaths(t *testing.T) {
	cases := []struct{ from, to string }{
		{"pending", "approved"},
		{"pending", "rejected"},
		{"pending", "cancelled"},
		{"approved", "cancelled"},
		{"approved", "completed"},
	}
	for _, c := range cases {
		if !isValidBookingTransition(c.from, c.to) {
			t.Errorf("%s -> %s: want allowed, got blocked", c.from, c.to)
		}
	}
}

func TestIsValidBookingTransition_TerminalStatusesRejectEverything(t *testing.T) {
	terminal := []string{"rejected", "cancelled", "completed"}
	targets := []string{"pending", "approved", "rejected", "cancelled", "completed"}
	for _, from := range terminal {
		for _, to := range targets {
			if isValidBookingTransition(from, to) {
				t.Errorf("%s -> %s: want blocked (terminal status), got allowed", from, to)
			}
		}
	}
}

func TestIsValidBookingTransition_RejectsSkippingApprovalAndPayment(t *testing.T) {
	// The exact regression this guards against: a rejected/pending booking
	// jumping straight to completed, bypassing approval and payment.
	if isValidBookingTransition("rejected", "completed") {
		t.Error("rejected -> completed must be blocked")
	}
	if isValidBookingTransition("pending", "completed") {
		t.Error("pending -> completed must be blocked")
	}
}

func TestIsValidBookingTransition_SameStatusRejected(t *testing.T) {
	if isValidBookingTransition("approved", "approved") {
		t.Error("approved -> approved (no-op) must be blocked, not silently accepted")
	}
}

func TestIsValidBookingTransition_UnknownFromStatusRejected(t *testing.T) {
	if isValidBookingTransition("", "approved") {
		t.Error("empty/unknown current status must never validate a transition")
	}
}
