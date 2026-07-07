package seeder

import (
	"log"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type roomSeed struct {
	Name        string
	TypeName    string
	Building    string
	FloorNumber *int
	Capacity    int
	PriceHourly int
	Equipments  []string
}

func intPtr(v int) *int { return &v }
func strPtr(v string) *string { return &v }

var roomSeeds = []roomSeed{
	// ห้องประชุม
	{
		Name: "ห้องประชุม Executive A", TypeName: "ห้องประชุม", Building: "อาคารบริหาร",
		Capacity: 20, PriceHourly: 500,
		Equipments: []string{"WiFi", "โปรเจคเตอร์"},
	},
	{
		Name: "ห้องประชุมสร้างสรรค์ B", TypeName: "ห้องประชุม", Building: "อาคารบริหาร",
		Capacity: 20, PriceHourly: 450,
		Equipments: []string{"Smart TV", "WiFi"},
	},
	{
		Name: "ห้อง Boardroom Premium C", TypeName: "ห้องประชุม", Building: "อาคารบริหาร",
		FloorNumber: intPtr(45), Capacity: 25, PriceHourly: 800,
		Equipments: []string{"รวมบริการต้อนรับ", "WiFi"},
	},
	{
		Name: "ห้องประชุม Smart D", TypeName: "ห้องประชุม", Building: "อาคารเรียนรวม 1",
		FloorNumber: intPtr(3), Capacity: 15, PriceHourly: 350,
		Equipments: []string{"WiFi", "Smart TV"},
	},
	{
		Name: "ห้องประชุมย่อย Mini E", TypeName: "ห้องประชุม", Building: "อาคารเรียนรวม 2",
		FloorNumber: intPtr(1), Capacity: 10, PriceHourly: 200,
		Equipments: []string{"WiFi"},
	},
	{
		Name: "ห้องสัมมนา Grand Hall", TypeName: "ห้องประชุม", Building: "อาคารเรียนรวม 2",
		FloorNumber: intPtr(1), Capacity: 300, PriceHourly: 3500,
		Equipments: []string{"WiFi", "ระบบเสียง", "โปรเจคเตอร์", "รวมบริการต้อนรับ"},
	},
	{
		Name: "ห้องประชุม VIP Suite", TypeName: "ห้องประชุม", Building: "อาคารบริหาร",
		FloorNumber: intPtr(20), Capacity: 20, PriceHourly: 1200,
		Equipments: []string{"WiFi", "Smart TV", "รวมบริการต้อนรับ", "ที่จอดรถ"},
	},
	{
		Name: "ห้องประชุม Classic G", TypeName: "ห้องประชุม", Building: "อาคารเรียนรวม 1",
		FloorNumber: intPtr(2), Capacity: 30, PriceHourly: 400,
		Equipments: []string{"WiFi", "โปรเจคเตอร์"},
	},
	// ห้องเรียน
	{
		Name: "ห้องอบรม Training Room 1", TypeName: "ห้องเรียน", Building: "อาคารเรียนรวม 1",
		FloorNumber: intPtr(2), Capacity: 50, PriceHourly: 900,
		Equipments: []string{"WiFi", "โปรเจคเตอร์", "ไวท์บอร์ด"},
	},
	{
		Name: "ห้องปฏิบัติการ Innovation Lab", TypeName: "ห้องเรียน", Building: "อาคารเครื่องมือ F1",
		FloorNumber: intPtr(5), Capacity: 25, PriceHourly: 650,
		Equipments: []string{"WiFi", "Smart TV", "ไวท์บอร์ด"},
	},
	// โถงอาคาร
	{
		Name: "ห้อง Co-Working Space", TypeName: "โถงอาคาร", Building: "อาคารเครื่องมือ F1",
		FloorNumber: intPtr(4), Capacity: 30, PriceHourly: 300,
		Equipments: []string{"WiFi", "ที่จอดรถ"},
	},
	{
		Name: "ห้องอีเวนท์ Multipurpose Hall", TypeName: "โถงอาคาร", Building: "อาคารเครื่องมือ F2",
		FloorNumber: intPtr(1), Capacity: 500, PriceHourly: 8000,
		Equipments: []string{"WiFi", "ระบบเสียง", "แสงสี", "โปรเจคเตอร์", "รวมบริการต้อนรับ"},
	},
}

func seedLocations(db *gorm.DB, cfg *config.Config) error {
	// Lookup tables
	var availableStatus models.LocationStatuses
	if err := db.Where("status = ?", "available").First(&availableStatus).Error; err != nil {
		return err
	}
	var hourlyRate models.RateTypes
	if err := db.Where("type = ?", "hourly").First(&hourlyRate).Error; err != nil {
		return err
	}
	var dailyRate models.RateTypes
	if err := db.Where("type = ?", "daily").First(&dailyRate).Error; err != nil {
		return err
	}
	var internalType models.RequesterTypes
	if err := db.Where("type = ?", "ผู้ขอใช้บริการภายใน").First(&internalType).Error; err != nil {
		return err
	}
	var externalType models.RequesterTypes
	if err := db.Where("type = ?", "ผู้ขอใช้บริการภายนอก").First(&externalType).Error; err != nil {
		return err
	}

	for _, r := range roomSeeds {
		// Get or create building — done unconditionally (not just for new
		// locations) so pre-existing seeded locations get backfilled below too.
		var bldg models.Buildings
		if err := db.FirstOrCreate(&bldg, models.Buildings{Name: r.Building}).Error; err != nil {
			return err
		}

		// Get or create location (existing locations are reused so newly added
		// pricing tiers below still get applied to them)
		var location models.Locations
		if err := db.Where("name = ?", r.Name).First(&location).Error; err != nil {
			// Get or create location type
			var locType models.LocationTypes
			if err := db.FirstOrCreate(&locType, models.LocationTypes{Type: r.TypeName}).Error; err != nil {
				return err
			}

			location = models.Locations{
				Name:        r.Name,
				BuildingID:  &bldg.ID,
				TypeID:      locType.ID,
				StatusID:    availableStatus.ID,
				Capacity:    r.Capacity,
				FloorNumber: r.FloorNumber,
			}
			if err := db.Create(&location).Error; err != nil {
				return err
			}
		} else if location.BuildingID == nil {
			// Backfill: location already existed from before buildings were tracked.
			location.BuildingID = &bldg.ID
			if err := db.Model(&location).Update("building_id", bldg.ID).Error; err != nil {
				return err
			}
		}

		// Link equipments
		for _, eqName := range r.Equipments {
			var eq models.Equipments
			if err := db.FirstOrCreate(&eq, models.Equipments{Name: eqName}).Error; err != nil {
				return err
			}
			le := models.LocationEquipments{
				LocationID:  location.ID,
				EquipmentID: eq.ID,
				Quantity:    1,
			}
			db.FirstOrCreate(&le, models.LocationEquipments{LocationID: location.ID, EquipmentID: eq.ID})
		}

		// Pricing tiers — internal & external, hourly & daily.
		// Daily rate ≈ 8 effective hours (discount vs. booking by the hour all day).
		tiers := []models.LocationPricingTiers{
			{LocationID: location.ID, RequesterTypeID: internalType.ID, RateTypeID: hourlyRate.ID, Price: r.PriceHourly},
			{LocationID: location.ID, RequesterTypeID: externalType.ID, RateTypeID: hourlyRate.ID, Price: r.PriceHourly * 2},
			{LocationID: location.ID, RequesterTypeID: internalType.ID, RateTypeID: dailyRate.ID, Price: r.PriceHourly * 8},
			{LocationID: location.ID, RequesterTypeID: externalType.ID, RateTypeID: dailyRate.ID, Price: (r.PriceHourly * 2) * 8},
		}
		for _, t := range tiers {
			db.FirstOrCreate(&t, models.LocationPricingTiers{
				LocationID:      t.LocationID,
				RequesterTypeID: t.RequesterTypeID,
				RateTypeID:      t.RateTypeID,
			})
		}
	}

	log.Println("Locations seeded successfully.")
	return nil
}
