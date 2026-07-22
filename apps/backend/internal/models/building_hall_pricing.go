package models

// BuildingHallPricings = ตารางราคาการขอใช้พื้นที่โถงราย "อาคาร × วัตถุประสงค์" (many-to-many)
// 1 อาคารมีได้หลายแถว แถวละ 1 วัตถุประสงค์ (ตั้งบูธ / ใบปลิว / ตัวอย่างสินค้า) พร้อมราคาของอาคารนั้น
// เป็น single source of truth ของราคาโถง แทนที่ Building.RatePerSqm เดิม (ที่ตั้งได้เฉพาะบูธ)
//
// ความหมายของ Price ขึ้นกับ PricingModel ของ HallUsagePurpose ที่อ้างถึง:
//   - per_sqm          → บาท/ตร.ม./วัน (ค่าเช่าพื้นที่ตั้งบูธของอาคารนี้)
//   - per_type_per_day → บาท/ประเภทสินค้า/วัน (เช่น แจกใบปลิว / แจกตัวอย่างสินค้า)
//
// IsActive = อาคารนี้เปิดให้ขอวัตถุประสงค์นี้หรือไม่ (ปิดรายอาคารได้ โดยไม่ต้องลบแถว)
// unique (BuildingID, HallUsagePurposeID): 1 อาคารมีได้ 1 ราคาต่อ 1 วัตถุประสงค์
type BuildingHallPricings struct {
	Base
	BuildingID         uint               `gorm:"not null;uniqueIndex:idx_building_hall_purpose" json:"building_id"`
	Building           *Buildings         `gorm:"foreignKey:BuildingID" json:"building,omitempty"`
	HallUsagePurposeID uint               `gorm:"not null;uniqueIndex:idx_building_hall_purpose" json:"hall_usage_purpose_id"`
	HallUsagePurpose   *HallUsagePurposes `gorm:"foreignKey:HallUsagePurposeID" json:"hall_usage_purpose,omitempty"`
	// Price = ราคาต่อหน่วยของอาคารนี้ (ความหมายตาม PricingModel) — เก็บเป็น int ชั่วคราว รอแปลงทั้งระบบเป็น decimal(12,2)
	Price    float64 `gorm:"not null;default:0" json:"price"`
	IsActive bool    `gorm:"not null;default:true" json:"is_active"`
}
