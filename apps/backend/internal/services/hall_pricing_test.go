package services

import (
	"testing"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
)

func boothPurpose() *models.HallUsagePurposes {
	p := &models.HallUsagePurposes{PricingModel: models.HallPricingPerSqm, DefaultPrice: 0}
	p.ID = 1
	p.Name = "ตั้งบูธ"
	return p
}

func flyerPurpose() *models.HallUsagePurposes {
	p := &models.HallUsagePurposes{PricingModel: models.HallPricingPerTypePerDay, DefaultPrice: 500}
	p.ID = 2
	p.Name = "แจกใบปลิว"
	return p
}

func intp(v int) *int { return &v }

// cells builds n dummy [row,col] cells (values don't matter for area = count × cellSize²).
func cells(n int) [][]int {
	out := make([][]int, n)
	for i := range out {
		out[i] = []int{0, i}
	}
	return out
}

func TestCalculateHallPurpose_Booth(t *testing.T) {
	// 6 ช่อง × cellSize 1m² = 6 ตร.ม. × 200 บาท/ตร.ม. × 1 วัน = 1200 (เกณฑ์ระบบ)
	tests := []struct {
		name         string
		proposed     *int
		wantErr      bool
		wantComputed int
		wantTotal    int
	}{
		{name: "ไม่เสนอราคา ใช้ราคาระบบ", proposed: nil, wantComputed: 1200, wantTotal: 1200},
		{name: "เสนอสูงกว่าเกณฑ์ ผ่าน คิดตามที่เสนอ", proposed: intp(2000), wantComputed: 1200, wantTotal: 2000},
		{name: "เสนอเท่าเกณฑ์พอดี ผ่าน", proposed: intp(1200), wantComputed: 1200, wantTotal: 1200},
		{name: "เสนอต่ำกว่าเกณฑ์ reject", proposed: intp(1000), wantErr: true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			in := HallPurposeInput{
				Purpose:       boothPurpose(),
				UnitPrice:     200,
				SelectedCells: cells(6),
				CellSizeM:     1,
				ProposedPrice: tt.proposed,
			}
			bp, err := CalculateHallPurpose(in, 1)
			if tt.wantErr {
				if err == nil {
					t.Fatalf("expected error for proposed below minimum, got nil (total=%d)", bp.TotalPrice)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if bp.ComputedPrice != tt.wantComputed {
				t.Errorf("ComputedPrice = %d, want %d", bp.ComputedPrice, tt.wantComputed)
			}
			if bp.TotalPrice != tt.wantTotal {
				t.Errorf("TotalPrice = %d, want %d", bp.TotalPrice, tt.wantTotal)
			}
			if bp.AreaSqm == nil || *bp.AreaSqm != 6 {
				t.Errorf("AreaSqm = %v, want 6", bp.AreaSqm)
			}
			if bp.UnitPriceSnapshot != 200 {
				t.Errorf("UnitPriceSnapshot = %d, want 200", bp.UnitPriceSnapshot)
			}
		})
	}
}

func TestCalculateHallPurpose_BoothMultiDayAndDecimalCell(t *testing.T) {
	// cellSize 0.5m → 0.25 ตร.ม./ช่อง ; 4 ช่อง = 1 ตร.ม. × 200 × 3 วัน = 600
	in := HallPurposeInput{Purpose: boothPurpose(), UnitPrice: 200, SelectedCells: cells(4), CellSizeM: 0.5}
	bp, err := CalculateHallPurpose(in, 3)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if bp.AreaSqm == nil || *bp.AreaSqm != 1 {
		t.Errorf("AreaSqm = %v, want 1", bp.AreaSqm)
	}
	if bp.ComputedPrice != 600 {
		t.Errorf("ComputedPrice = %d, want 600", bp.ComputedPrice)
	}
}

func TestCalculateHallPurpose_Flyer(t *testing.T) {
	// 500 บาท × 2 ประเภท × 3 วัน = 3000
	in := HallPurposeInput{Purpose: flyerPurpose(), UnitPrice: 500, ProductTypeCount: 2}
	bp, err := CalculateHallPurpose(in, 3)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if bp.ComputedPrice != 3000 || bp.TotalPrice != 3000 {
		t.Errorf("Computed/Total = %d/%d, want 3000/3000", bp.ComputedPrice, bp.TotalPrice)
	}
	if bp.ProductTypeCount == nil || *bp.ProductTypeCount != 2 {
		t.Errorf("ProductTypeCount = %v, want 2", bp.ProductTypeCount)
	}
}

func TestCalculateHallPurpose_Errors(t *testing.T) {
	if _, err := CalculateHallPurpose(HallPurposeInput{Purpose: boothPurpose(), UnitPrice: 200, CellSizeM: 1}, 1); err == nil {
		t.Error("expected error when booth has no selected cells")
	}
	if _, err := CalculateHallPurpose(HallPurposeInput{Purpose: flyerPurpose(), UnitPrice: 500, ProductTypeCount: 0}, 1); err == nil {
		t.Error("expected error when flyer has no product type count")
	}
	if _, err := CalculateHallPurpose(HallPurposeInput{Purpose: nil}, 1); err == nil {
		t.Error("expected error when purpose is nil")
	}
}

func TestCalculateHallPurposes_RollupAndSplit(t *testing.T) {
	// booth (base) 1200 + flyer (addon) 3000 = total 4200
	inputs := []HallPurposeInput{
		{Purpose: boothPurpose(), UnitPrice: 200, SelectedCells: cells(6), CellSizeM: 1},
		{Purpose: flyerPurpose(), UnitPrice: 500, ProductTypeCount: 2},
	}
	lines, base, addon, err := CalculateHallPurposes(inputs, 3)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(lines) != 2 {
		t.Fatalf("len(lines) = %d, want 2", len(lines))
	}
	// booth: 6 ตร.ม. × 200 × 3 วัน = 3600 ; flyer: 500 × 2 × 3 = 3000
	if base != 3600 {
		t.Errorf("basePrice = %d, want 3600", base)
	}
	if addon != 3000 {
		t.Errorf("addonPrice = %d, want 3000", addon)
	}
}

func TestCalculateHallPurposes_PropagatesError(t *testing.T) {
	inputs := []HallPurposeInput{
		{Purpose: boothPurpose(), UnitPrice: 200, SelectedCells: cells(6), CellSizeM: 1, ProposedPrice: intp(100)}, // ต่ำกว่าเกณฑ์
	}
	if _, _, _, err := CalculateHallPurposes(inputs, 1); err == nil {
		t.Error("expected error to propagate when a line is below minimum")
	}
	if _, _, _, err := CalculateHallPurposes(nil, 1); err == nil {
		t.Error("expected error when no purposes selected")
	}
}
