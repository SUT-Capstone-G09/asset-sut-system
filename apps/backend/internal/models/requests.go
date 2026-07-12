package models

import "github.com/lib/pq"

type Requests struct {
	Base
	UserID        uint           `gorm:"not null" json:"user_id"`
	User          *Users         `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Refcode       string         `gorm:"not null" json:"refcode"`
	RequestTypeID uint           `gorm:"not null" json:"request_type_id"`
	RequestType   *RequestTypes  `gorm:"foreignKey:RequestTypeID" json:"request_type,omitempty"`
	Title         string         `gorm:"not null" json:"title"`
	Description   string         `gorm:"not null" json:"description"`
	Location      string         `gorm:"not null" json:"location"`
	StatusID      uint           `gorm:"not null" json:"status_id"`
	Status        *RequestStatus `gorm:"foreignKey:StatusID" json:"status,omitempty"`
	EvidenceUrls  pq.StringArray `gorm:"type:text[]" json:"evidence_urls"`
	StaffID       *uint          `json:"staff_id"`
	Staff         *Users         `gorm:"foreignKey:StaffID" json:"staff,omitempty"`
	ContactInfo   string         `gorm:"not null" json:"contact_info"`
	IncidentDate  *string        `json:"incident_date"`
}

type ActionHistories struct {
	Base
	RequestID       uint           `gorm:"not null" json:"request_id"`
	Request         *Requests      `gorm:"foreignKey:RequestID" json:"request,omitempty"`
	StatusID        uint           `gorm:"not null" json:"status_id"`
	Status          *RequestStatus `gorm:"foreignKey:StatusID" json:"status,omitempty"`
	AssignedStaffID *uint          `json:"assigned_staff_id"`
	AssignedStaff   *Users         `gorm:"foreignKey:AssignedStaffID" json:"assigned_staff,omitempty"`
	Detail          string         `gorm:"not null" json:"detail"`
	AdminID         uint           `gorm:"not null" json:"admin_id"`
	Admin           *Users         `gorm:"foreignKey:AdminID" json:"admin,omitempty"`
}

type RequestTypes struct {
	Base
	Name        string     `gorm:"not null" json:"name"`
	Description string     `gorm:"not null" json:"description"`
	Requests    []Requests `gorm:"foreignKey:RequestTypeID" json:"requests,omitempty"`
}

type ChatMessage struct {
	Base
	RequestID uint      `gorm:"not null" json:"request_id"`
	Request   *Requests `gorm:"foreignKey:RequestID" json:"request,omitempty"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	User      *Users    `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Message   string    `gorm:"not null" json:"message"`
	IsStaff   bool      `gorm:"not null" json:"is_staff"`
}

type RequestStatus struct {
	Base
	Status          string            `gorm:"not null;unique" json:"status"`
	Requests        []Requests        `gorm:"foreignKey:StatusID" json:"requests,omitempty"`
	ActionHistories []ActionHistories `gorm:"foreignKey:StatusID" json:"action_histories,omitempty"`
}
