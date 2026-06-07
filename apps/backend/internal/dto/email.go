package dto

// SendTestEmailRequest is the body for the admin-only test-send endpoint. It lets
// you verify SMTP and template rendering without going through a booking flow.
type SendTestEmailRequest struct {
	To         string `json:"to" binding:"required,email"`
	UserName   string `json:"user_name" binding:"required"`
	AssetName  string `json:"asset_name" binding:"required"`
	Amount     string `json:"amount" binding:"required"`
	PaymentURL string `json:"payment_url" binding:"required,url"`
}
