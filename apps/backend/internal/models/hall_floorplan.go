package models

// HallFloorPlans เก็บผังพื้นที่แบบวางกริดทับรูป top-view ของโถง (ผูกกับ location 1:1)
// ต่างจาก FloorPlans/MapLayers (ผังแบบ stall ของ area) — อันนี้สำหรับ location ประเภท "โถงอาคาร"
type HallFloorPlans struct {
	Base
	LocationID    uint       `gorm:"uniqueIndex;not null"`
	Location      *Locations `gorm:"foreignKey:LocationID"`
	TopViewImage  *string    // object_key ของรูปผัง top-view (แปลงเป็น presigned URL ตอนอ่าน)
	ImageNaturalW int        `gorm:"not null;default:0"`
	ImageNaturalH int        `gorm:"not null;default:0"`
	GridCols      int        `gorm:"not null;default:0"`
	GridRows      int        `gorm:"not null;default:0"`
	CellSizeM     float64    `gorm:"not null;default:1"`
	RealWidthM    *float64   // ความกว้างจริง (เมตร)
	RealLengthM   *float64   // ความยาวจริง (เมตร)
	OverlayX      float64    `gorm:"not null;default:0"`
	OverlayY      float64    `gorm:"not null;default:0"`
	OverlayW      float64    `gorm:"not null;default:1"`
	OverlayH      float64    `gorm:"not null;default:1"`
	PxPerMX       *float64   // pixel ต่อเมตร แกนกว้าง
	PxPerMY       *float64   // pixel ต่อเมตร แกนยาว
	BlockedCells  [][]int    `gorm:"serializer:json"` // ช่องห้ามจอง [[row,col], ...]
}
