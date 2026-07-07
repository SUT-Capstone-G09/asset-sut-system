package models

import "time"

type InvoiceStatuses struct {
	Base
	Status   string     `gorm:"not null;unique" json:"status"`
	Invoices []Invoices `gorm:"foreignKey:StatusID" json:"invoices,omitempty"`
}

type Invoices struct {
	Base
	BookingID   uint             `gorm:"not null;unique" json:"booking_id"`
	Booking     *Bookings        `gorm:"foreignKey:BookingID" json:"booking,omitempty"`
	StatusID    uint             `gorm:"not null" json:"status_id"`
	Status      *InvoiceStatuses `gorm:"foreignKey:StatusID" json:"status,omitempty"`
	TotalAmount int              `gorm:"not null;default:0" json:"total_amount"`

	// ── Issued QR (the "expected" side used to match uploaded slips) ──
	// QRRef1 is the reference embedded in the QR (e.g. "BK123"); it is the key an
	// uploaded slip's ref1 is matched back to. QRObjectKey lets the image be
	// re-presigned later without regenerating the payload.
	QRRef1      string     `gorm:"index" json:"qr_ref1"`
	QRPayload   string     `json:"qr_payload"`
	QRObjectKey string     `json:"qr_object_key"`
	QRIssuedAt  *time.Time `json:"qr_issued_at"`

	Transactions []PaymentTransactions `gorm:"foreignKey:InvoiceID" json:"transactions,omitempty"`
}

type PaymentMethods struct {
	Base
	Method       string                `gorm:"not null;unique" json:"method"`
	Transactions []PaymentTransactions `gorm:"foreignKey:MethodID" json:"transactions,omitempty"`
}

type PaymentStatuses struct {
	Base
	Status       string                `gorm:"not null;unique" json:"status"`
	Transactions []PaymentTransactions `gorm:"foreignKey:StatusID" json:"transactions,omitempty"`
}

type PaymentTransactions struct {
	Base
	InvoiceID      uint             `gorm:"not null" json:"invoice_id"`
	Invoice        *Invoices        `gorm:"foreignKey:InvoiceID" json:"invoice,omitempty"`
	SlipDocumentID *uint            `json:"slip_document_id"`
	SlipDocument   *Documents       `gorm:"foreignKey:SlipDocumentID" json:"slip_document,omitempty"`
	AmountPaid     int              `gorm:"not null;default:0" json:"amount_paid"`
	MethodID       uint             `gorm:"not null" json:"method_id"`
	Method         *PaymentMethods  `gorm:"foreignKey:MethodID" json:"method,omitempty"`
	StatusID       uint             `gorm:"not null" json:"status_id"`
	Status         *PaymentStatuses `gorm:"foreignKey:StatusID" json:"status,omitempty"`

	// ── Slip verification result (from EasySlip) ──
	// SlipTransRef is the bank transaction reference; its unique index is the
	// dedupe guard that prevents the same slip being used for two payments.
	SlipTransRef string     `gorm:"uniqueIndex" json:"slip_trans_ref"`
	SlipRef1     string     `gorm:"index" json:"slip_ref1"`  // ref read from slip → matched to Invoice.QRRef1
	SlipAmount   int        `json:"slip_amount"`             // amount EasySlip read from the slip
	SlipReceiver string     `json:"slip_receiver"`           // receiver name/account printed on the slip
	SlipSender   string     `json:"slip_sender"`             // sender name printed on the slip
	SlipPaidAt   *time.Time `json:"slip_paid_at"`            // transaction datetime on the slip
	SlipPayload  string     `json:"slip_payload"`            // raw QR payload embedded in the slip (audit)
	EasySlipRaw  string     `gorm:"type:jsonb" json:"-"`     // raw EasySlip response, kept for audit
	ReceiverFlag bool       `gorm:"default:false" json:"receiver_flag"` // receiver name did not match → needs staff review

	// ── Staff confirmation ──
	VerifyBy   *uint      `json:"verify_by"`
	Verifier   *Profiles  `gorm:"foreignKey:VerifyBy;references:ID" json:"verifier,omitempty"`
	VerifyNote string     `json:"verify_note"`
	PaidAt     *time.Time `json:"paid_at"` // set when the transaction reaches "confirmed"
}
