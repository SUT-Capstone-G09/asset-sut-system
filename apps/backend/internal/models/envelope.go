package models

import "time"

// EnvelopeStatus defines allowed values for DocumentEnvelopes.Status
type EnvelopeStatus string

const (
	EnvelopeStatusDraft       EnvelopeStatus = "draft"
	EnvelopeStatusOnSale      EnvelopeStatus = "on_sale"
	EnvelopeStatusUnavailable EnvelopeStatus = "unavailable"
	EnvelopeStatusArchived    EnvelopeStatus = "archived"
)

type DocumentEnvelopes struct {
	Base
	Title            string         `gorm:"not null"`
	Price            int            `gorm:"not null;default:0"`
	FilePath         string         `gorm:"not null"`
	IsOnlineDelivery bool           `gorm:"default:false"`
	Note             string         `gorm:"type:text"`
	Status           EnvelopeStatus `gorm:"type:varchar(20);not null;default:'draft'"`
	AreaID           uint           `gorm:"not null"`
	Area             *Areas         `gorm:"foreignKey:AreaID" json:"area,omitempty"`

	Orders []EnvelopeOrders `gorm:"foreignKey:EnvelopeID" json:"orders,omitempty"`
}

type EnvelopeOrders struct {
	Base
	EnvelopeID uint               `gorm:"not null"`
	Envelope   *DocumentEnvelopes `gorm:"foreignKey:EnvelopeID" json:"envelope,omitempty"`

	UserID uint   `gorm:"not null"`
	User   *Users `gorm:"foreignKey:UserID" json:"user,omitempty"`

	OrderDate   time.Time `gorm:"not null"`
	TotalAmount int       `gorm:"not null;default:0"`
	OrderStatus string    `gorm:"not null;default:'pending'"`

	Payment  *EnvelopePayments `gorm:"foreignKey:EnvelopeOrderID" json:"payment,omitempty"`
	Delivery *OrderDeliveries  `gorm:"foreignKey:EnvelopeOrderID" json:"delivery,omitempty"`
	Receipt  *Receipts         `gorm:"foreignKey:EnvelopeOrderID" json:"receipt,omitempty"`
}

type EnvelopePayments struct {
	Base
	EnvelopeOrderID uint            `gorm:"not null"`
	EnvelopeOrder   *EnvelopeOrders `gorm:"foreignKey:EnvelopeOrderID" json:"envelope_order,omitempty"`

	SlipImage    string `gorm:"not null"`
	Status       string `gorm:"not null;default:'pending'"`
	PaidAt       *time.Time
	VerifiedAt   *time.Time
	RejectReason string `gorm:"type:text"`

	VerifyBy *uint  `json:"verify_by"`
	Verifier *Users `gorm:"foreignKey:VerifyBy;references:ID" json:"verifier,omitempty"`
}

type OrderDeliveries struct {
	Base
	EnvelopeOrderID uint            `gorm:"not null"`
	EnvelopeOrder   *EnvelopeOrders `gorm:"foreignKey:EnvelopeOrderID" json:"envelope_order,omitempty"`

	DeliveryMethod string `gorm:"not null;default:'pickup'"`
	DeliveryStatus string `gorm:"not null;default:'pending'"`
	PickupDate     *time.Time
}

type Receipts struct {
	Base
	EnvelopeOrderID uint            `gorm:"not null"`
	EnvelopeOrder   *EnvelopeOrders `gorm:"foreignKey:EnvelopeOrderID" json:"envelope_order,omitempty"`
	ReceiptImage    string          `gorm:"not null"`
	UploadedAt      *time.Time      `gorm:"not null"`
	UploadedByID    uint            `gorm:"not null"`
	UploadedBy      *Users          `gorm:"foreignKey:UploadedByID;references:ID" json:"uploaded_by,omitempty"`
}
