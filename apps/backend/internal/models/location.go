package models

import "time"

type LocationTypes struct {
	Base
	Type      string      `gorm:"not null;unique" json:"type"`
	Locations []Locations `gorm:"foreignKey:TypeID" json:"locations,omitempty"`
}

type LocationStatuses struct {
	Base
	Status    string      `gorm:"not null;unique" json:"status"`
	Locations []Locations `gorm:"foreignKey:StatusID" json:"locations,omitempty"`
}

type Locations struct {
	Base
	ParentID       *uint              `json:"parent_id"`
	Parent         *Locations         `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children       []Locations        `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	TypeID         uint               `gorm:"not null" json:"type_id"`
	Type           *LocationTypes     `gorm:"foreignKey:TypeID" json:"type,omitempty"`
	Name           string             `gorm:"not null" json:"name"`
	Building       *string            `json:"building"`
	ImageURL       *string            `json:"image_url"`
	RoomNumber     *int               `json:"room_number"`
	FloorNumber    *int               `json:"floor_number"`
	Capacity       int                `gorm:"not null;default:0" json:"capacity"`
	StatusID       uint               `gorm:"not null" json:"status_id"`
	Status         *LocationStatuses  `gorm:"foreignKey:StatusID" json:"status,omitempty"`
	Equipments     []LocationEquipments  `gorm:"foreignKey:LocationID" json:"equipments,omitempty"`
	Addons         []LocationAddons      `gorm:"foreignKey:LocationID" json:"addons,omitempty"`
	PricingTiers   []LocationPricingTiers `gorm:"foreignKey:LocationID" json:"pricing_tiers,omitempty"`
	Unavailabilities []LocationUnavailabilities `gorm:"foreignKey:LocationID" json:"unavailabilities,omitempty"`
	StaffLocations []StaffLocations   `gorm:"foreignKey:LocationID" json:"staff_locations,omitempty"`
}

type StaffLocations struct {
	UserID     uint       `gorm:"primaryKey" json:"user_id"`
	LocationID uint       `gorm:"primaryKey" json:"location_id"`
	User       *Users     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Location   *Locations `gorm:"foreignKey:LocationID" json:"location,omitempty"`
}

type LocationUnavailabilities struct {
	Base
	LocationID uint       `gorm:"not null" json:"location_id"`
	Location   *Locations `gorm:"foreignKey:LocationID" json:"location,omitempty"`
	Date       time.Time  `gorm:"type:date;not null" json:"date"`
	StartTime  time.Time  `gorm:"type:time;not null" json:"start_time"`
	EndTime    time.Time  `gorm:"type:time;not null" json:"end_time"`
	Reason     string     `json:"reason"`
}

type Equipments struct {
	Base
	Name              string               `gorm:"not null;unique" json:"name"`
	LocationEquipments []LocationEquipments `gorm:"foreignKey:EquipmentID" json:"location_equipments,omitempty"`
}

type LocationEquipments struct {
	Base
	LocationID  uint        `gorm:"not null" json:"location_id"`
	Location    *Locations  `gorm:"foreignKey:LocationID" json:"location,omitempty"`
	EquipmentID uint        `gorm:"not null" json:"equipment_id"`
	Equipment   *Equipments `gorm:"foreignKey:EquipmentID" json:"equipment,omitempty"`
	Quantity    int         `gorm:"not null;default:1" json:"quantity"`
}

type ChargeTypes struct {
	Base
	Type           string           `gorm:"not null;unique" json:"type"`
	LocationAddons []LocationAddons `gorm:"foreignKey:ChargeTypeID" json:"location_addons,omitempty"`
}

type LocationAddons struct {
	Base
	LocationID   uint         `gorm:"not null" json:"location_id"`
	Location     *Locations   `gorm:"foreignKey:LocationID" json:"location,omitempty"`
	Name         string       `gorm:"not null" json:"name"`
	Description  string       `json:"description"`
	DefaultPrice int          `gorm:"not null;default:0" json:"default_price"`
	ChargeTypeID uint         `gorm:"not null" json:"charge_type_id"`
	ChargeType   *ChargeTypes `gorm:"foreignKey:ChargeTypeID" json:"charge_type,omitempty"`
	Quantity     int          `gorm:"not null;default:1" json:"quantity"`
	IsActive     bool         `gorm:"default:true" json:"is_active"`
}

type RateTypes struct {
	Base
	Type          string                  `gorm:"not null;unique" json:"type"`
	PricingTiers  []LocationPricingTiers  `gorm:"foreignKey:RateTypeID" json:"pricing_tiers,omitempty"`
}

type LocationPricingTiers struct {
	Base
	LocationID      uint            `gorm:"not null" json:"location_id"`
	Location        *Locations      `gorm:"foreignKey:LocationID" json:"location,omitempty"`
	RequesterTypeID uint            `gorm:"not null" json:"requester_type_id"`
	RequesterType   *RequesterTypes `gorm:"foreignKey:RequesterTypeID" json:"requester_type,omitempty"`
	RateTypeID      uint            `gorm:"not null" json:"rate_type_id"`
	RateType        *RateTypes      `gorm:"foreignKey:RateTypeID" json:"rate_type,omitempty"`
	Price           int             `gorm:"not null;default:0" json:"price"`
}
