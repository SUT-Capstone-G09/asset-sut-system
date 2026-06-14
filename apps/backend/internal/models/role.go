package models

type Roles struct {
	Base
	Name        string        `gorm:"unique;not null" json:"name"`
	Users       []Users       `gorm:"many2many:user_roles" json:"users"`
	Permissions []Permissions `gorm:"many2many:role_permissions" json:"permissions"`
}
