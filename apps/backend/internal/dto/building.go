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
	Name           string `json:"name" binding:"required,min=3,max=100"`
	BuildingTypeID *uint  `json:"building_type_id"` // Nullable สำหรับกรณีตึกเดี่ยว
}

type UpdateBuildingRequest struct {
	Name           *string `json:"name"`
	BuildingTypeID *uint   `json:"building_type_id"`
}

type BuildingResponse struct {
	ID               uint      `json:"id"`
	Name             string    `json:"name"`

	BuildingTypeID   *uint     `json:"building_type_id,omitempty"`
	BuildingTypeName *string   `json:"building_type_name,omitempty"` // ดึงชื่อประเภทอาคารไปโชว์

	RentalSpaceCount int       `json:"rental_space_count"`           // จำนวน Rental Space ภายใน
	HasFloorPlan     bool      `json:"has_floor_plan"`               // มีแผนผังหรือไม่
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
