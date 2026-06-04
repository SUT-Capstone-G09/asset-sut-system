package dto

import "time"

// ── Location ────────────────────────────────────────────────────────────────

type CreateLocationRequest struct {
	ParentID    *uint   `json:"parent_id"`
	TypeID      uint    `json:"type_id" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Building    *string `json:"building"`
	ImageURL    *string `json:"image_url"`
	RoomNumber  *int    `json:"room_number"`
	FloorNumber *int    `json:"floor_number"`
	Capacity    int     `json:"capacity" binding:"required,min=0"`
	StatusID    uint    `json:"status_id" binding:"required"`
}

type UpdateLocationRequest struct {
	ParentID    *uint   `json:"parent_id"`
	TypeID      *uint   `json:"type_id"`
	Name        string  `json:"name"`
	Building    *string `json:"building"`
	ImageURL    *string `json:"image_url"`
	RoomNumber  *int    `json:"room_number"`
	FloorNumber *int    `json:"floor_number"`
	Capacity    *int    `json:"capacity"`
	StatusID    *uint   `json:"status_id"`
}

type LocationResponse struct {
	ID           uint                  `json:"id"`
	ParentID     *uint                 `json:"parent_id"`
	TypeID       uint                  `json:"type_id"`
	Type         string                `json:"type"`
	Name         string                `json:"name"`
	Building     *string               `json:"building"`
	ImageURL     *string               `json:"image_url"`
	RoomNumber   *int                  `json:"room_number"`
	FloorNumber  *int                  `json:"floor_number"`
	Capacity     int                   `json:"capacity"`
	StatusID     uint                  `json:"status_id"`
	Status       string                `json:"status"`
	PricingTiers []PricingTierResponse `json:"pricing_tiers,omitempty"`
	Equipments   []EquipmentResponse   `json:"equipments,omitempty"`
}

// ── Unavailability ──────────────────────────────────────────────────────────

type CreateUnavailabilityRequest struct {
	Date      time.Time `json:"date" binding:"required"`
	StartTime time.Time `json:"start_time" binding:"required"`
	EndTime   time.Time `json:"end_time" binding:"required"`
	Reason    string    `json:"reason"`
}

type UnavailabilityResponse struct {
	ID         uint      `json:"id"`
	LocationID uint      `json:"location_id"`
	Date       time.Time `json:"date"`
	StartTime  time.Time `json:"start_time"`
	EndTime    time.Time `json:"end_time"`
	Reason     string    `json:"reason"`
}

// ── Equipment ───────────────────────────────────────────────────────────────

type AddEquipmentRequest struct {
	EquipmentID uint `json:"equipment_id" binding:"required"`
	Quantity    int  `json:"quantity" binding:"required,min=1"`
}

type EquipmentResponse struct {
	ID          uint   `json:"id"`
	EquipmentID uint   `json:"equipment_id"`
	Name        string `json:"name"`
	Quantity    int    `json:"quantity"`
}

// ── Addon ───────────────────────────────────────────────────────────────────

type CreateAddonRequest struct {
	Name         string `json:"name" binding:"required"`
	Description  string `json:"description"`
	DefaultPrice int    `json:"default_price" binding:"min=0"`
	ChargeTypeID uint   `json:"charge_type_id" binding:"required"`
	Quantity     int    `json:"quantity" binding:"required,min=1"`
}

type AddonResponse struct {
	ID           uint   `json:"id"`
	LocationID   uint   `json:"location_id"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	DefaultPrice int    `json:"default_price"`
	ChargeTypeID uint   `json:"charge_type_id"`
	ChargeType   string `json:"charge_type"`
	Quantity     int    `json:"quantity"`
	IsActive     bool   `json:"is_active"`
}

// ── Pricing Tier ────────────────────────────────────────────────────────────

type CreatePricingTierRequest struct {
	RequesterTypeID uint `json:"requester_type_id" binding:"required"`
	RateTypeID      uint `json:"rate_type_id" binding:"required"`
	Price           int  `json:"price" binding:"required,min=0"`
}

type PricingTierResponse struct {
	ID              uint   `json:"id"`
	LocationID      uint   `json:"location_id"`
	RequesterTypeID uint   `json:"requester_type_id"`
	RequesterType   string `json:"requester_type"`
	RateTypeID      uint   `json:"rate_type_id"`
	RateType        string `json:"rate_type"`
	Price           int    `json:"price"`
}

// ── Availability ────────────────────────────────────────────────────────────

type AvailabilityQuery struct {
	Date string `form:"date" binding:"required"`
}

type AvailableSlot struct {
	Date      string `json:"date"`
	StartTime string `json:"start_time"`
	EndTime   string `json:"end_time"`
	Price     int    `json:"price"`
	Available bool   `json:"available"`
}

type MonthlyAvailabilityQuery struct {
	Year  int `form:"year"  binding:"required"`
	Month int `form:"month" binding:"required,min=1,max=12"`
}

// DayStatus: "available" | "partial" | "full"
type DayAvailability struct {
	Status       string       `json:"status"`
	BookedHours  float64      `json:"booked_hours,omitempty"`
	BookedRanges [][2]string  `json:"booked_ranges,omitempty"` // [["09:00","11:00"], ...]
}

// map[dateStr]DayAvailability  e.g. {"2026-07-01": {"status":"partial","booked_hours":2,"booked_ranges":[["09:00","11:00"]]}}
type MonthlyAvailabilityResponse = map[string]DayAvailability
