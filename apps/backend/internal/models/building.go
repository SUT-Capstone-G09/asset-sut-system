package models

// BuildingTypes คือประเภทอาคารเช่าหลัก (เช่น โรงอาหาร, หอพักนักศึกษา, อาคารเรียนรวม)
type BuildingTypes struct {
	Base
	Name string `gorm:"type:varchar(100);not null;unique" json:"name"`
}

// Buildings คือสถานที่หลักที่มหาวิทยาลัยบริหาร
// ตัวอย่าง: โรงอาหารพราวแสดทอง, โรงอาหารกาสะลองคำ, สุรนิเวศ 1, สุรพัฒน์ 2
type Buildings struct {
	Base
	Name           string         `gorm:"type:varchar(150);not null;unique"`
	Description    *string        `gorm:"type:text"`
	BuildingTypeID *uint          `gorm:"index:idx_buildings_building_type_id"`
	BuildingType   *BuildingTypes `gorm:"foreignKey:BuildingTypeID"`
	Lat            *float64       `gorm:"type:decimal(10,7)"`
	Lng            *float64       `gorm:"type:decimal(10,7)"`
	Address        string         `gorm:"type:varchar(500);not null;default:''"`
	FloorCount     int            `gorm:"not null;default:1"`
	HasFloorPlan   bool           `gorm:"not null;default:false"`
	BlueprintURL   *string        `gorm:"type:varchar(255)"`
	RentalSpaces   []RentalSpaces `gorm:"foreignKey:BuildingID"`
	FloorPlans     []FloorPlans   `gorm:"foreignKey:BuildingID"` 
	Locations      []Locations    `gorm:"foreignKey:BuildingID"`
	// ราคาการขอใช้พื้นที่โถงของอาคารนี้ ย้ายไปอยู่ตาราง BuildingHallPricings (ราย อาคาร × วัตถุประสงค์)
	// ครอบคลุมทั้ง ตั้งบูธ (per_sqm) / แจกใบปลิว / แจกตัวอย่างสินค้า (per_type_per_day)
	HallPricings []BuildingHallPricings `gorm:"foreignKey:BuildingID"`
}
