package dto

// SendTestEmailRequest is the body for the admin-only test-send endpoint. It lets
// you verify SMTP and template rendering for any template without going through a
// booking flow. Key selects which template to render (defaults to
// "booking.approved") and Data supplies the {{.var}} values it interpolates.
type SendTestEmailRequest struct {
	To   string         `json:"to" binding:"required,email"`
	Key  string         `json:"key"`
	Data map[string]any `json:"data"`
}
