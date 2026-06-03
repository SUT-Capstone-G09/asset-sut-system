package models

type Users struct {
	Base
	Email        string        `gorm:"unique;not null" json:"email"`
	Password     string        `gorm:"not null" json:"-"`
	AuthProvider string        `gorm:"not null" json:"auth_provider"`
	ProviderID   string        `gorm:"not null" json:"provider_id"`
	IsActive     bool          `gorm:"default:true" json:"is_active"`
	Admin        *Admins       `gorm:"foreignKey:UserID;references:ID" json:"admin,omitempty"`
	Staff        *Staffs       `gorm:"foreignKey:UserID;references:ID" json:"staff,omitempty"`
	Requester    *Requesters   `gorm:"foreignKey:UserID;references:ID" json:"requester,omitempty"`
	Roles        []Roles       `gorm:"many2many:user_roles" json:"roles"`
	Permissions  []Permissions `gorm:"many2many:user_permissions" json:"permissions"`
}
