package dto

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequesterRequest struct {
	FirstName       string `json:"first_name" binding:"required"`
	LastName        string `json:"last_name" binding:"required"`
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=8"`
	LineID          string `json:"line_id"`
	Phone           string `json:"phone"`
	RequesterTypeID uint   `json:"requester_type_id" binding:"required"`
}

type TokenResponse struct {
	AccessToken string      `json:"access_token"`
	User        UserSummary `json:"user"`
}

type UserSummary struct {
	ID              uint     `json:"id"`
	Email           string   `json:"email"`
	Role            string   `json:"role"`
	FirstName       string   `json:"first_name"`
	LastName        string   `json:"last_name"`
	RequesterTypeID uint     `json:"requester_type_id,omitempty"`
	Permissions     []string `json:"permissions"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8"`
}
