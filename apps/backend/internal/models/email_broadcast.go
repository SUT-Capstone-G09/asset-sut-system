package models

// EmailBroadcast records one admin-initiated bulk send (a "campaign"): which
// template was used, who the audience was, and how many recipients it expanded
// to. Per-recipient delivery rows live in EmailOutbox and reference this via
// BroadcastID, so progress can be shown by counting outbox rows per status.
type EmailBroadcast struct {
	Base
	TemplateKey     string `gorm:"not null" json:"template_key"`
	AudienceType    string `gorm:"not null" json:"audience_type"` // all | roles | requester_types | users
	AudienceDesc    string `json:"audience_desc"`                 // human-readable, e.g. "role: staff"
	TotalRecipients int    `gorm:"not null" json:"total_recipients"`
	CreatedByUserID uint   `gorm:"not null" json:"created_by_user_id"`
}

// Outbox statuses.
const (
	OutboxPending = "pending"
	OutboxSending = "sending"
	OutboxSent    = "sent"
	OutboxFailed  = "failed"
)

// EmailOutbox is a durable, per-recipient outbound email. Rows are rendered and
// persisted up-front (status=pending), then a background worker claims, sends,
// and marks them — so a broadcast survives a process restart and never silently
// drops messages the way the in-memory queue can. BroadcastID is nullable so the
// table can later back transactional sends too.
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
