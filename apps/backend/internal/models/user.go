package models

type Users struct {
	Base
	Email string `gorm:"unique;not null" json:"email"`
	Password string `gorm:"not null" json:"-"`
	AuthProvider string `gorm:"not null" json:"auth_provider"`
	ProviderID string `gorm:"not null" json:"provider_id"`
	IsActive bool `gorm:"default:true" json:"is_active"`
	Admin *Admins `gorm:"foreignKey:UserID;references:ID" json:"admins"` // ความสัมพันธ์เเบบ 1[User] --- 1[Admin]
	Staff *Staffs `gorm:"foreignKey:UserID;references:ID" json:"staffs"` // ความสัมพันธ์เเบบ 1[User] --- 1[Staff]
	Requester *Requesters `gorm:"foreignKey:UserID;references:ID" json:"requesters"` // ความสัมพันธ์เเบบ 1[User] --- 1[Requester]
	Roles []Roles `gorm:"many2many:user_roles" json:"roles"` // ความสัมพันธ์เเบบ N[User] --- N[Role]
	Bookings []Bookings `gorm:"foreignKey:UserID" json:"bookings"` // ความสัมพันธ์เเบบ 1[User] --- N[Booking]
	PaymentTransactions []PaymentTransactions `gorm:"foreignKey:VerifyBy" json:"payment_transactions"` // ความสัมพันธ์เเบบ 1[User] --- N[PaymentTransaction]
}