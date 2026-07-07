package dto

import "time"

// ── Invoice ──────────────────────────────────────────────────────────────────

type InvoiceResponse struct {
	ID          uint      `json:"id"`
	BookingID   uint      `json:"booking_id"`
	Status      string    `json:"status"`
	StatusID    uint      `json:"status_id"`
	TotalAmount int       `json:"total_amount"`
	CreatedAt   time.Time `json:"created_at"`
}

// ── Payment Transaction ───────────────────────────────────────────────────────

type CreatePaymentRequest struct {
	InvoiceID  uint `json:"invoice_id" binding:"required"`
	AmountPaid int  `json:"amount_paid" binding:"required,min=1"`
	MethodID   uint `json:"method_id" binding:"required"`
}

type VerifyPaymentRequest struct {
	StatusID uint   `json:"status_id" binding:"required"`
	Note     string `json:"note"`
}

// PaymentStatusResponse lets clients resolve a status name (e.g. "confirmed")
// to its current ID instead of hardcoding IDs that shift with the seed order.
type PaymentStatusResponse struct {
	ID     uint   `json:"id"`
	Status string `json:"status"`
}

type PaymentTransactionResponse struct {
	ID             uint       `json:"id"`
	InvoiceID      uint       `json:"invoice_id"`
	BookingID      uint       `json:"booking_id"`
	UserName       string     `json:"user_name"`
	LocationName   string     `json:"location_name"`
	AmountPaid     int        `json:"amount_paid"`
	Method         string     `json:"method"`
	Status         string     `json:"status"`
	StatusID       uint       `json:"status_id"`
	SlipDocumentID *uint      `json:"slip_document_id"`
	VerifyBy       *uint      `json:"verify_by"`
	VerifierName   string     `json:"verifier_name"`
	PaidAt         *time.Time `json:"paid_at"`
	CreatedAt      time.Time  `json:"created_at"`
}

// ── QR Payment ───────────────────────────────────────────────────────────────

type GenerateQRRequest struct {
	BookingID uint   `json:"booking_id" binding:"required"`
	Mode      string `json:"mode"`
}

type GenerateQRResponse struct {
	BookingID uint    `json:"booking_id"`
	Amount    float64 `json:"amount"`
	Payload   string  `json:"payload"`
	QRCodeURL string  `json:"qr_code_url"`
	ExpiresIn int     `json:"expires_in"`
}

// ── Slip verification (EasySlip) ──────────────────────────────────────────────

// VerifySlipRequest identifies the slip to verify. Provide either DocumentID (an
// already-uploaded slip, fetched from storage) or Payload (the QR string decoded
// from a slip, useful for testing).
type VerifySlipRequest struct {
	BookingID  uint   `json:"booking_id" binding:"required"`
	DocumentID uint   `json:"document_id"`
	Payload    string `json:"payload"`
}

type VerifySlipResponse struct {
	TransactionID   uint     `json:"transaction_id"`
	Status          string   `json:"status"` // auto_verified | mismatch
	TransRef        string   `json:"trans_ref"`
	Ref1            string   `json:"ref1"`
	Amount          int      `json:"amount"`
	MatchAmount     bool     `json:"match_amount"`
	MatchRef        bool     `json:"match_ref"`
	ReceiverMatched bool     `json:"receiver_matched"`
	ReceiverFlag    bool     `json:"receiver_flag"` // true = payee mismatch, needs staff review
	Reasons         []string `json:"reasons,omitempty"`
}
