package models

import "time"

type BusinessTypes struct {
	Base
	Name string `gorm:"not null;unique" json:"name"`
}

type Contracts struct {
	Base
	ContractNo       string             `gorm:"not null;unique" json:"contract_no"`
	ContractType     string             `gorm:"not null" json:"contract_type"` // เช่น "monthly", "yearly"
	StartDate        time.Time          `gorm:"not null" json:"start_date"`
	EndDate          time.Time          `gorm:"not null" json:"end_date"`
	Rental           float64            `gorm:"not null;default:0" json:"rental"`      // ค่าบำรุงรายเดือน
	Deposit          float64            `gorm:"not null;default:0" json:"deposit"`     // หลักประกัน
	Scholarship      float64            `gorm:"not null;default:0" json:"scholarship"` // ทุนการศึกษา
	Terms            string             `gorm:"type:text" json:"terms"`                // เงื่อนไข
	Note             string             `gorm:"type:text" json:"note"`                 // หมายเหตุ
	DocumentURL      string             `json:"document_url"`
	Status           string             `gorm:"not null;default:'draft'" json:"status"` // เช่น draft, active, expired
	RentalSpaceID    uint               `gorm:"not null" json:"rental_space_id"`       // พื้นที่เช่าที่ผูกกับสัญญา
	RentalSpace      *RentalSpaces      `gorm:"foreignKey:RentalSpaceID" json:"rental_space,omitempty"`
	TenantProfileID  uint               `gorm:"not null" json:"tenant_profile_id"`
	TenantProfile    *TenantProfiles    `gorm:"foreignKey:TenantProfileID" json:"tenant_profile,omitempty"`
	BusinessTypeID   uint               `gorm:"not null" json:"business_type_id"`
	BusinessType     *BusinessTypes     `gorm:"foreignKey:BusinessTypeID" json:"business_type,omitempty"`
	ContractInvoices []ContractInvoices `gorm:"foreignKey:ContractID" json:"contract_invoices,omitempty"`
}

type ContractHistory struct {
	Base
	ContractID     uint       `gorm:"not null" json:"contract_id"`
	Contract       *Contracts `gorm:"foreignKey:ContractID" json:"contract,omitempty"`
	ActionType     string     `gorm:"not null" json:"action_type"` // เช่น renew, terminate, approve
	PreviousStatus string     `json:"previous_status"`
	NewStatus      string     `gorm:"not null" json:"new_status"`
	ChangedBy      uint       `gorm:"not null" json:"changed_by"`
	ChangedByUser  *Users     `gorm:"foreignKey:ChangedBy" json:"changed_by_user,omitempty"`
	Reason         string     `json:"reason"`
}

type ContractInvoices struct {
	Base
	InvoiceNo     string           `gorm:"unique;not null" json:"invoice_no"`
	BillingPeriod time.Time        `gorm:"type:date;not null" json:"billing_period"`
	RentalAmount  float64          `gorm:"not null;default:0" json:"rental_amount"`
	UtilityAmount float64          `gorm:"not null;default:0" json:"utility_amount"`
	OtherAmount   float64          `gorm:"not null;default:0" json:"other_amount"`
	TotalAmount   float64          `gorm:"not null;default:0" json:"total_amount"`
	InvoiceFile   string           `json:"invoice_file"`
	Note          string           `json:"note"`
	ContractID    uint             `gorm:"not null" json:"contract_id"`
	Contract      *Contracts       `gorm:"foreignKey:ContractID" json:"contract,omitempty"`
	StatusID      uint             `gorm:"not null" json:"status_id"`
	Status        *InvoiceStatuses `gorm:"foreignKey:StatusID" json:"status,omitempty"`
}
