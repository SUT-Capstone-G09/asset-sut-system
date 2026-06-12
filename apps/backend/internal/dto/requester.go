package dto

type RequesterResponse struct {
	ID            uint   `json:"id"`
	FirstName     string `json:"first_name"`
	LastName      string `json:"last_name"`
	Email         string `json:"email"`
	Phone         string `json:"phone"`
	LineID        string `json:"line_id"`
	RequesterType string `json:"requester_type"`
	IsActive      bool   `json:"is_active"`
}

type UpdateRequesterRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Phone     string `json:"phone"`
	LineID    string `json:"line_id"`
}
