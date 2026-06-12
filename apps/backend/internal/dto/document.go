package dto

import "time"

type CreateDocumentRequest struct {
	BookingID      uint   `json:"booking_id" binding:"required"`
	DocumentTypeID uint   `json:"document_type_id" binding:"required"`
	FileName       string `json:"file_name" binding:"required"`
	BucketName     string `json:"bucket_name" binding:"required"`
	ObjectKey      string `json:"object_key" binding:"required"`
	FileURL        string `json:"file_url" binding:"required"`
	ContentType    string `json:"content_type"`
	MethodID       uint   `json:"method_id" binding:"required"`
}

type DocumentResponse struct {
	ID             uint      `json:"id"`
	BookingID      uint      `json:"booking_id"`
	DocumentTypeID uint      `json:"document_type_id"`
	DocumentType   string    `json:"document_type"`
	FileName       string    `json:"file_name"`
	FileURL        string    `json:"file_url"`
	ContentType    string    `json:"content_type"`
	Method         string    `json:"method"`
	CreatedAt      time.Time `json:"created_at"`
}
