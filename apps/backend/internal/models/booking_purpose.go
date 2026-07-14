package models

// BookingPurposes = วัตถุประสงค์ที่ผู้ขอเลือกตอนจองพื้นที่โถง (1 booking มีได้หลายแถว เลือกได้หลายข้อ)
// แต่ละแถวอ้างอิง master data HallUsagePurposes และ snapshot ค่าที่ใช้คิดเงินไว้ กันข้อมูลต้นทาง (เรทอาคาร/ผัง) เปลี่ยนย้อนหลัง
//
// ขอบเขต (ตกลงไว้): 1 booking = 1 สถานที่ ; ราคาคิดต่อวัน โดยจำนวนวันมาจากจำนวน Timeslots ของ booking นั้น
// การคิดราคาขั้นต่ำของระบบ (ComputedPrice) ตาม PricingModel:
//   - per_sqm (ตั้งบูธ): ComputedPrice = UnitPriceSnapshot × AreaSqm × วัน ; AreaSqm = จำนวนเซลล์ × CellSizeMSnapshot²
//   - per_type_per_day (แจกใบปลิว/ตัวอย่าง): ComputedPrice = UnitPriceSnapshot × ProductTypeCount × วัน
//
// ผู้ขอเสนอราคาเองได้ (ProposedPrice) แต่ต้องไม่ต่ำกว่า ComputedPrice ; TotalPrice ที่ใช้จริง = ProposedPrice ถ้ามี ไม่งั้น ComputedPrice
type BookingPurposes struct {
	Base
	BookingID          uint               `gorm:"not null;index" json:"booking_id"`
	Booking            *Bookings          `gorm:"foreignKey:BookingID" json:"booking,omitempty"`
	HallUsagePurposeID uint               `gorm:"not null" json:"hall_usage_purpose_id"`
	HallUsagePurpose   *HallUsagePurposes `gorm:"foreignKey:HallUsagePurposeID" json:"hall_usage_purpose,omitempty"`
	PricingModel       string             `gorm:"type:varchar(30);not null" json:"pricing_model"` // snapshot: per_sqm | per_type_per_day

	// per_sqm (ตั้งบูธ) — พื้นที่มาจากเซลล์ที่เลือกบนผัง floor plan ของโถง
	SelectedCells     [][]int  `gorm:"serializer:json" json:"selected_cells,omitempty"` // [[row,col], ...]
	CellSizeMSnapshot *float64 `json:"cell_size_m_snapshot,omitempty"`                  // ขนาดเซลล์ (เมตร) ตอนจอง
	AreaSqm           *float64 `gorm:"type:decimal(12,2)" json:"area_sqm,omitempty"`    // = จำนวนเซลล์ × CellSizeMSnapshot²

	// per_type_per_day (แจกใบปลิว / แจกตัวอย่างสินค้า)
	ProductTypeCount *int `json:"product_type_count,omitempty"`

	// ราคา (snapshot) — เก็บเป็น int ชั่วคราว รอแปลงทั้งระบบเป็น decimal(12,2) ใน session ถัดไป
	UnitPriceSnapshot int  `gorm:"not null;default:0" json:"unit_price_snapshot"` // ราคาต่อหน่วยของอาคารสำหรับ purpose นี้ (จาก BuildingHallPricings.Price ; fallback HallUsagePurposes.DefaultPrice)
	ComputedPrice     int  `gorm:"not null;default:0" json:"computed_price"`      // ราคาขั้นต่ำที่ระบบคำนวณ (เกณฑ์)
	ProposedPrice     *int `json:"proposed_price,omitempty"`                      // ราคาที่ผู้ขอเสนอ (ต้อง ≥ ComputedPrice) ; nil = ใช้ราคาระบบ
	TotalPrice        int  `gorm:"not null;default:0" json:"total_price"`         // ราคาที่ใช้จริง = ProposedPrice ?? ComputedPrice
}
