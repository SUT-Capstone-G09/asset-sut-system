package dto

import (
	"time"

	"github.com/google/uuid"
)

// ── Rental Space DTOs ─────────────────────────────────────────────────────────
// RentalSpace คือหน่วยพื้นที่ที่สามารถทำสัญญาเช่าได้ สังกัดอยู่ภายใต้ Building
// หมายเหตุ: ไม่มีฟิลด์ category — ประเภทธุรกิจเป็นของ Tenant/Contract ไม่ใช่ของพื้นที่
// Status lifecycle: available → occupied (ผ่าน Tenant Assignment + Lease Contract)

type CreateRentalSpaceRequest struct {
	BuildingID  *uint    `json:"building_id"`
	Name        string   `json:"name" binding:"required"`
	Description *string  `json:"description"`
	Lat         float64  `json:"lat" binding:"required,min=-90,max=90"`
	Lng         float64  `json:"lng" binding:"required,min=-180,max=180"`
	Address     string   `json:"address" binding:"required"`
	Size        *string  `json:"size"`
	AreaCode    *string  `json:"area_code"`
	BasePrice   *float64 `json:"base_price" binding:"omitempty,min=0"`
	// Status: available = ว่าง, occupied = มีผู้เช่า, maintenance = ปิดปรับปรุง
	Status string `json:"status" binding:"omitempty,oneof=available occupied maintenance"`
}

type UpdateRentalSpaceRequest struct {
	BuildingID  *uint    `json:"building_id"`
	Name        *string  `json:"name"`
	Description *string  `json:"description"`
	Lat         *float64 `json:"lat" binding:"omitempty,min=-90,max=90"`
	Lng         *float64 `json:"lng" binding:"omitempty,min=-180,max=180"`
	Address     *string  `json:"address"`
	Size        *string  `json:"size"`
	AreaCode    *string  `json:"area_code"`
	BasePrice   *float64 `json:"base_price" binding:"omitempty,min=0"`
	Status      *string  `json:"status" binding:"omitempty,oneof=available occupied maintenance"`
}

type RentalSpaceResponse struct {
	ID           uuid.UUID                  `json:"id"`
	BuildingID   *uint                      `json:"building_id"`
	BuildingName *string                    `json:"building_name,omitempty"`
	Name         string                     `json:"name"`
	Description  *string                    `json:"description"`
	Coordinates  [2]float64                 `json:"coordinates"` // [lat, lng]
	Address      string                     `json:"address"`
	Size         *string                    `json:"size"`
	AreaCode     *string                    `json:"area_code"`
	BasePrice    *float64                   `json:"base_price"`
	Status       string                     `json:"status"`
	Images       []RentalSpaceImageResponse `json:"images,omitempty"`
	Tags         []string                   `json:"tags,omitempty"`
	CreatedAt    time.Time                  `json:"created_at"`
	UpdatedAt    time.Time                  `json:"updated_at"`
}

type RentalSpaceImageResponse struct {
	ID        uuid.UUID `json:"id"`
	URL       string    `json:"url"`
	AltText   *string   `json:"alt_text"`
	IsPrimary bool      `json:"is_primary"`
	SortOrder int       `json:"sort_order"`
}

// ── Floor Plan DTOs ───────────────────────────────────────────────────────────
// FloorPlan ผูกอยู่กับ Building (ไม่ใช่ RentalSpace)
// ทำหน้าที่แสดงภาพรวมของพื้นที่ทั้ง Building และเป็น optional

type CreateFloorPlanRequest struct {
	Name   string `json:"name" binding:"required"`
	Width  int    `json:"width" binding:"required,min=1"`
	Height int    `json:"height" binding:"required,min=1"`
}

type UpdateFloorPlanRequest struct {
	Name   *string `json:"name"`
	Width  *int    `json:"width" binding:"omitempty,min=1"`
	Height *int    `json:"height" binding:"omitempty,min=1"`
}

type FloorPlanResponse struct {
	ID         uuid.UUID          `json:"id"`
	BuildingID uint               `json:"building_id"` // ผูกกับ Building (ไม่ใช่ area_id)
	Name       string             `json:"name"`
	Width      int                `json:"width"`
	Height     int                `json:"height"`
	Layers     []MapLayerResponse `json:"layers,omitempty"`
	UpdatedAt  time.Time          `json:"updated_at"`
}

// ── Map Layer DTOs ────────────────────────────────────────────────────────────

