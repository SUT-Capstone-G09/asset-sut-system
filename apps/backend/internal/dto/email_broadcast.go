package dto

// AudienceSpec selects who a broadcast goes to. Only the field matching Type is
// read: roles -> Roles, requester_types -> RequesterTypeIDs, users -> UserIDs,
// all -> none.
type AudienceSpec struct {
	Type             string   `json:"type" binding:"required,oneof=all roles requester_types users"`
	Roles            []string `json:"roles"`
	RequesterTypeIDs []uint   `json:"requester_type_ids"`
	UserIDs          []uint   `json:"user_ids"`
}

// SendBroadcastRequest is the body for creating a broadcast. Data holds the
// static template variables an admin fills once (e.g. amount); {{.userName}} is
// filled per-recipient by the server and must not be supplied here.
type SendBroadcastRequest struct {
	TemplateKey string         `json:"template_key" binding:"required"`
	Audience    AudienceSpec   `json:"audience" binding:"required"`
	Data        map[string]any `json:"data"`
}

// PreviewAudienceRequest resolves an audience without sending, so the UI can show
// the recipient count before the admin commits.
type PreviewAudienceRequest struct {
	Audience AudienceSpec `json:"audience" binding:"required"`
}

// Recipient is a resolved target: an address and the display name used for the
// {{.userName}} variable.
type Recipient struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Name   string `json:"name"`
}

type PreviewAudienceResponse struct {
	Count  int         `json:"count"`
	Sample []Recipient `json:"sample"`
}

type CreateBroadcastResponse struct {
	BroadcastID     uint `json:"broadcast_id"`
	TotalRecipients int  `json:"total_recipients"`
}

// BroadcastResponse is one campaign plus its live delivery counts (derived from
// the outbox rows that reference it).
type BroadcastResponse struct {
	ID              uint           `json:"id"`
	TemplateKey     string         `json:"template_key"`
	AudienceType    string         `json:"audience_type"`
	AudienceDesc    string         `json:"audience_desc"`
	TotalRecipients int            `json:"total_recipients"`
	CreatedAt       string         `json:"created_at"`
	Counts          map[string]int `json:"counts"` // pending | sending | sent | failed
}

// AudienceOptionsResponse feeds the audience pickers in the compose UI.
type AudienceOptionsResponse struct {
	Roles          []string              `json:"roles"`
	RequesterTypes []RequesterTypeOption `json:"requester_types"`
}

type RequesterTypeOption struct {
	ID   uint   `json:"id"`
	Type string `json:"type"`
}
