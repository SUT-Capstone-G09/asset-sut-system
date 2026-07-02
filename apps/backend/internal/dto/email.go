package dto

type SendTestEmailRequest struct {
	To   string         `json:"to" binding:"required,email"`
	Key  string         `json:"key"`
	Data map[string]any `json:"data"`
}
