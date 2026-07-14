package dto

import "time"

// ── Booking ──────────────────────────────────────────────────────────────────

type TimeslotInput struct {
	LocationID uint      `json:"location_id" binding:"required"`
	Date       time.Time `json:"date" binding:"required"`
	StartTime  time.Time `json:"start_time" binding:"required"`
	EndTime    time.Time `json:"end_time" binding:"required"`
	IsFullDay  bool      `json:"is_full_day"`
	AddonIDs   []uint    `json:"addon_ids"`
}

type CreateBookingRequest struct {
	Purpose   string                `json:"purpose" binding:"required"`
	Timeslots []TimeslotInput       `json:"timeslots" binding:"required,min=1"`
	Purposes  []BookingPurposeInput `json:"purposes"` // วัตถุประสงค์การขอใช้พื้นที่โถง (ถ้ามี = จองแบบโถง คิดราคาจากวัตถุประสงค์)
}

// BookingPurposeInput = วัตถุประสงค์ 1 ข้อที่ผู้ขอเลือกตอนจองพื้นที่โถง (เลือกได้หลายข้อ)
type BookingPurposeInput struct {
	HallUsagePurposeID uint    `json:"hall_usage_purpose_id" binding:"required"`
	SelectedCells      [][]int `json:"selected_cells"`     // per_sqm: เซลล์ที่เลือกบนผัง [[row,col], ...]
	ProductTypeCount   int     `json:"product_type_count"` // per_type_per_day: จำนวนประเภทสินค้า
	ProposedPrice      *int    `json:"proposed_price"`     // ราคาที่เสนอ (optional; ต้องไม่ต่ำกว่าเกณฑ์ระบบ)
}

type UpdateBookingStatusRequest struct {
	StatusID uint   `json:"status_id"`
	Status   string `json:"status"`
	Note     string `json:"note"`
}

// ReviseBookingRequest = ผู้ขอแก้ไขวัตถุประสงค์ของ booking ที่ถูกตีกลับ (needs_revision) แล้วส่งใหม่
// v1: แก้ได้เฉพาะ purposes + ราคาเสนอ (วัน/timeslots เดิมไม่เปลี่ยน)
type ReviseBookingRequest struct {
	Purposes []BookingPurposeInput `json:"purposes" binding:"required,min=1"`
	Purpose  *string               `json:"purpose"` // อัปเดตคำอธิบายงาน (optional)
}

type TimeslotResponse struct {
	ID            uint                   `json:"id"`
	LocationID    uint                   `json:"location_id"`
	LocationName  string                 `json:"location_name"`
	LocationImage *string                `json:"location_image"`
	Date          time.Time              `json:"date"`
	StartTime     time.Time              `json:"start_time"`
	EndTime       time.Time              `json:"end_time"`
	IsFullDay     bool                   `json:"is_full_day"`
	PriceSnapshot int                    `json:"price_snapshot"`
	Status        string                 `json:"status"`
	Addons        []BookingAddonResponse `json:"addons"`
}

type BookingAddonResponse struct {
	ID           uint   `json:"id"`
	AddonName    string `json:"addon_name"`
	AppliedPrice int    `json:"applied_price"`
	Quantity     int    `json:"quantity"`
	TotalPrice   int    `json:"total_price"`
}

type StatusLogResponse struct {
	ID            uint      `json:"id"`
	FromStatus    string    `json:"from_status"`
	ToStatus      string    `json:"to_status"`
	ChangedBy     uint      `json:"changed_by"`
	ChangedByName string    `json:"changed_by_name"`
	ChangedAt     time.Time `json:"changed_at"`
	Note          string    `json:"note"`
}

type BookingResponse struct {
	ID            uint                     `json:"id"`
	UserID        uint                     `json:"user_id"`
	UserName      string                   `json:"user_name"`
	RequesterName string                   `json:"requester_name"`
	RequesterID   string                   `json:"requester_id"`
	RequesterType string                   `json:"requester_type"`
	ContactPhone  string                   `json:"contact_phone"`
	ContactEmail  string                   `json:"contact_email"`
	Purpose       string                   `json:"purpose"`
	BasePrice     int                      `json:"base_price"`
	AddonPrice    int                      `json:"addon_price"`
	TotalPrice    int                      `json:"total_price"`
	Status        string                   `json:"status"`
	StatusID      uint                     `json:"status_id"`
	Timeslots     []TimeslotResponse       `json:"timeslots"`
	StatusLogs    []StatusLogResponse      `json:"status_logs"`
	BookingAddons []BookingAddonResponse   `json:"booking_addons"`
	Purposes      []BookingPurposeResponse `json:"purposes"`
	Documents     []DocumentResponse       `json:"documents"`
	CreatedAt     time.Time                `json:"created_at"`
}

// BookingPurposeResponse = วัตถุประสงค์การขอใช้พื้นที่โถงที่ถูกคิดราคาแล้ว (snapshot)
type BookingPurposeResponse struct {
	ID                 uint     `json:"id"`
	HallUsagePurposeID uint     `json:"hall_usage_purpose_id"`
	PurposeName        string   `json:"purpose_name"`
	PricingModel       string   `json:"pricing_model"`
	SelectedCells      [][]int  `json:"selected_cells,omitempty"`
	AreaSqm            *float64 `json:"area_sqm,omitempty"`
	ProductTypeCount   *int     `json:"product_type_count,omitempty"`
	UnitPriceSnapshot  int      `json:"unit_price_snapshot"`
	ComputedPrice      int      `json:"computed_price"`
	ProposedPrice      *int     `json:"proposed_price,omitempty"`
	TotalPrice         int      `json:"total_price"`
}

type BookingAddonInput struct {
	AddonName    string `json:"addon_name" binding:"required"`
	AppliedPrice int    `json:"applied_price" binding:"required"`
	Quantity     int    `json:"quantity" binding:"required"`
}

type TimeslotExpensesInput struct {
	TimeslotID uint                `json:"timeslot_id" binding:"required"`
	Expenses   []BookingAddonInput `json:"expenses"`
}

type UpdateBookingExpensesRequest struct {
	IsWaived  bool                    `json:"is_waived"`
	Timeslots []TimeslotExpensesInput `json:"timeslots"`
}
