package dto

type UpdateProfileRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Phone     string `json:"phone"`
	LineID    string `json:"line_id"`
}

type ProfileResponse struct {
	ID        uint   `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	LineID    string `json:"line_id"`
	Role      string `json:"role"`
	IsActive  bool   `json:"is_active"`
}
