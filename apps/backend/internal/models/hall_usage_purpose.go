package models

// วิธีคิดราคาของวัตถุประสงค์การขอใช้พื้นที่โถง
// ใช้เป็นตัวแยกพฤติกรรมการคิดเงินและ input ที่ต้องกรอกในหน้าจอง
const (
	// HallPricingPerSqm = คิดราคาตามพื้นที่ (ตร.ม.) โดยใช้เรทของอาคาร (ตั้งบูธ)
	// ราคา = พื้นที่ (ตร.ม.) × เรท/ตร.ม./วัน ของอาคาร × จำนวนวัน — ต้องกรอกพื้นที่
	HallPricingPerSqm = "per_sqm"
	// HallPricingPerTypePerDay = คิดราคาต่อประเภทสินค้าต่อวัน (แจกใบปลิว / แจกตัวอย่าง)
	// ราคา = DefaultPrice × จำนวนประเภทสินค้า × จำนวนวัน — ต้องกรอกจำนวนประเภทสินค้า
	HallPricingPerTypePerDay = "per_type_per_day"
)

// HallUsagePurposes คือ master data ของ "วัตถุประสงค์การขอใช้พื้นที่โถงอาคาร"
// ผู้ขอเลือกได้หลายข้อพร้อมกันตอนจอง (เช่น ตั้งบูธ + แจกใบปลิว) และแต่ละข้อคิดราคาแยกกันแล้วบวกรวม
// PricingModel เป็นตัวกำหนดว่าจะคิดเงินแบบไหนและต้องให้ผู้ขอกรอกข้อมูลอะไรเพิ่ม
type HallUsagePurposes struct {
	Base
	Name         string `gorm:"not null;unique" json:"name"`
	Description  string `json:"description"`
	PricingModel string `gorm:"type:varchar(30);not null" json:"pricing_model"` // per_sqm | per_type_per_day
	// DefaultPrice = ราคาต่อหน่วยเริ่มต้น (บาท) สำหรับแบบ per_type_per_day เช่น 500
	// แบบ per_sqm จะเป็น 0 เพราะเรทมาจากระดับอาคาร
	DefaultPrice int  `gorm:"not null;default:0" json:"default_price"`
	IsActive     bool `gorm:"not null;default:true" json:"is_active"`
	SortOrder    int  `gorm:"not null;default:0" json:"sort_order"`
}
