package models

type RequesterTypes struct {
	Base
	Type       string       `gorm:"not null" json:"type"`
	Profiles []Profiles `gorm:"foreignKey:RequesterTypeID;references:ID" json:"profiles,omitempty"`
}

type Profiles struct {
	Base
	FirstName string `gorm:"not null" json:"first_name"`
	LastName  string `gorm:"not null" json:"last_name"`
	Phone     string `gorm:"not null" json:"phone"`
	LineID    string `gorm:"not null" json:"line_id"`
	UserID    uint   `gorm:"not null" json:"user_id"`
	User      *Users `gorm:"foreignKey:UserID;references:ID" json:"user,omitempty"`
	// RequesterTypeID เป็น nullable: admin/staff ไม่มีประเภทผู้ขอใช้บริการ
	RequesterTypeID *uint           `json:"requester_type_id"`
	RequesterType   *RequesterTypes `gorm:"foreignKey:RequesterTypeID;references:ID" json:"requester_type,omitempty"`
}
