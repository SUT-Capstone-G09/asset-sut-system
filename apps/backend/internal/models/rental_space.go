package models

import "github.com/google/uuid"

// RentalSpaces คือหน่วยพื้นที่ที่สามารถทำสัญญาเช่าได้
// สังกัดอยู่ภายใต้ Building ใด Building หนึ่ง
// ตัวอย่าง: A01, A02, พื้นที่ร้านกาแฟ, พื้นที่ร้านสะดวกซื้อ
type RentalSpaces struct {
	Base
	BuildingID  *uint
	Building    *Buildings          `gorm:"foreignKey:BuildingID"`
	Name        string              `gorm:"not null"`
	Description *string
	// หมายเหตุ: ไม่มี Category เพราะประเภทธุรกิจเป็นของ Tenant/Contract ไม่ใช่ของพื้นที่
	Size        *string
	AreaCode    *string             `gorm:"unique"`
	BasePrice   *float64            `gorm:"type:decimal(12,2)"`
	Status      string              `gorm:"not null;default:'vacant'"`
	Images      []RentalSpaceImages `gorm:"foreignKey:RentalSpaceID"`
	Tags        []RentalSpaceTags   `gorm:"foreignKey:RentalSpaceID"`
}

// RentalSpaceImages เก็บรูปภาพของพื้นที่เช่า (หลายรูปต่อหนึ่งพื้นที่)
type RentalSpaceImages struct {
	Base
	RentalSpaceID uint          `gorm:"not null"`
	RentalSpace   *RentalSpaces `gorm:"foreignKey:RentalSpaceID"`
	URL           string        `gorm:"not null"`
	AltText       *string
	IsPrimary     bool          `gorm:"not null;default:false"`
	SortOrder     int           `gorm:"not null;default:0"`
}

// RentalSpaceTags เก็บ Tag ของพื้นที่เช่า
type RentalSpaceTags struct {
	RentalSpaceID uint   `gorm:"primaryKey"`
	Tag           string `gorm:"primaryKey"`
}

// FloorPlans คือแปลนของ Building
// ผูกอยู่กับ Building (ไม่ใช่ Rental Space) เนื่องจากแปลนแสดงภาพรวมของ Building ทั้งหมด
// เป็น optional — ไม่ใช่ทุก Building จำเป็นต้องมีแผนผัง
type FloorPlans struct {
	UUIDBase
	BuildingID uint        `gorm:"unique;not null"`
	Building   *Buildings  `gorm:"foreignKey:BuildingID"`
	Name       string      `gorm:"not null"`
	Width      int         `gorm:"not null"`
	Height     int         `gorm:"not null"`
	MapLayers  []MapLayers `gorm:"foreignKey:FloorPlanID"`
}

// MapLayers คือ Layer ภายใน Floor Plan ใช้จัดกลุ่ม Map Element
type MapLayers struct {
	UUIDBase
	FloorPlanID uuid.UUID     `gorm:"type:uuid;not null"`
	FloorPlan   *FloorPlans   `gorm:"foreignKey:FloorPlanID"`
	Name        string        `gorm:"not null"`
	Visible     bool          `gorm:"not null;default:true"`
	Locked      bool          `gorm:"not null;default:false"`
	Color       string        `gorm:"not null"`
	MapElements []MapElements `gorm:"foreignKey:LayerID"`
}

// MapElements คือ Object ภายใน Layer
// เป็นข้อมูลด้านการแสดงผล — สามารถ link กลับไปยัง RentalSpace ผ่าน RentalSpaceID (nullable)
// Element ที่ไม่ใช่ล็อค (ทางเดิน, ห้องน้ำ, ป้ายชื่อ) จะไม่ผูกกับ RentalSpace ใด
type MapElements struct {
	UUIDBase
	LayerID         uuid.UUID     `gorm:"type:uuid;not null;index"`
	Layer           *MapLayers    `gorm:"foreignKey:LayerID"`
	// Link กลับไปยัง RentalSpace ที่ Element นี้แทน (nullable)
	RentalSpaceID   *uint
	RentalSpace     *RentalSpaces `gorm:"foreignKey:RentalSpaceID"`
	CanvasElementID string        `gorm:"not null"`
	Name            string        `gorm:"type:varchar(100);not null"`
	Type            string        `gorm:"type:varchar(20);not null"`
	AreaType        *string
	CustomAreaType  *string
	Status          string        `gorm:"type:varchar(20);not null;default:'open'"`
	X               float64       `gorm:"not null"`
	Y               float64       `gorm:"not null"`
	Width           float64       `gorm:"not null"`
	Height          float64       `gorm:"not null"`
	Rotation        float64       `gorm:"not null;default:0"`
	Zone            *string
	Tenant          *string
	Description     *string
	Tags            []string      `gorm:"serializer:json"`
}
