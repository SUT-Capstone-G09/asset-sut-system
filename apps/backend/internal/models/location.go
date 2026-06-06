package models

import (
	"time"
)

type Locations struct {
	Base
	Name		string `json:"name" gorm:"type:varchar(255);not null"`
	ParentID 	uint   `json:"parent_id"`
	RoomNumber	string `json:"room_number"`
	FloorNumber	string `json:"floor_number"`
	Capacity	int    `json:"capacity"`
	TypeID		uint   `json:"type_id"`
	StatusID 	uint   `json:"status_id"`
	Equipments []LocationEquipments `gorm:"foreignKey:LocationID" json:"equipments"` // ความสัมพันธ์เเบบ N[Location] --- N[Equipment]
	LocationUavailabilities []LocationUavailabilities `gorm:"foreignKey:LocationID" json:"location_unavailabilities"` // ความสัมพันธ์เเบบ 1[Location] --- N[LocationUnavailability]
	LocationAddons []LocationAddons `gorm:"foreignKey:LocationID" json:"location_addons"` // ความสัมพันธ์เเบบ 1[Location] --- N[LocationAddon]
	TimeSlots []TimeSlots `gorm:"foreignKey:LocationID" json:"time_slots"` // ความสัมพันธ์เเบบ 1[Location] --- N[TimeSlot]
	StaffLocations []StaffLocations `gorm:"foreignKey:LocationID" json:"staff_locations"` // ความสัมพันธ์เเบบ 1[Location] --- N[StaffLocation]
}
type StaffLocations struct {
	Base
	LocationID uint `json:"location_id"`
	StaffID uint `json:"staff_id"`
	IsActive bool `json:"is_active"`
	AssignAt time.Time `json:"assign_at"`
}

type LocationUavailabilities struct {
	Base
	LocationID uint `json:"location_id"`
	StartTime time.Time `json:"start_time"`
	EndTime time.Time `json:"end_time"`
	Reason string `json:"reason" gorm:"type:varchar(255);not null"`
}

type LocationTypes struct {
	Base
	Type string `json:"type" gorm:"type:varchar(255);not null"`
	Locations []Locations `gorm:"foreignKey:TypeID;references:ID" json:"locations"` // ความสัมพันธ์เเบบ 1[LocationType] --- N[Location]
}

type LocationStatuses struct {
	Base
	Status string `json:"status" gorm:"type:varchar(255);not null"`
	Locations []Locations `gorm:"foreignKey:StatusID;references:ID" json:"locations"` // ความสัมพันธ์เเบบ 1[LocationStatus] --- N[Location]
}

type LocationPricingTier struct {
	Base
	LocationsID uint `json:"location_id"`
	RequesterTypeID uint `json:"requester_type_id"`
	RateTypeID uint `json:"rate_type" gorm:"type:varchar(255);not null"`
	Price float64 `json:"price"`
}

type RateTypes struct {
	Base
	Type string `json:"type" gorm:"type:varchar(255);not null"`
	LocationPricingTiers []LocationPricingTier `gorm:"foreignKey:RateTypeID;references:ID" json:"location_pricing_tiers"`
}

type ChargeTypes struct {
	Base
	Type string `json:"type" gorm:"type:varchar(255);not null"`
	LocationAddons []LocationAddons `gorm:"foreignKey:ChargeTypeID;references:ID" json:"location_addons"`
}

type LocationAddons struct {
	Base
	LocationID uint `json:"location_id"`
	Name string `json:"name" gorm:"type:varchar(255);not null"`
	Description string `json:"description" gorm:"type:varchar(255);not null"`
	DefaultPrice float64 `json:"default_price"`
	ChargeTypeID uint `json:"charge_type_id"`
	IsActive bool `json:"is_active"`
	BookingTimeslotAddons []BookingTimeslotAddons `gorm:"foreignKey:LocationAddonID;references:ID" json:"booking_timeslot_addons"`
}