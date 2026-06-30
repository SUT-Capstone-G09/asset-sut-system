package models

import "time"

type NewsAnnouncements struct {
	StringBase
	CategoryID       uint              `gorm:"not null" json:"category_id"`
	Category         NewsCategories    `gorm:"foreignKey:CategoryID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"category,omitempty"`
	Title            string            `gorm:"type:varchar(255);not null" json:"title"`
	ShortDescription string            `gorm:"type:text" json:"short_description"`
	Qualifications   string            `gorm:"type:text" json:"qualifications"`
	RequiredDocs     string            `gorm:"type:text" json:"required_docs"`
	MainImage        string            `gorm:"type:varchar(511)" json:"main_image"` // ปรับขนาดเผื่อ URL ยาวๆ
	Pdf              string            `gorm:"type:varchar(511)" json:"pdf"` // เอา not null ออก เพื่อให้ไม่มีไฟล์แนบ PDF ได้
	PublishDate      *time.Time        `gorm:"type:timestamp" json:"publish_date"` // ใช้ Pointer timestamp เพื่อรองรับวันที่+เวลาและเป็นค่าว่างได้
	ExpireDate       *time.Time        `gorm:"type:timestamp" json:"expire_date"`  // ใช้ Pointer timestamp
	Status           string            `gorm:"type:varchar(50);not null;default:'Draft'" json:"status"`
	IsFeatured       bool              `gorm:"default:false" json:"is_featured"`
	LeaseOffer       *NewsLeaseOffers  `gorm:"foreignKey:NewsID" json:"lease_offer,omitempty"` // เชื่อมความสัมพันธ์ในโค้ดให้จอยตารางง่ายขึ้น
	NewsLogs         []NewsLogs        `gorm:"foreignKey:NewsID" json:"news_logs,omitempty"`
	NewsViews        []NewsViews       `gorm:"foreignKey:NewsID" json:"news_views,omitempty"`
}

type NewsCategories struct {
	Base
	CategoryName string `gorm:"type:varchar(255);not null" json:"category_name"`
	NewsAnnouncements []NewsAnnouncements `gorm:"foreignKey:CategoryID" json:"news_announcements,omitempty"`
}

type NewsLeaseOffers struct {
	StringBase
	NewsID              string   `gorm:"type:varchar(255);not null;uniqueIndex" json:"news_id"` // เติม uniqueIndex เพื่อทำข้อจำกัดความสัมพันธ์ 1:1
	ContractPeriodYears *int     `gorm:"type:int" json:"contract_period_years"`
	AreaSizeSqm         *float64 `gorm:"type:decimal(10,2)" json:"area_size_sqm"`
	EntranceFee         *float64 `gorm:"type:decimal(10,2)" json:"entrance_fee"`
}

type NewsLogs struct {
	StringBase
	NewsID        string    `gorm:"type:varchar(255);not null" json:"news_id"`
	Action        string    `gorm:"type:varchar(50);not null" json:"action"`
	ChangedFields string    `gorm:"type:text" json:"changed_fields"`
	UserID        uint      `gorm:"not null" json:"user_id"` 
    PerformedBy   *Users    `gorm:"foreignKey:UserID" json:"performed_by,omitempty"`
	PerformedAt   time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP" json:"performed_at"`
}

type NewsViews struct {
	StringBase // เปลี่ยนจาก Base เป็น StringBase เพื่อให้ใช้ UUID คล้องจองกับระบบ Log ปริมาณมาก
	NewsID   string    `gorm:"type:varchar(255);not null" json:"news_id"`
	UserID   *uint     `json:"user_id"` // เปลี่ยนเป็น *uint หากต้องการจอยกับตาราง Users
	User     *Users    `gorm:"foreignKey:UserID" json:"user,omitempty"` // เพิ่มความสัมพันธ์ (ถ้าต้องการ)
	ViewedAt time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP" json:"viewed_at"`
}