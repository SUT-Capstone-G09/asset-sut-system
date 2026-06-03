package models

type Admins struct {
	Base
	FirstName string  `gorm:"not null" json:"first_name"`
	LastName  string  `gorm:"not null" json:"last_name"`
	Phone     string  `gorm:"not null" json:"phone"`
	LineID    string  `gorm:"not null" json:"line_id"`
	UserID    uint    `gorm:"not null" json:"user_id"`
	User      *Users  `gorm:"foreignKey:UserID;references:ID" json:"user,omitempty"`
}

type Staffs struct {
	Base
	FirstName string  `gorm:"not null" json:"first_name"`
	LastName  string  `gorm:"not null" json:"last_name"`
	Phone     string  `gorm:"not null" json:"phone"`
	LineID    string  `gorm:"not null" json:"line_id"`
	UserID    uint    `gorm:"not null" json:"user_id"`
	User      *Users  `gorm:"foreignKey:UserID;references:ID" json:"user,omitempty"`
}

type Requesters struct {
	Base
	FirstName       string         `gorm:"not null" json:"first_name"`
	LastName        string         `gorm:"not null" json:"last_name"`
	Phone           string         `gorm:"not null" json:"phone"`
	LineID          string         `gorm:"not null" json:"line_id"`
	UserID          uint           `gorm:"not null" json:"user_id"`
	RequesterTypeID uint           `gorm:"not null" json:"requester_type_id"`
	User            *Users         `gorm:"foreignKey:UserID;references:ID" json:"user,omitempty"`
	RequesterType   RequesterTypes `gorm:"foreignKey:RequesterTypeID;references:ID" json:"requester_type,omitempty"`
}

type RequesterTypes struct {
	Base
	Type       string       `gorm:"not null" json:"type"`
	Requesters []Requesters `gorm:"foreignKey:RequesterTypeID;references:ID" json:"requesters,omitempty"`
}
