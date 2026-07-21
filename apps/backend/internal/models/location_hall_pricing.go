package models

// LocationHallPricings = ราคาเฉพาะโถง (ทำเลทอง) ราย "โถง × วัตถุประสงค์"
// เป็น override ของ BuildingHallPricings สำหรับโถงที่ทำเลดีกว่าโถงอื่นในอาคารเดียวกัน
// (เช่น อยู่ทางเข้าหลัก คนพลุกพล่าน) จึงคิดราคาสูงกว่าเรทกลางของอาคารได้
//
// ราคาอาคารเป็น "ขั้นต่ำ" เสมอ — ราคาที่ใช้จริง = max(ราคาอาคาร, ราคาโถง) ดู resolveHallUnitPrice
// ไม่มีแถว = โถงนี้ใช้ราคาอาคารตามปกติ
//
// ไม่มี IsActive โดยตั้งใจ: การเปิด/ปิดวัตถุประสงค์ยังคุมที่ระดับอาคาร (BuildingHallPricings.IsActive)
// ถ้าอาคารปิดวัตถุประสงค์ไหน โถงในอาคารนั้นก็ขอไม่ได้ ตารางนี้ทำหน้าที่เดียวคือ "ราคา"
//
// unique (LocationID, HallUsagePurposeID): 1 โถงมีได้ 1 ราคาต่อ 1 วัตถุประสงค์
type LocationHallPricings struct {
	Base
	LocationID         uint               `gorm:"not null;uniqueIndex:idx_location_hall_purpose" json:"location_id"`
	Location           *Locations         `gorm:"foreignKey:LocationID" json:"location,omitempty"`
	HallUsagePurposeID uint               `gorm:"not null;uniqueIndex:idx_location_hall_purpose" json:"hall_usage_purpose_id"`
	HallUsagePurpose   *HallUsagePurposes `gorm:"foreignKey:HallUsagePurposeID" json:"hall_usage_purpose,omitempty"`
	// Price = ราคาต่อหน่วยเฉพาะโถงนี้ (ความหมายตาม PricingModel ของ purpose เหมือน BuildingHallPricings.Price)
	// เก็บเป็น int ชั่วคราว รอแปลงทั้งระบบเป็น decimal(12,2)
	Price float64 `gorm:"not null;default:0" json:"price"`
}
