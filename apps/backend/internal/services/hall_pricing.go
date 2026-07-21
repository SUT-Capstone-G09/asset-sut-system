package services

import (
	"errors"
	"fmt"
	"strings"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
)

// resolveHallUnitPrice คืนราคาต่อหน่วยที่ใช้จริง = max(floor, override)
//
//	floor    = ราคาของอาคาร (หรือ HallUsagePurposes.DefaultPrice ถ้าอาคารยังไม่ตั้งราคา)
//	override = ราคาเฉพาะโถง (ทำเลทอง) จาก LocationHallPricings ; nil = โถงนี้ไม่ได้ตั้งราคาเอง
//
// ใช้ max เพื่อให้ราคาอาคารเป็นขั้นต่ำเสมอ: ถ้าภายหลังอาคารขึ้นราคาจนแซงราคาโถงที่ตั้งไว้
// ระบบจะใช้ราคาอาคารทันทีโดยไม่ต้องไล่แก้ข้อมูลโถง (ค่า override เดิมยังเก็บไว้ ถ้าอาคารลดราคากลับก็กลับมาใช้)
func resolveHallUnitPrice(floor float64, override *float64) float64 {
	if override != nil && *override > floor {
		return *override
	}
	return floor
}

// HallPurposeInput = ข้อมูลวัตถุประสงค์ 1 ข้อที่ผู้ขอเลือกตอนจอง (ยังไม่ผูกกับ HTTP DTO)
// Purpose คือ master data ที่โหลดมาแล้ว (มี PricingModel) ; UnitPrice คือราคาต่อหน่วยที่ resolve มาแล้ว
type HallPurposeInput struct {
	Purpose *models.HallUsagePurposes // วัตถุประสงค์จาก master data

	// UnitPrice = ราคาต่อหน่วยที่ใช้จริงสำหรับ purpose นี้ — resolve มาก่อนแล้วโดยผู้เรียก
	// (max ของราคาอาคาร BuildingHallPricings กับราคาเฉพาะโถง LocationHallPricings ; fallback DefaultPrice)
	//   per_sqm          → บาท/ตร.ม./วัน
	//   per_type_per_day → บาท/ประเภทสินค้า/วัน
	UnitPrice float64

	// per_sqm (ตั้งบูธ)
	SelectedCells [][]int // เซลล์ที่เลือกบนผัง [[row,col], ...]
	CellSizeM     float64 // ขนาดเซลล์ (เมตร) จากผังของโถงนั้น

	// per_type_per_day (แจกใบปลิว / ตัวอย่าง)
	ProductTypeCount int      // จำนวนประเภทสินค้า
	ProductNames     []string // ชื่อสินค้าที่จะแจก (1 ชื่อต่อ 1 ประเภท) — ไม่กระทบราคา แต่ต้องระบุครบตอนสร้าง booking

	// ราคาที่ผู้ขอเสนอ (ยอดรวมต่อวัตถุประสงค์นี้) — nil = ไม่เสนอ ใช้ราคาระบบ
	ProposedPrice *float64
}

