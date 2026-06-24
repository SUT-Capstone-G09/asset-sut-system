package dto

import "time"

// Building DTOs

type CreateBuildingRequest struct {
	Name	string		`json:"name" binding:"required,min=3,max=100"`
	Code	*string		`json:"code"`
}

type UpdateBuildingRequest struct {
	Name	*string		`json:"name"`
	Code	*string		`json:"code"`	
}

type BuildingResponse struct {
	ID		uint			`json:"id"`
	Name	string		`json:"name"`
	Code	*string		`json:"code"`
	CreatedAt		time.Time		`json:"created_at"`
	UpdatedAt		time.Time		`json:"updated_at"`
}
