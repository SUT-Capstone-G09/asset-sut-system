package models

type TenantProfiles struct {
	Base
	UserID            uint             `gorm:"not null;uniqueIndex" json:"user_id"`
	User              *Users           `gorm:"foreignKey:UserID;references:ID" json:"user,omitempty"`
	BusinessName      string           `gorm:"not null" json:"business_name"`
	TaxID             string           `gorm:"not null" json:"tax_id"`
	RegisteredAddress string           `gorm:"not null" json:"registered_address"`
	BannerURL         string           `json:"banner_url"`
	TenantContacts    []TenantContacts `gorm:"foreignKey:TenantProfileID" json:"tenant_contacts,omitempty"`
	TenantKYC         *TenantKYC       `gorm:"foreignKey:TenantProfileID" json:"tenant_kyc,omitempty"`
}

type TenantContacts struct {
	Base
	TenantProfileID uint   `gorm:"not null" json:"tenant_profile_id"`
	ContactName     string `gorm:"not null" json:"contact_name"`
	Position        string `json:"position"`
	Phone           string `gorm:"not null" json:"phone"`
	Email           string `gorm:"not null" json:"email"`
	IsPrimary       bool   `gorm:"default:false" json:"is_primary"`
}

type TenantKYC struct {
	Base
	TenantProfileID  uint   `gorm:"not null;uniqueIndex" json:"tenant_profile_id"`
	IdentifyCardURL  string `gorm:"not null" json:"identify_card_url"`
	CommercialRegURL string `gorm:"not null" json:"commercial_reg_url"`
	IsVerified       bool   `gorm:"default:false" json:"is_verified"`
	VerifiedBy       *uint  `json:"verified_by"`
	VerifiedByUser   *Users `gorm:"foreignKey:VerifiedBy" json:"verified_by_user,omitempty"`
	RejectReason     string `json:"reject_reason"`
}
