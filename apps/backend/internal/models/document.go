package models

import "gorm.io/gorm"

type DocumentType string

const (
	SelfUpload DocumentType = "self_upload"
	CreatedBySystem DocumentType = "created_by_system"
)

type Document struct {
	gorm.Model
	BookingID *Booking `gorm:"foreignKey:BookingID;References:ID" json:"booking_id"`
	DocumentType DocumentType `gorm:"type:document_type;not null" json:"document_type"`
	FileName string `gorm:"not null" json:"file_name"`
	BucketName string `gorm:"not null" json:"bucket_name"`
	ObjectKey string `gorm:"not null" json:"object_key"`
	FileURL string `gorm:"not null" json:"file_url"`
	ContentType string `gorm:"not null" json:"content_type"`
	MethodID *Method `gorm:"foreignKey:MethodID;References:ID" json:"method_id"`
}

type Method struct {
	gorm.Model
	Method string `gorm:"not null" json:"method"`
}