// CalculateHallPurpose คำนวณราคา BookingPurposes 1 แถว และตรวจว่าราคาที่เสนอไม่ต่ำกว่าเกณฑ์ระบบ
//
//	days = จำนวนวันของการจอง (จำนวน timeslots) ; < 1 จะถูกปรับเป็น 1
//	ราคาต่อหน่วยของทุก PricingModel มาจาก in.UnitPrice ที่ resolve มาแล้ว (ดู resolveHallUnitPrice)
//
// คืน error ถ้า input ไม่ครบ หรือราคาที่เสนอต่ำกว่าราคาขั้นต่ำ
func CalculateHallPurpose(in HallPurposeInput, days int) (*models.BookingPurposes, error) {
	if in.Purpose == nil {
		return nil, errors.New("ไม่พบวัตถุประสงค์การขอใช้พื้นที่")
	}
	if days < 1 {
		days = 1
	}

	bp := &models.BookingPurposes{
		HallUsagePurposeID: in.Purpose.ID,
		PricingModel:       in.Purpose.PricingModel,
	}

	// ราคาขั้นต่ำที่ระบบคิด (ยอดรวมทั้งการจอง)
	var computed float64

	switch in.Purpose.PricingModel {
	case models.HallPricingPerSqm:
		cells := len(in.SelectedCells)
		if cells == 0 {
			return nil, fmt.Errorf("วัตถุประสงค์ %q ต้องเลือกพื้นที่บูธอย่างน้อย 1 ช่อง", in.Purpose.Name)
		}
		if in.CellSizeM <= 0 {
			return nil, errors.New("ขนาดเซลล์ของผังพื้นที่ไม่ถูกต้อง")
		}
		area := float64(cells) * in.CellSizeM * in.CellSizeM
		cellSize := in.CellSizeM
		bp.SelectedCells = in.SelectedCells
		bp.CellSizeMSnapshot = &cellSize
		bp.AreaSqm = &area
		bp.UnitPriceSnapshot = in.UnitPrice
		computed = in.UnitPrice * area * float64(days)

	case models.HallPricingPerTypePerDay:
		if in.ProductTypeCount < 1 {
			return nil, fmt.Errorf("วัตถุประสงค์ %q ต้องระบุจำนวนประเภทสินค้าอย่างน้อย 1", in.Purpose.Name)
		}
		count := in.ProductTypeCount
		bp.ProductTypeCount = &count
		bp.UnitPriceSnapshot = in.UnitPrice
		// เก็บชื่อสินค้าที่จะแจก (ตัดช่องว่าง/ทิ้งชื่อว่าง) — จำกัดไม่เกินจำนวนประเภท
		// การบังคับ "ต้องระบุครบ" อยู่ที่ validateHallProductNames (เรียกตอนสร้าง/แก้ไข booking เท่านั้น
		// ไม่ใช่ตอน quote ราคา เพราะ quote ไม่ได้ส่งชื่อสินค้ามา)
		names := make([]string, 0, len(in.ProductNames))
		for _, n := range in.ProductNames {
			if t := strings.TrimSpace(n); t != "" {
				names = append(names, t)
			}
		}
		if len(names) > count {
			names = names[:count]
		}
		if len(names) > 0 {
			bp.ProductNames = names
		}
		computed = in.UnitPrice * float64(count) * float64(days)

	default:
		return nil, fmt.Errorf("ไม่รองรับวิธีคิดราคา %q", in.Purpose.PricingModel)
	}

	bp.ComputedPrice = computed

	// ราคาที่ใช้จริง: ถ้าผู้ขอเสนอราคา ต้องไม่ต่ำกว่าเกณฑ์ระบบ
	applied := computed
	if in.ProposedPrice != nil {
		if *in.ProposedPrice < computed {
			return nil, fmt.Errorf("ราคาที่เสนอ %.2f บาท ต่ำกว่าเกณฑ์ราคาขั้นต่ำสำหรับ %q", *in.ProposedPrice, in.Purpose.Name)
		}
		proposed := *in.ProposedPrice
		bp.ProposedPrice = &proposed
		applied = proposed
	}
	bp.TotalPrice = applied

	return bp, nil
}

// CalculateHallPurposes คำนวณทุกวัตถุประสงค์ที่เลือก แล้วแยกยอดตาม PricingModel
// per_sqm → basePrice (ค่าเช่าพื้นที่) ; per_type_per_day → addonPrice (ค่ากิจกรรม)
// ราคาต่อหน่วยของแต่ละ input มาจาก in.UnitPrice (ราคาของอาคารนั้น) ที่ resolve มาก่อนแล้ว
// ถ้ามีข้อใดราคาต่ำกว่าเกณฑ์/ข้อมูลไม่ครบ จะคืน error ทันที (all-or-nothing)
func CalculateHallPurposes(inputs []HallPurposeInput, days int) (lines []models.BookingPurposes, basePrice, addonPrice float64, err error) {
	if len(inputs) == 0 {
		return nil, 0, 0, errors.New("ต้องเลือกวัตถุประสงค์การขอใช้พื้นที่อย่างน้อย 1 ข้อ")
	}
	for _, in := range inputs {
		bp, e := CalculateHallPurpose(in, days)
		if e != nil {
			return nil, 0, 0, e
		}
		if bp.PricingModel == models.HallPricingPerSqm {
			basePrice += bp.TotalPrice
		} else {
			addonPrice += bp.TotalPrice
		}
		lines = append(lines, *bp)
	}
	return lines, basePrice, addonPrice, nil
}

// validateHallProductNames บังคับให้วัตถุประสงค์แบบ per_type_per_day (แจกใบปลิว/ตัวอย่างสินค้า)
// ต้องระบุชื่อสินค้าที่จะแจกให้ครบทุกประเภท (จำนวนชื่อ ≥ ProductTypeCount)
// เรียกเฉพาะตอนสร้าง/แก้ไข booking — ไม่เรียกตอน quote ราคา (quote ไม่ส่งชื่อสินค้ามา)
// ทำงานบน lines ที่ CalculateHallPurpose สร้างแล้ว (ชื่อถูก trim/ตัดว่าง/จำกัดจำนวนไว้แล้ว)
func validateHallProductNames(lines []models.BookingPurposes) error {
	for _, l := range lines {
		if l.PricingModel != models.HallPricingPerTypePerDay {
			continue
		}
		count := 0
		if l.ProductTypeCount != nil {
			count = *l.ProductTypeCount
		}
		if len(l.ProductNames) < count {
			return fmt.Errorf("กรุณาระบุชื่อสินค้าที่จะแจกให้ครบทั้ง %d ประเภท", count)
		}
	}
	return nil
}
