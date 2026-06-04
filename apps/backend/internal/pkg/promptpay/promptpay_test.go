package promptpay

import (
	"fmt"
	"strings"
	"testing"
)

// 0x29B1 is the published check value for CRC-16/CCITT-FALSE over "123456789".
func TestCRC16CheckValue(t *testing.T) {
	if got := crc16("123456789"); got != 0x29B1 {
		t.Fatalf("crc16(\"123456789\") = %04X, want 29B1", got)
	}
}

func TestTLV(t *testing.T) {
	if got := tlv("00", "01"); got != "000201" {
		t.Fatalf("tlv = %q, want 000201", got)
	}
	if got := tlv("29", "A0"); got != "2902A0" {
		t.Fatalf("tlv = %q, want 2902A0", got)
	}
}

// assertCRC re-derives the checksum from the payload body and checks it matches
// the trailing 4 hex digits, validating the whole assembly path.
func assertCRC(t *testing.T, payload string) {
	t.Helper()
	if len(payload) < 8 {
		t.Fatalf("payload too short: %q", payload)
	}
	body, sum := payload[:len(payload)-4], payload[len(payload)-4:]
	want := fmt.Sprintf("%04X", crc16(body))
	if sum != want {
		t.Fatalf("crc mismatch: got %s want %s for %q", sum, want, payload)
	}
}

func TestBuildPromptPayPayload(t *testing.T) {
	payload, err := BuildPromptPayPayload("0899999999", "SUT", "Nakhon Ratchasima", "150")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	assertCRC(t, payload)
	if !strings.HasPrefix(payload, "000201") {
		t.Errorf("payload should start with payload-format 000201: %q", payload)
	}
	// Dynamic (amount present) => point-of-initiation tag 01 value "12".
	if !strings.HasPrefix(payload, "000201010212") {
		t.Errorf("expected dynamic point-of-init 010212: %q", payload)
	}
	if !strings.Contains(payload, "5303764") { // currency THB
		t.Errorf("missing currency field: %q", payload)
	}
	if !strings.Contains(payload, "5406150.00") { // amount tag 54, value "150.00" (len 6)
		t.Errorf("missing/incorrect amount field: %q", payload)
	}
	// phone 0899999999 -> 0066899999999 embedded under tag 01.
	if !strings.Contains(payload, "0066899999999") {
		t.Errorf("phone not normalized into payload: %q", payload)
	}
}

func TestBuildPromptPayPayloadNoAmount(t *testing.T) {
	payload, err := BuildPromptPayPayload("1234567890123", "SUT", "City", "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	assertCRC(t, payload)
	// Static (no amount) => point-of-initiation value "11".
	if !strings.HasPrefix(payload, "000201010211") {
		t.Errorf("expected static point-of-init 010211: %q", payload)
	}
	if strings.Contains(payload, "5406") || strings.Contains(payload, "5407") {
		t.Errorf("amount field should be absent: %q", payload)
	}
	// 13-digit id uses tag 02.
	if !strings.Contains(payload, "02131234567890123") {
		t.Errorf("national id not encoded under tag 02: %q", payload)
	}
}

func TestBuildBillerPayload(t *testing.T) {
	payload, err := BuildBillerPayload("123456789012345", "INV001", "", "SUT", "City", "99.5")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	assertCRC(t, payload)
	if !strings.Contains(payload, "540599.50") { // amount tag 54, value "99.50" (len 5)
		t.Errorf("amount 99.50 not encoded: %q", payload)
	}
	if !strings.Contains(payload, "INV001") {
		t.Errorf("reference1 missing: %q", payload)
	}
}

func TestPromptPayValidation(t *testing.T) {
	cases := []struct{ id string }{
		{""}, {"abc"}, {"123"}, {"1999999999"}, // bad: empty/non-digit/short/no-leading-zero
	}
	for _, c := range cases {
		if _, err := BuildPromptPayPayload(c.id, "SUT", "City", ""); err == nil {
			t.Errorf("expected error for promptpay id %q", c.id)
		}
	}
}

func TestNormalizeAmount(t *testing.T) {
	cases := map[string]string{
		"":       "",
		"150":    "150.00",
		"150.5":  "150.50",
		"0.99":   "0.99",
		".5":     "0.50",
		"007":    "7.00",
	}
	for in, want := range cases {
		got, err := normalizeAmount(in)
		if err != nil {
			t.Errorf("normalizeAmount(%q) error: %v", in, err)
			continue
		}
		if got != want {
			t.Errorf("normalizeAmount(%q) = %q, want %q", in, got, want)
		}
	}
	if _, err := normalizeAmount("1.234"); err == nil {
		t.Error("expected error for >2 decimals")
	}
}
