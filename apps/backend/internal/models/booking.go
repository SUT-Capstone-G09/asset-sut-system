package models

type BookingStatuses struct {
	Base
	Status string `json:"status" gorm:"type:varchar(255);not null"`
	Bookings []Bookings `gorm:"foreignKey:StatusID;references:ID" json:"bookings"` // ความสัมพันธ์เเบบ 1[BookingStatus] --- N[Booking]
}

type Bookings struct {
	Base
	UserID uint `json:"user_id"`
	Purpose string `json:"purpose" gorm:"type:varchar(255);not null"`
	BasePrice float64 `json:"base_price"`
	AddonsPrice float64 `json:"addons_price"`
	TotalPrice float64 `json:"total_price"`
	StatusID uint `json:"status_id"`
	TimeSlots []TimeSlots `gorm:"foreignKey:BookingID" json:"time_slots"` // ความสัมพันธ์เเบบ 1[Booking] --- N[TimeSlot]
	Documents []Documents `gorm:"foreignKey:BookingID" json:"documents"` // ความสัมพันธ์เเบบ 1[Booking] --- N[Document]
}