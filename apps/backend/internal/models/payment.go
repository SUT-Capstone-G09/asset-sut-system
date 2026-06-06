package models

import (
	"time"
)

type PaymentStatuses struct {
	Base
	Status string `json:"status" gorm:"type:varchar(255);not null"`
	PaymentTransactions []PaymentTransactions `gorm:"foreignKey:StatusID;references:ID" json:"payment_transactions"` // ความสัมพันธ์เเบบ 1[PaymentStatus] --- N[PaymentTransaction]
}

type PaymentMethods struct {
	Base
	Method string `json:"method" gorm:"type:varchar(255);not null"`
	PaymentTransactions []PaymentTransactions `gorm:"foreignKey:MethodID;references:ID" json:"payment_transactions"` // ความสัมพันธ์เเบบ 1[PaymentMethod] --- N[PaymentTransaction]
}

type PaymentTransactions struct {
	Base
	InvoiceID uint `json:"invoice_id"`
	Slip_DocumentID uint `json:"slip_document_id"`
	StatusID uint `json:"status_id"`
	MethodID uint `json:"method_id"`
	Amount float64 `json:"amount"`
	VerifyBy uint `json:"verify_by"`
	PaidAt *time.Time `json:"paid_at"`
}