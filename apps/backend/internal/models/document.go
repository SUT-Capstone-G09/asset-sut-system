package models

import ()

type DocumentTypes struct {
	Base
	Type string `json:"type" gorm:"type:varchar(255);not null"`
	Documents []Documents `gorm:"foreignKey:TypeID;references:ID" json:"documents"` // ความสัมพันธ์เเบบ 1[DocumentType] --- N[Document]
}

type DocumentMethods struct {
	Base
	Method string `json:"method" gorm:"type:varchar(255);not null"`
	Documents []Documents `gorm:"foreignKey:MethodID;references:ID" json:"documents"` // ความสัมพันธ์เเบบ 1[DocumentMethod] --- N[Document]
}

type Documents struct {
	Base
	BookingID uint `json:"booking_id"`
	TypeID uint `json:"type_id"`
	FileName string `json:"file_name" gorm:"type:varchar(255);not null"`
	BucketName string `json:"bucket_name" gorm:"type:varchar(255);not null"`
	ObjectKey string `json:"object_key" gorm:"type:varchar(255);not null"`
	FileURL string `json:"file_url" gorm:"type:varchar(255);not null"`
	ContentType string `json:"content_type" gorm:"type:varchar(255);not null"`
	MethodID uint `json:"method_id"`
	PaymentTransactions []PaymentTransactions `gorm:"foreignKey:Slip_DocumentID;references:ID" json:"payment_transactions"` // ความสัมพันธ์เเบบ 1[Document] --- N[PaymentTransaction]
}