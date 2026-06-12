package models

import (
	"time"

	"gorm.io/gorm"
)

type Payment struct {
	gorm.Model
	// Foreign keys are plain scalar columns so they can actually be set and
	// queried. Association structs are omitted on purpose to keep AutoMigrate
	// scoped to the payments table (the referenced models still use the old,
	// non-scalar FK style and are not migrated here).
	InvoiceID      uint       `gorm:"not null" json:"invoice_id"`
	Amount         float64    `gorm:"not null" json:"amount"`
	MethodID       *uint      `json:"method_id"`
	SlipDocumentID *uint      `json:"slip_document_id"`
	VerifiedByID   *uint      `json:"verified_by_id"`
	StatusID       *uint      `json:"status_id"`
	PaidAt         *time.Time `json:"paid_at"`

	// QR payment fields: the EMVCo payload string and the MinIO object key for
	// the rendered PNG. A fresh presigned URL is derived from the key on demand.
	QRPayload   string `json:"qr_payload"`
	QRObjectKey string `json:"qr_object_key"`
}

type PaymentMethod struct {
	gorm.Model
	Method string `gorm:"not null" json:"method"`
}

type PaymentStatus struct {
	gorm.Model
	Status string `gorm:"not null" json:"payment_status"`
}
