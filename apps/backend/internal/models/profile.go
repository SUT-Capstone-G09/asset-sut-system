package models

import (

)

type Admins struct {
	Base
	FirstName string `gorm:"not null" json:"first_name"`
	LastName string `gorm:"not null" json:"last_name"`
	Phone string `gorm:"not null" json:"phone"`
	LineID string `gorm:"not null" json:"line_id"`
	UserID uint `gorm:"not null" json:"user_id"`
}

type Staffs struct {
	Base
	FirstName string `gorm:"not null" json:"first_name"`
	LastName string `gorm:"not null" json:"last_name"`
	Phone string `gorm:"not null" json:"phone"`
	LineID string `gorm:"not null" json:"line_id"`
	UserID uint `gorm:"not null" json:"user_id"`
}

type Requesters struct {
	Base
	FirstName string `gorm:"not null" json:"first_name"`
	LastName string `gorm:"not null" json:"last_name"`
	Phone string `gorm:"not null" json:"phone"`
	LineID string `gorm:"not null" json:"line_id"`
	UserID uint `gorm:"not null" json:"user_id"`
	RequesterTypeID uint `gorm:"not null" json:"requester_type_id"`
}

type RequesterTypes struct {
	Base
	Type string `gorm:"not null" json:"type"`
	Requesters []Requesters `gorm:"foreignKey:RequesterTypeID;references:ID" json:"requesters"` // ความสัมพันธ์เเบบ 1[RequesterType] --- N[Requester]
}
