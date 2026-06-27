package models

import "time"

type InvoiceStatuses struct {
	Base
	Status   string     `gorm:"not null;unique" json:"status"`
	Invoices []Invoices `gorm:"foreignKey:StatusID" json:"invoices,omitempty"`
}

type Invoices struct {
	Base
	BookingID    uint                  `gorm:"not null;unique" json:"booking_id"`
	Booking      *Bookings             `gorm:"foreignKey:BookingID" json:"booking,omitempty"`
	StatusID     uint                  `gorm:"not null" json:"status_id"`
	Status       *InvoiceStatuses      `gorm:"foreignKey:StatusID" json:"status,omitempty"`
	TotalAmount  int                   `gorm:"not null;default:0" json:"total_amount"`
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
	VerifyBy       *uint            `json:"verify_by"`
	Verifier       *Profiles        `gorm:"foreignKey:VerifyBy;references:ID" json:"verifier,omitempty"`
	PaidAt         *time.Time       `json:"paid_at"`
}
