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
	Name             string   `json:"name" binding:"required,min=3,max=100"`
	BuildingTypeID   *uint    `json:"building_type_id"` // Nullable สำหรับกรณีตึกเดี่ยว
	BuildingTypeName *string  `json:"building_type_name"`
	Description      *string  `json:"description"`
	FloorCount       *int     `json:"floor_count" binding:"omitempty,min=1"`
	Lat              *float64 `json:"lat" binding:"omitempty,min=-90,max=90"`
	Lng              *float64 `json:"lng" binding:"omitempty,min=-180,max=180"`
	Address          string   `json:"address"`
	HasFloorPlan     *bool    `json:"has_floor_plan"`
	BlueprintURL     *string  `json:"blueprint_url"`
}

type UpdateBuildingRequest struct {
	Name             *string  `json:"name"`
	BuildingTypeID   *uint    `json:"building_type_id"`
	BuildingTypeName *string  `json:"building_type_name"`
	Description      *string  `json:"description"`
	FloorCount       *int     `json:"floor_count" binding:"omitempty,min=1"`
	Lat              *float64 `json:"lat" binding:"omitempty,min=-90,max=90"`
	Lng              *float64 `json:"lng" binding:"omitempty,min=-180,max=180"`
	Address          *string  `json:"address"`
	HasFloorPlan     *bool    `json:"has_floor_plan"`
	BlueprintURL     *string  `json:"blueprint_url"`
}

// BuildingHallPricingResponse = ราคาการขอใช้พื้นที่โถงของอาคาร แยกราย 1 วัตถุประสงค์
type BuildingHallPricingResponse struct {
	HallUsagePurposeID uint   `json:"hall_usage_purpose_id"`
	PurposeName        string `json:"purpose_name"`
	PricingModel       string `json:"pricing_model"` // per_sqm | per_type_per_day
	Price              float64    `json:"price"`         // per_sqm: บาท/ตร.ม./วัน ; per_type_per_day: บาท/ประเภท/วัน
	IsActive           bool   `json:"is_active"`
}

// HallUsagePurposeResponse = วัตถุประสงค์การขอใช้พื้นที่โถง (master data) สำหรับให้ admin UI แสดงรายการ
type HallUsagePurposeResponse struct {
	ID           uint   `json:"id"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	PricingModel string `json:"pricing_model"` // per_sqm | per_type_per_day
	DefaultPrice float64    `json:"default_price"` // ค่าตั้งต้น/fallback เมื่ออาคารยังไม่ตั้งราคา
	IsActive     bool   `json:"is_active"`
	SortOrder    int    `json:"sort_order"`
}

// CreateHallUsagePurposeRequest = เพิ่มวัตถุประสงค์การขอใช้พื้นที่โถงใหม่
// pricing_model จำกัดไว้ 2 แบบเดิม (oneof) เพื่อไม่ให้กระทบ logic การคิดเงิน — model ใหม่ต้องแก้โค้ดคำนวณเพิ่ม
type CreateHallUsagePurposeRequest struct {
	Name         string `json:"name" binding:"required,min=2,max=100"`
	Description  string `json:"description"`
	PricingModel string `json:"pricing_model" binding:"required,oneof=per_sqm per_type_per_day"`
	DefaultPrice float64    `json:"default_price" binding:"min=0"`
	SortOrder    *int   `json:"sort_order"` // nil = ต่อท้ายอัตโนมัติ
}

// UpdateHallUsagePurposeRequest = แก้วัตถุประสงค์ (แก้ pricing_model ไม่ได้ กันความหมายราคา/snapshot เพี้ยน)
type UpdateHallUsagePurposeRequest struct {
	Name         *string `json:"name" binding:"omitempty,min=2,max=100"`
	Description  *string `json:"description"`
	DefaultPrice *float64    `json:"default_price" binding:"omitempty,min=0"`
	IsActive     *bool   `json:"is_active"`
	SortOrder    *int    `json:"sort_order"`
}

// UpdateBuildingHallPricingsRequest = แอดมินตั้ง/แก้ราคาโถงของอาคารหนึ่ง (bulk upsert รายวัตถุประสงค์)
type UpdateBuildingHallPricingsRequest struct {
	Pricings []BuildingHallPricingInput `json:"pricings" binding:"required,min=1,dive"`
}

type BuildingHallPricingInput struct {
	HallUsagePurposeID uint `json:"hall_usage_purpose_id" binding:"required"`
	Price              float64  `json:"price" binding:"min=0"`
	IsActive           bool `json:"is_active"`
}

type BuildingResponse struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`

	// ราคาโถงราย วัตถุประสงค์ (ตั้งบูธ / ใบปลิว / ตัวอย่างสินค้า) ของอาคารนี้
	HallPricings []BuildingHallPricingResponse `json:"hall_pricings,omitempty"`

	BuildingTypeID   *uint   `json:"building_type_id,omitempty"`
	BuildingTypeName *string `json:"building_type_name,omitempty"` // ดึงชื่อประเภทอาคารไปโชว์

	// ที่ตั้งของตึก (nil ถ้ายังไม่กำหนดพิกัด)
	Coordinates *[2]float64 `json:"coordinates,omitempty"` // [lat, lng]
	Address       string      `json:"address"`
	BlueprintURL     *string     `json:"blueprint_url,omitempty"`

	RentalSpaceCount int       `json:"rental_space_count"` // จำนวน Rental Space ภายใน
	HasFloorPlan     bool      `json:"has_floor_plan"`     // มีแผนผังหรือไม่
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
