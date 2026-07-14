package models

// BuildingTypes คือประเภทอาคารเช่าหลัก (เช่น โรงอาหาร, หอพักนักศึกษา, อาคารเรียนรวม)
// แอดมินสามารถเพิ่มหรือแก้ไขข้อมูลในตารางนี้ได้ ทำให้รองรับการจัดกลุ่มแบบยืดหยุ่นในอนาคต
type BuildingTypes struct {
	Base
	Name string `gorm:"not null;unique" json:"name"`
}

// Buildings คือสถานที่หลักที่มหาวิทยาลัยบริหาร
// ทำหน้าที่เป็น Container ของ RentalSpaces และ FloorPlan
// ตัวอย่าง: โรงอาหารพราวแสดทอง, โรงอาหารกาสะลองคำ, สุรนิเวศ 1, สุรพัฒน์ 2
type Buildings struct {
	Base
	Name string `gorm:"not null;unique"`
	// ราคาการขอใช้พื้นที่โถงของอาคารนี้ ย้ายไปอยู่ตาราง BuildingHallPricings (ราย อาคาร × วัตถุประสงค์)
	// ครอบคลุมทั้ง ตั้งบูธ (per_sqm) / แจกใบปลิว / แจกตัวอย่างสินค้า (per_type_per_day)
	HallPricings   []BuildingHallPricings `gorm:"foreignKey:BuildingID"`
	BuildingTypeID *uint                  `gorm:"index"` // Nullable สำหรับตึกเดี่ยวๆ ที่ไม่มีการจัดกลุ่มประเภท
	BuildingType   *BuildingTypes         `gorm:"foreignKey:BuildingTypeID"`
	RentalSpaces   []RentalSpaces         `gorm:"foreignKey:BuildingID"`
	FloorPlan      *FloorPlans            `gorm:"foreignKey:BuildingID"` // 0..1 optional
	Locations      []Locations            `gorm:"foreignKey:BuildingID"`
}
