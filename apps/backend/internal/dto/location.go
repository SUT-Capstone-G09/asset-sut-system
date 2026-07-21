package dto

import "time"

// ── Location ────────────────────────────────────────────────────────────────

type CreateLocationRequest struct {
	ParentID    *uint   `json:"parent_id"`
	TypeID      uint    `json:"type_id" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Description *string `json:"description"`
	BuildingID  *uint   `json:"building_id"`
	ImageURL    *string `json:"image_url"`
	RoomNumber  *int    `json:"room_number"`
	FloorNumber *int    `json:"floor_number"`
	// ห้าม required: validator ถือว่า int 0 = ไม่ส่งมา แต่โถงไม่มีความจุจึงส่ง 0 เสมอ
	Capacity int  `json:"capacity" binding:"min=0"`
	StatusID uint `json:"status_id" binding:"required"`
}

type UpdateLocationRequest struct {
	ParentID    *uint   `json:"parent_id"`
	TypeID      *uint   `json:"type_id"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
	BuildingID  *uint   `json:"building_id"`
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
	Description  *string               `json:"description"`
	BuildingID   *uint                 `json:"building_id"`
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

// ── Hall Pricing (ราคาเฉพาะโถง / ทำเลทอง) ────────────────────────────────────

// LocationHallPricingResponse = ราคาของโถงหนึ่ง 1 วัตถุประสงค์ (ประกอบจากราคาอาคาร + override ของโถง)
type LocationHallPricingResponse struct {
	HallUsagePurposeID uint   `json:"hall_usage_purpose_id"`
	PurposeName        string `json:"purpose_name"`
	PricingModel       string `json:"pricing_model"`
	BuildingPrice      float64    `json:"building_price"`  // ราคาอาคาร = ขั้นต่ำ (fallback DefaultPrice ถ้าอาคารยังไม่ตั้ง)
	OverridePrice      *float64	   `json:"override_price"`  // ราคาเฉพาะโถง ; null = ไม่ได้ตั้ง
	EffectivePrice     float64 `json:"effective_price"` // ราคาที่ใช้จริง = max(building, override)
	IsActive           bool   `json:"is_active"`       // อาคารเปิดให้ขอวัตถุประสงค์นี้หรือไม่
}

// UpdateLocationHallPricingsRequest = แอดมินตั้ง/แก้ราคาเฉพาะโถง (bulk upsert รายวัตถุประสงค์)
type UpdateLocationHallPricingsRequest struct {
	Pricings []LocationHallPricingInput `json:"pricings" binding:"required,min=1,dive"`
}

type LocationHallPricingInput struct {
	HallUsagePurposeID uint `json:"hall_usage_purpose_id" binding:"required"`
	// Price = ราคาเฉพาะโถง ; nil = ล้าง override กลับไปใช้ราคาอาคาร
	// ห้ามใส่ binding:"required" — validator ถือว่า int 0 คือไม่ได้ส่งมา
	Price *float64 `json:"price"`
}

// ── Hall Floor Plan ─────────────────────────────────────────────────────────

type OverlayDTO struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
	W float64 `json:"w"`
	H float64 `json:"h"`
}

// UpsertHallFloorPlanRequest — บันทึก/แทนที่ผังพื้นที่ของโถงทั้งชุด
// TopViewImage = object_key ของรูปที่เพิ่งอัปโหลด; ถ้าเป็น URL (http) หรือ null = คงรูปเดิมไว้
type UpsertHallFloorPlanRequest struct {
	TopViewImage  *string    `json:"top_view_image"`
	ImageNaturalW int        `json:"image_natural_w"`
	ImageNaturalH int        `json:"image_natural_h"`
	GridCols      int        `json:"grid_cols"`
	GridRows      int        `json:"grid_rows"`
	CellSizeM     float64    `json:"cell_size_m"`
	RealWidthM    *float64   `json:"real_width_m"`
	RealLengthM   *float64   `json:"real_length_m"`
	Overlay       OverlayDTO `json:"overlay"`
	PxPerMX       *float64   `json:"px_per_mx"`
	PxPerMY       *float64   `json:"px_per_my"`
	BlockedCells  [][]int    `json:"blocked_cells"`
}

type HallFloorPlanResponse struct {
	LocationID      uint       `json:"location_id"`
	TopViewImageURL *string    `json:"top_view_image_url"` // presigned URL สำหรับแสดงผล
	ImageNaturalW   int        `json:"image_natural_w"`
	ImageNaturalH   int        `json:"image_natural_h"`
	GridCols        int        `json:"grid_cols"`
	GridRows        int        `json:"grid_rows"`
	CellSizeM       float64    `json:"cell_size_m"`
	RealWidthM      *float64   `json:"real_width_m"`
	RealLengthM     *float64   `json:"real_length_m"`
	Overlay         OverlayDTO `json:"overlay"`
	PxPerMX         *float64   `json:"px_per_mx"`
	PxPerMY         *float64   `json:"px_per_my"`
	BlockedCells    [][]int    `json:"blocked_cells"`
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
	LocationID   *uint  `json:"location_id,omitempty"`
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
	Price           int  `json:"price" binding:"min=0"`
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

// ── Staff Location ───────────────────────────────────────────────────────────

type StaffLocationResponse struct {
	UserID     uint   `json:"user_id"`
	BuildingID uint   `json:"building_id"`
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name"`
	Email      string `json:"email"`
}

type AssignStaffRequest struct {
	UserID uint `json:"user_id" binding:"required"`
}

type AssignStaffBuildingsRequest struct {
	BuildingIDs []uint `json:"building_ids"`
}

type StaffBuildingResponse struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
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
	Status       string      `json:"status"`
	BookedHours  float64     `json:"booked_hours,omitempty"`
	BookedRanges [][2]string `json:"booked_ranges,omitempty"` // [["09:00","11:00"], ...]
}

// map[dateStr]DayAvailability  e.g. {"2026-07-01": {"status":"partial","booked_hours":2,"booked_ranges":[["09:00","11:00"]]}}
type MonthlyAvailabilityResponse = map[string]DayAvailability

// AvailabilitySearchQuery batches an availability check across many rooms and
// days in one request — e.g. "of these 40 rooms, which are free for 2026-08-01
// to 2026-08-03, 09:00-11:00?" — instead of one request per room. StartTime/
// EndTime are optional: omit both to ask "does this room have any meaningfully
// free time left that day" rather than checking one exact window.
type AvailabilitySearchQuery struct {
	LocationIDs string `form:"location_ids" binding:"required"` // "1,2,3"
	Dates       string `form:"dates" binding:"required"`        // "2026-08-01,2026-08-02"
	StartTime   string `form:"start_time"`                      // "09:00"
	EndTime     string `form:"end_time"`                        // "11:00"
}

// map[locationID]bool — true if that location is free across every requested
// date (and, if given, within start_time/end_time on each of those dates).
type AvailabilitySearchResponse = map[uint]bool
