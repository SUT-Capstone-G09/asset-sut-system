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
	Purpose   string          `json:"purpose" binding:"required"`
	Timeslots []TimeslotInput `json:"timeslots" binding:"required,min=1"`
}

type UpdateBookingStatusRequest struct {
	StatusID uint   `json:"status_id"`
	Status   string `json:"status"`
	Note     string `json:"note"`
}

type TimeslotResponse struct {
	ID            uint      `json:"id"`
	LocationID    uint      `json:"location_id"`
	LocationName  string    `json:"location_name"`
	LocationImage *string   `json:"location_image"`
	Date          time.Time `json:"date"`
	StartTime     time.Time `json:"start_time"`
	EndTime       time.Time `json:"end_time"`
	IsFullDay     bool      `json:"is_full_day"`
	PriceSnapshot float64   `json:"price_snapshot"`
	Status        string    `json:"status"`
	Addons        []BookingAddonResponse `json:"addons"`
}

type BookingAddonResponse struct {
	ID           uint   `json:"id"`
	AddonName    string `json:"addon_name"`
	AppliedPrice float64 `json:"applied_price"`
	Quantity     int     `json:"quantity"`
	TotalPrice   float64 `json:"total_price"`
}

type StatusLogResponse struct {
	ID           uint      `json:"id"`
	FromStatus   string    `json:"from_status"`
	ToStatus     string    `json:"to_status"`
	ChangedBy    uint      `json:"changed_by"`
	ChangedByName string   `json:"changed_by_name"`
	ChangedAt    time.Time `json:"changed_at"`
	Note         string    `json:"note"`
}

type BookingResponse struct {
	ID            uint               `json:"id"`
	UserID        uint               `json:"user_id"`
	UserName      string             `json:"user_name"`
	RequesterName string             `json:"requester_name"`
	RequesterID   string             `json:"requester_id"`
	RequesterType string             `json:"requester_type"`
	ContactPhone  string             `json:"contact_phone"`
	ContactEmail  string             `json:"contact_email"`
	Purpose       string             `json:"purpose"`
	BasePrice     float64            `json:"base_price"`
	AddonPrice    float64            `json:"addon_price"`
	TotalPrice    float64            `json:"total_price"`
	Status        string             `json:"status"`
	StatusID      uint               `json:"status_id"`
	Timeslots     []TimeslotResponse `json:"timeslots"`
	StatusLogs    []StatusLogResponse `json:"status_logs"`
	BookingAddons []BookingAddonResponse `json:"booking_addons"`
	Documents     []DocumentResponse     `json:"documents"`
	CreatedAt     time.Time          `json:"created_at"`
}

type BookingAddonInput struct {
	AddonName    string `json:"addon_name" binding:"required"`
	AppliedPrice float64 `json:"applied_price" binding:"required"`
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
