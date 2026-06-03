package dto

// GenerateQRRequest is the body for POST /payments/qr. The amount is never taken
// from the client; it is looked up from the invoice in the database.
type GenerateQRRequest struct {
	InvoiceID uint   `json:"invoice_id" binding:"required"`
	Mode      string `json:"mode"` // "promptpay" (default) or "biller"
}

// GenerateQRResponse returns the EMVCo payload (for clients that render their own
// QR) plus a presigned URL to the rendered PNG stored in MinIO.
type GenerateQRResponse struct {
	PaymentID uint    `json:"payment_id"`
	InvoiceID uint    `json:"invoice_id"`
	Amount    float64 `json:"amount"`
	Payload   string  `json:"payload"`
	QRCodeURL string  `json:"qr_code_url"`
	ExpiresIn int     `json:"expires_in"` // seconds until the presigned URL expires
}
