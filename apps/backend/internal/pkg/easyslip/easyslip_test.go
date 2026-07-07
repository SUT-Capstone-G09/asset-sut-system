package easyslip

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

// v2Body is a real-shaped EasySlip V2 response (slip nested under data.rawSlip).
const v2Body = `{
  "success": true,
  "data": {
    "isDuplicate": false,
    "amountInSlip": 1500.00,
    "isAmountMatched": true,
    "rawSlip": {
      "payload": "0000",
      "transRef": "68370160657749I376388B35",
      "date": "2024-01-15T14:30:00+07:00",
      "amount": { "amount": 1500.00, "local": { "amount": 1500.00, "currency": "THB" } },
      "ref1": "BK1", "ref2": "", "ref3": "",
      "sender":   { "bank": { "id": "004" }, "account": { "name": { "th": "นาย ผู้โอน ทดสอบ", "en": "MR. SENDER TEST" } } },
      "receiver": { "bank": { "id": "014" }, "account": { "name": { "th": "บริษัท ตัวอย่าง จำกัด" } } }
    }
  },
  "message": "Bank slip verified successfully"
}`

// v1Body is a real-shaped EasySlip V1 response (slip fields inline on data).
const v1Body = `{
  "status": 200,
  "data": {
    "payload": "0041",
    "transRef": "016187222737BPP02141",
    "date": "2026-07-06T22:27:37+07:00",
    "amount": { "amount": 10, "local": { "amount": 10, "currency": "764" } },
    "ref1": "", "ref2": "", "ref3": "",
    "sender":   { "bank": { "id": "004" }, "account": { "name": { "th": "นาย ธานัท ว" } } },
    "receiver": { "bank": {}, "account": { "name": { "th": "นาย ธานัท ว" } } }
  }
}`

func newTestClient(body string) (*Client, *httptest.Server) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(body))
	}))
	return New("test-key", srv.URL), srv
}

func TestVerify_V2_RawSlipNesting(t *testing.T) {
	client, srv := newTestClient(v2Body)
	defer srv.Close()

	res, err := client.VerifyByPayload(context.Background(), "x")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if res.TransRef != "68370160657749I376388B35" {
		t.Errorf("TransRef = %q, want the V2 transRef", res.TransRef)
	}
	if res.Amount != 1500 {
		t.Errorf("Amount = %v, want 1500", res.Amount)
	}
	if res.Ref1 != "BK1" {
		t.Errorf("Ref1 = %q, want BK1", res.Ref1)
	}
	if res.ReceiverName != "บริษัท ตัวอย่าง จำกัด" {
		t.Errorf("ReceiverName = %q", res.ReceiverName)
	}
	if res.SenderName != "นาย ผู้โอน ทดสอบ" {
		t.Errorf("SenderName = %q", res.SenderName)
	}
	if res.Date.IsZero() {
		t.Error("Date not parsed")
	}
}

func TestVerify_V1_InlineSlip(t *testing.T) {
	client, srv := newTestClient(v1Body)
	defer srv.Close()

	res, err := client.VerifyByPayload(context.Background(), "x")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if res.TransRef != "016187222737BPP02141" {
		t.Errorf("TransRef = %q, want the V1 transRef", res.TransRef)
	}
	if res.Amount != 10 {
		t.Errorf("Amount = %v, want 10", res.Amount)
	}
	if res.Ref1 != "" {
		t.Errorf("Ref1 = %q, want empty", res.Ref1)
	}
	if res.ReceiverName != "นาย ธานัท ว" {
		t.Errorf("ReceiverName = %q", res.ReceiverName)
	}
}

func TestVerify_V2_NestedError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"success":false,"error":{"code":"DUPLICATE_SLIP","message":"duplicate_slip"}}`))
	}))
	defer srv.Close()

	client := New("k", srv.URL)
	_, err := client.VerifyByPayload(context.Background(), "x")
	apiErr, ok := err.(*APIError)
	if !ok {
		t.Fatalf("err type = %T, want *APIError", err)
	}
	if apiErr.Message != "duplicate_slip" {
		t.Errorf("Message = %q, want duplicate_slip (from error.message)", apiErr.Message)
	}
}

func TestVerify_NotConfigured(t *testing.T) {
	client := New("", "")
	if _, err := client.VerifyByPayload(context.Background(), "x"); err != ErrNotConfigured {
		t.Errorf("err = %v, want ErrNotConfigured", err)
	}
}

func TestVerify_APIError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"status":400,"message":"duplicate_slip"}`))
	}))
	defer srv.Close()

	client := New("k", srv.URL)
	_, err := client.VerifyByPayload(context.Background(), "x")
	apiErr, ok := err.(*APIError)
	if !ok {
		t.Fatalf("err type = %T, want *APIError", err)
	}
	if apiErr.Message != "duplicate_slip" {
		t.Errorf("Message = %q, want duplicate_slip", apiErr.Message)
	}
}
