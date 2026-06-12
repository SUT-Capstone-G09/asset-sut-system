package dto

type AudienceSpec struct {
	Type             string   `json:"type" binding:"required,oneof=all roles requester_types users"`
	Roles            []string `json:"roles"`
	RequesterTypeIDs []uint   `json:"requester_type_ids"`
	UserIDs          []uint   `json:"user_ids"`
}

type SendBroadcastRequest struct {
	TemplateKey string         `json:"template_key" binding:"required"`
	Audience    AudienceSpec   `json:"audience" binding:"required"`
	Data        map[string]any `json:"data"`
}

type PreviewAudienceRequest struct {
	Audience AudienceSpec `json:"audience" binding:"required"`
}

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

type BroadcastResponse struct {
	ID              uint           `json:"id"`
	TemplateKey     string         `json:"template_key"`
	AudienceType    string         `json:"audience_type"`
	AudienceDesc    string         `json:"audience_desc"`
	TotalRecipients int            `json:"total_recipients"`
	CreatedAt       string         `json:"created_at"`
	Counts          map[string]int `json:"counts"`
}

type AudienceOptionsResponse struct {
	Roles          []string              `json:"roles"`
	RequesterTypes []RequesterTypeOption `json:"requester_types"`
}

type RequesterTypeOption struct {
	ID   uint   `json:"id"`
	Type string `json:"type"`
}
