package models

// UserSignatures stores a reusable signature image per user, kept in private
// object storage — only the object key is stored here, never the image data.
type UserSignatures struct {
	Base
	UserID     uint   `gorm:"not null;uniqueIndex" json:"user_id"`
	User       *Users `gorm:"foreignKey:UserID" json:"user,omitempty"`
	BucketName string `gorm:"not null" json:"bucket_name"`
	ObjectKey  string `gorm:"not null" json:"object_key"`
}
