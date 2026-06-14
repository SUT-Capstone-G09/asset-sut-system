package models

type EmailBroadcast struct {
	Base
	TemplateKey     string `gorm:"not null" json:"template_key"`
	AudienceType    string `gorm:"not null" json:"audience_type"`
	AudienceDesc    string `json:"audience_desc"`
	TotalRecipients int    `gorm:"not null" json:"total_recipients"`
	CreatedByUserID uint   `gorm:"not null" json:"created_by_user_id"`
}

const (
	OutboxPending = "pending"
	OutboxSending = "sending"
	OutboxSent    = "sent"
	OutboxFailed  = "failed"
)

type EmailOutbox struct {
	Base
	BroadcastID *uint  `gorm:"index" json:"broadcast_id,omitempty"`
	ToEmail     string `gorm:"not null" json:"to_email"`
	Subject     string `gorm:"not null" json:"subject"`
	HTML        string `gorm:"type:text" json:"html"`
	Text        string `gorm:"type:text" json:"text"`
	Status      string `gorm:"not null;index;default:pending" json:"status"`
	Attempts    int    `gorm:"not null;default:0" json:"attempts"`
	LastError   string `gorm:"type:text" json:"last_error"`
}
