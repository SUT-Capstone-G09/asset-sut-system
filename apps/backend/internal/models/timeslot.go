package models

import (
	"time"
)

type TimeSlotStatuses struct {
	Base
	Status string `json:"status" gorm:"type:varchar(255);not null"`
	TimeSlots []TimeSlots `gorm:"foreignKey:StatusID;references:ID" json:"time_slots"` // ความสัมพันธ์เเบบ 1[TimeSlotStatus] --- N[TimeSlot]
}

type TimeSlots struct {
	Base
	LocationID uint `json:"location_id"`
	StartTime time.Time `json:"start_time"`
	EndTime time.Time `json:"end_time"`
	PriceSnapshot float64 `json:"price_snapshot"`
	BookingID uint `json:"booking_id"`
	StatusID uint `json:"status_id"`
	BookingTimeslotAddons []BookingTimeslotAddons `gorm:"foreignKey:TimeslotID" json:"booking_timeslot_addons"` // ความสัมพันธ์เเบบ 1[TimeSlot] --- N[BookingTimeslotAddon]
}

type BookingTimeslotAddons struct {
	Base
	LocationAddonID uint `json:"location_addon_id"`
	TimeslotID uint `json:"timeslot_id"`
	Name string `json:"name" gorm:"type:varchar(255);not null"`
	AppliedPrice float64 `json:"applied_price"`
	Price float64 `json:"price"`
	Quantity int `json:"quantity"`
	TotalPrice float64 `json:"total_price"`
}