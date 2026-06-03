package models

import "gorm.io/gorm"

type Invoice struct {
	gorm.Model
	BookingID   uint    `json:"booking_id"`
	TotalAmount float64 `json:"total_amount"`
	// StatusID is a plain FK column; the InvoiceStatus association is intentionally
	// omitted so AutoMigrate only touches the invoices table (see payment.go).
	StatusID *uint `json:"status_id"`
}

type InvoiceStatus struct {
	gorm.Model
	Status string `gorm:"not null" json:"invoice_status"`
}