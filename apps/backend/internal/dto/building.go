package dto

import "time"

// Building Types DTOs
// BuildingType คือประเภทอาคารหลัก (เช่น โรงอาหาร, หอพัก)

type CreateBuildingTypeRequest struct {
	Name string `json:"name" binding:"required,min=2,max=50"`
}

type BuildingTypeResponse struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Building DTOs
// Building คือสถานที่หลัก (e.g., โรงอาหารพราวแสดทอง, สุรนิเวศ 1)
// ทำหน้าที่เป็น Container ของ RentalSpaces และ FloorPlan

type CreateBuildingRequest struct {
	Name           string   `json:"name" binding:"required,min=3,max=100"`
	BuildingTypeID *uint    `json:"building_type_id"` // Nullable สำหรับกรณีตึกเดี่ยว
	Lat            *float64 `json:"lat" binding:"omitempty,min=-90,max=90"`
	Lng            *float64 `json:"lng" binding:"omitempty,min=-180,max=180"`
	Address        string   `json:"address"`
}

type UpdateBuildingRequest struct {
	Name           *string  `json:"name"`
	BuildingTypeID *uint    `json:"building_type_id"`
	Lat            *float64 `json:"lat" binding:"omitempty,min=-90,max=90"`
	Lng            *float64 `json:"lng" binding:"omitempty,min=-180,max=180"`
	Address        *string  `json:"address"`
}

type BuildingResponse struct {
	ID               uint       `json:"id"`
	Name             string     `json:"name"`

	BuildingTypeID   *uint      `json:"building_type_id,omitempty"`
	BuildingTypeName *string    `json:"building_type_name,omitempty"` // ดึงชื่อประเภทอาคารไปโชว์

	// ที่ตั้งของตึก (nil ถ้ายังไม่กำหนดพิกัด)
	Coordinates      *[2]float64 `json:"coordinates,omitempty"` // [lat, lng]
	Address          string      `json:"address"`

	RentalSpaceCount int        `json:"rental_space_count"`           // จำนวน Rental Space ภายใน
	HasFloorPlan     bool       `json:"has_floor_plan"`               // มีแผนผังหรือไม่
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}
