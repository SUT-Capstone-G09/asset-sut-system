package models

import "time"

type BookingStatuses struct {
	Base
	Status   string     `gorm:"not null;unique" json:"status"`
	Bookings []Bookings `gorm:"foreignKey:StatusID" json:"bookings,omitempty"`
}

type Bookings struct {
	Base
	UserID     uint                `gorm:"not null" json:"user_id"`
	User       *Users              `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Purpose    string              `gorm:"not null" json:"purpose"`
	BasePrice  int                 `gorm:"not null;default:0" json:"base_price"`
	AddonPrice int                 `gorm:"not null;default:0" json:"addon_price"`
	TotalPrice int                 `gorm:"not null;default:0" json:"total_price"`
	StatusID   uint                `gorm:"not null" json:"status_id"`
	Status     *BookingStatuses    `gorm:"foreignKey:StatusID" json:"status,omitempty"`
	Timeslots  []Timeslots         `gorm:"foreignKey:BookingID" json:"timeslots,omitempty"`
	StatusLogs []BookingStatusLogs `gorm:"foreignKey:BookingID" json:"status_logs,omitempty"`
	Documents  []Documents         `gorm:"foreignKey:BookingID" json:"documents,omitempty"`
	Invoice    *Invoices           `gorm:"foreignKey:BookingID" json:"invoice,omitempty"`
}

type BookingStatusLogs struct {
	Base
	BookingID     uint             `gorm:"not null" json:"booking_id"`
	Booking       *Bookings        `gorm:"foreignKey:BookingID" json:"booking,omitempty"`
	FromStatusID  *uint            `json:"from_status_id"`
	FromStatus    *BookingStatuses `gorm:"foreignKey:FromStatusID" json:"from_status,omitempty"`
	ToStatusID    uint             `gorm:"not null" json:"to_status_id"`
	ToStatus      *BookingStatuses `gorm:"foreignKey:ToStatusID" json:"to_status,omitempty"`
	ChangedBy     uint             `gorm:"not null" json:"changed_by"`
	ChangedByUser *Users           `gorm:"foreignKey:ChangedBy" json:"changed_by_user,omitempty"`
	ChangedAt     time.Time        `gorm:"not null" json:"changed_at"`
	Note          string           `json:"note"`
}

type TimeslotStatuses struct {
	Base
	Status    string      `gorm:"not null;unique" json:"status"`
	Timeslots []Timeslots `gorm:"foreignKey:StatusID" json:"timeslots,omitempty"`
}

type Timeslots struct {
	Base
	LocationID    uint                    `gorm:"not null;uniqueIndex:idx_timeslot_slot" json:"location_id"`
	Location      *Locations              `gorm:"foreignKey:LocationID" json:"location,omitempty"`
	BookingID     *uint                   `json:"booking_id"`
	Booking       *Bookings               `gorm:"foreignKey:BookingID" json:"booking,omitempty"`
	Date          time.Time               `gorm:"type:date;not null;uniqueIndex:idx_timeslot_slot" json:"date"`
	StartTime     time.Time               `gorm:"type:time;not null;uniqueIndex:idx_timeslot_slot" json:"start_time"`
	EndTime       time.Time               `gorm:"type:time;not null" json:"end_time"`
	IsFullDay     bool                    `gorm:"not null;default:false" json:"is_full_day"`
	PriceSnapshot int                     `gorm:"not null;default:0" json:"price_snapshot"`
	StatusID      uint                    `gorm:"not null" json:"status_id"`
	Status        *TimeslotStatuses       `gorm:"foreignKey:StatusID" json:"status,omitempty"`
	Addons        []BookingTimeslotAddons `gorm:"foreignKey:TimeslotID" json:"addons,omitempty"`
}

type BookingTimeslotAddons struct {
	Base
	LocationAddonID uint            `gorm:"not null" json:"location_addon_id"`
	LocationAddon   *LocationAddons `gorm:"foreignKey:LocationAddonID" json:"location_addon,omitempty"`
	TimeslotID      uint            `gorm:"not null" json:"timeslot_id"`
	Timeslot        *Timeslots      `gorm:"foreignKey:TimeslotID" json:"timeslot,omitempty"`
	Name            string          `gorm:"not null" json:"name"`
	AppliedPrice    int             `gorm:"not null;default:0" json:"applied_price"`
	Quantity        int             `gorm:"not null;default:1" json:"quantity"`
	TotalPrice      int             `gorm:"not null;default:0" json:"total_price"`
}