type CreateMapLayerRequest struct {
	Name    string `json:"name" binding:"required"`
	Visible bool   `json:"visible"`
	Locked  bool   `json:"locked"`
	Color   string `json:"color" binding:"required,len=7"` // hex color เช่น #f26522
}

type UpdateMapLayerRequest struct {
	Name    *string `json:"name"`
	Visible *bool   `json:"visible"`
	Locked  *bool   `json:"locked"`
	Color   *string `json:"color" binding:"omitempty,len=7"`
}

type MapLayerResponse struct {
	ID       uuid.UUID            `json:"id"`
	Name     string               `json:"name"`
	Visible  bool                 `json:"visible"`
	Locked   bool                 `json:"locked"`
	Color    string               `json:"color"`
	Elements []MapElementResponse `json:"elements,omitempty"`
}

// ── Map Element DTOs ──────────────────────────────────────────────────────────
// MapElement เป็นข้อมูลด้านการแสดงผลเท่านั้น
// สามารถ link กลับไปยัง RentalSpace ผ่าน rental_space_id (nullable)
// Element ที่ไม่ใช่ล็อค (ทางเดิน, ห้องน้ำ, ป้ายชื่อ) ไม่ต้องผูกกับ RentalSpace

type CreateMapElementRequest struct {
	CanvasElementID string  `json:"canvas_element_id" binding:"required"`
	// RentalSpaceID เชื่อมกลับไปยัง Rental Space ที่ Element นี้แทน (optional)
	RentalSpaceID   *uint   `json:"rental_space_id"`
	Name            string  `json:"name" binding:"required,min=1,max=100"`
	Type            string  `json:"type" binding:"required,oneof=area wall"`
	// Status ของ Element บน Canvas (แยกจาก Status ของ RentalSpace)
	Status          *string `json:"status" binding:"omitempty,oneof=open reserved occupied maintenance unavailable"`
	AreaType        *string `json:"area_type" binding:"omitempty,oneof=shop toilet seating other"`
	CustomAreaType  *string `json:"custom_area_type"`
	X               float64 `json:"x" binding:"required"`
	Y               float64 `json:"y" binding:"required"`
	Width           float64 `json:"width" binding:"required,gt=0"`
	Height          float64 `json:"height" binding:"required,gt=0"`
	Rotation        *float64 `json:"rotation"`
	Zone            *string `json:"zone"`
	Tenant          *string `json:"tenant"`
	Description     *string `json:"description"`
	Tags            []string `json:"tags"`
}

type UpdateMapElementRequest struct {
	RentalSpaceID  *uint    `json:"rental_space_id"` // อนุญาตให้ยกเลิก link ได้ (ส่ง null)
	Name           *string  `json:"name" binding:"omitempty,min=1,max=100"`
	Status         *string  `json:"status" binding:"omitempty,oneof=open reserved occupied maintenance unavailable"`
	AreaType       *string  `json:"area_type" binding:"omitempty,oneof=shop toilet seating other"`
	CustomAreaType *string  `json:"custom_area_type"`
	X              *float64 `json:"x"`
	Y              *float64 `json:"y"`
	Width          *float64 `json:"width" binding:"omitempty,gt=0"`
	Height         *float64 `json:"height" binding:"omitempty,gt=0"`
	Rotation       *float64 `json:"rotation"`
	Zone           *string  `json:"zone"`
	Tenant         *string  `json:"tenant"`
	Description    *string  `json:"description"`
	Tags           []string `json:"tags"`
}

type MapElementResponse struct {
	ID              uuid.UUID `json:"id"`
	CanvasElementID string    `json:"canvas_element_id"`
	// RentalSpaceID กลับมาเพื่อให้ Frontend รู้ว่า Element นี้ link กับ Rental Space ไหน
	RentalSpaceID   *uint     `json:"rental_space_id,omitempty"`
	Name            string    `json:"name"`
	Type            string    `json:"type"`
	Status          string    `json:"status"`
	AreaType        *string   `json:"area_type,omitempty"`
	CustomAreaType  *string   `json:"custom_area_type,omitempty"`
	X               float64   `json:"x"`
	Y               float64   `json:"y"`
	Width           float64   `json:"width"`
	Height          float64   `json:"height"`
	Rotation        float64   `json:"rotation"`
	Zone            *string   `json:"zone,omitempty"`
	Tenant          *string   `json:"tenant,omitempty"`
	Description     *string   `json:"description,omitempty"`
	Tags            []string  `json:"tags"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}