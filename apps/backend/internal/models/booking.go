package models

import "gorm.io/gorm"

type Booking struct {
	gorm.Model
	RequesterID *Users         `gorm:"foreignKey:RequesterID;References:ID" json:"requester_id"`
	Purpose     string         `gorm:"not null" json:"purpose"`
	BasePrice   float64        `gorm:"not null" json:"base_price"`
	AddOnPrice  float64        `gorm:"not null" json:"add_on_price"`
	TotalPrice  float64        `gorm:"not null" json:"total_price"`
	StatusID    *BookingStatus `gorm:"foreignKey:StatusID;References:ID" json:"status_id"`
}

type BookingStatus struct {
	gorm.Model
	Status string `gorm:"not null" json:"booking_status"`
}
