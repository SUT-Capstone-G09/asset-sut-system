package dto

import "time"

// SignatureResponse is returned after saving or fetching a user's stored signature.
type SignatureResponse struct {
	URL       string    `json:"url"`
	UpdatedAt time.Time `json:"updated_at"`
}
