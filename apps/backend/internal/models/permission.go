package models

type Permissions struct {
	Base
	Module      string  `gorm:"not null" json:"module"`
	Action      string  `gorm:"not null" json:"action"`
	Roles       []Roles `gorm:"many2many:role_permissions" json:"roles,omitempty"`
	Users       []Users `gorm:"many2many:user_permissions" json:"users,omitempty"`
}
