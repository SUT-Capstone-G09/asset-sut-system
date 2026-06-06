package models


type InvoiceStatuses struct {
	Base
	Status string `json:"status" gorm:"type:varchar(255);not null"`
	Invoices []Invoices `gorm:"foreignKey:StatusID;references:ID" json:"invoices"` // ความสัมพันธ์เเบบ 1[InvoiceStatus] --- N[Invoice]
}

type Invoices struct {
	Base
	BookingID uint `json:"booking_id"`
	StatusID uint `json:"status_id"`
	TotalAmount float64 `json:"total_amount"`
	PaymentTransactions []PaymentTransactions `gorm:"foreignKey:InvoiceID;references:ID" json:"payment_transactions"` // ความสัมพันธ์เเบบ 1[Invoice] --- N[PaymentTransaction]
}