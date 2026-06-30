package dto

import "time"

//
// ─────────────────────────────────────────────────────────────
// Document Envelope
// ─────────────────────────────────────────────────────────────
//

type CreateDocumentEnvelopeRequest struct {
	Title            string `json:"title" binding:"required"`
	Price            int    `json:"price" binding:"required,min=0"` 
	FilePath         string `json:"file_path" binding:"required"`
	IsOnlineDelivery bool   `json:"is_online_delivery"`
	Note             string `json:"note"`
	AreaID           uint   `json:"area_id" binding:"required"`
}

type UpdateDocumentEnvelopeRequest struct {
	Title            *string `json:"title"`
	Price            *int    `json:"price" binding:"omitempty,min=0"`
	FilePath         *string `json:"file_path"`
	IsOnlineDelivery *bool   `json:"is_online_delivery"`
	Note             *string `json:"note"`
}

type DocumentEnvelopeResponse struct {
	ID               uint   `json:"id"`
	Title            string `json:"title"`
	Price            int    `json:"price"`
	FileURL          string `json:"file_url"`
	IsOnlineDelivery bool   `json:"is_online_delivery"`
	Note             string `json:"note"`
	AreaID           uint   `json:"area_id"`
	AreaName         string `json:"area_name,omitempty"`
}

//
// ─────────────────────────────────────────────────────────────
// Order
// ─────────────────────────────────────────────────────────────
//

type CreateOrderRequest struct {
	EnvelopeID uint `json:"envelope_id" binding:"required"`
}

type CreateOrderResponse struct {
	ID          uint   `json:"id"`
	OrderNumber string `json:"order_number"`
	Status      string `json:"status"`
	TotalAmount int    `json:"total_amount"`
}

type OrderDetailResponse struct {
	ID          uint                    `json:"id"`
	OrderNumber string                  `json:"order_number"`
	Status      string                  `json:"status"`
	TotalAmount int                     `json:"total_amount"`
	Payment     *PaymentEnvelopeResponse        `json:"payment,omitempty"`
	Delivery    *OrderDeliveryResponse  `json:"delivery,omitempty"`
	Receipt     *ReceiptResponse        `json:"receipt,omitempty"`
}

//
// ─────────────────────────────────────────────────────────────
// Payment
// ─────────────────────────────────────────────────────────────
//

type CreatePaymentEnvelopeRequest struct {
	OrderID uint   `json:"order_id" binding:"required"`
	Method  string `json:"method" binding:"required,oneof=transfer cash qr"`
}

type VerifyPaymentEnvelopeRequest struct {
	Status       string `json:"status" binding:"required,oneof=approved rejected"`
	RejectReason string `json:"reject_reason,omitempty"`
}

type PaymentEnvelopeResponse struct {
	ID         uint       `json:"id"`
	Method     string     `json:"method"`
	Amount     int        `json:"amount"`
	Status     string     `json:"status"`
	PaidAt     *time.Time `json:"paid_at,omitempty"`
	VerifiedAt *time.Time `json:"verified_at,omitempty"`
	Verifier   string     `json:"verifier,omitempty"`
}

//
// ─────────────────────────────────────────────────────────────
// Delivery
// ─────────────────────────────────────────────────────────────
//

type CreateOrderDeliveryRequest struct {
	OrderID        uint   `json:"order_id" binding:"required"`
	DeliveryMethod string `json:"delivery_method" binding:"required,oneof=pickup online"`
}

type UpdateOrderDeliveryStatusRequest struct {
	DeliveryStatus string     `json:"delivery_status" binding:"required,oneof=pending ready completed"`
	PickupDate     *time.Time `json:"pickup_date,omitempty"`
}

type OrderDeliveryResponse struct {
	ID             uint       `json:"id"`
	DeliveryMethod string     `json:"delivery_method"`
	DeliveryStatus string     `json:"delivery_status"`
	PickupDate     *time.Time `json:"pickup_date,omitempty"`
}

//
// ─────────────────────────────────────────────────────────────
// Receipt
// ─────────────────────────────────────────────────────────────
//

type UploadReceiptRequest struct {
	OrderID      uint   `json:"order_id" binding:"required"`
	ReceiptImage string `json:"receipt_image" binding:"required"`
}

type ReceiptResponse struct {
	ID             uint      `json:"id"`
	ReceiptImage   string    `json:"receipt_image"`
	UploadedAt     time.Time `json:"uploaded_at"`
	UploadedByName string    `json:"uploaded_by_name"`
}