package models

type DocumentTypes struct {
	Base
	Type      string      `gorm:"not null;unique" json:"type"`
	Documents []Documents `gorm:"foreignKey:DocumentTypeID" json:"documents,omitempty"`
}

type Methods struct {
	Base
	Method    string      `gorm:"not null;unique" json:"method"`
	Documents []Documents `gorm:"foreignKey:MethodID" json:"documents,omitempty"`
}

type Documents struct {
	Base
	BookingID      uint           `gorm:"not null" json:"booking_id"`
	Booking        *Bookings      `gorm:"foreignKey:BookingID" json:"booking,omitempty"`
	DocumentTypeID uint           `gorm:"not null" json:"document_type_id"`
	DocumentType   *DocumentTypes `gorm:"foreignKey:DocumentTypeID" json:"document_type,omitempty"`
	FileName       string         `gorm:"not null" json:"file_name"`
	BucketName     string         `gorm:"not null" json:"bucket_name"`
	ObjectKey      string         `gorm:"not null" json:"object_key"`
	FileURL        string         `gorm:"not null" json:"file_url"`
	ContentType    string         `json:"content_type"`
	MethodID       uint           `gorm:"not null" json:"method_id"`
	Method         *Methods       `gorm:"foreignKey:MethodID" json:"method,omitempty"`
}
