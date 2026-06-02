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
