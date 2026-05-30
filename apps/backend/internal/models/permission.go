package models

import (

)

type Permissions struct {
	Base
	Module string `gorm:"not null" json:"module"`
	Action string `gorm:"not null" json:"action"`
	Roles []Roles `gorm:"many2many:role_permissions" json:"roles"` // ความสัมพันธ์เเบบ N[Permission] --- N[Role]
}