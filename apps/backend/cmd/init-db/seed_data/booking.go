package seeder

import (
	"log"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type bookingSeed struct {
	RequesterEmail string
	Purpose        string
	LocationName   string
	// Addon items to attach to this booking's timeslot
	AddonNames []string
}

var sampleBookings = []bookingSeed{
	{
		RequesterEmail: "worawut@gmail.com",
		Purpose:        "ประชุมโครงงาน Capstone",
		LocationName:   "ห้องประชุม Executive A",
		AddonNames:     []string{"ค่าเก็บขยะ", "น้ำดื่มและเครื่องดื่มบริการ"},
	},
	{
		RequesterEmail: "worawut@gmail.com",
		Purpose:        "สัมมนาเทคโนโลยี",
		LocationName:   "ห้องสัมมนา Grand Hall",
		AddonNames:     []string{"แม่บ้าน", "พนักงานรักษาความปลอดภัย"},
	},
}

func seedBookings(db *gorm.DB, cfg *config.Config) error {
	// Find booking status
	var status models.BookingStatuses
	if err := db.Where("status = ?", "pending").First(&status).Error; err != nil {
		return err
	}

	// Find timeslot status
	var tsStatus models.TimeslotStatuses
	if err := db.Where("status = ?", "available").First(&tsStatus).Error; err != nil {
		return err
	}

	// Find internal requester type (ใช้คำนวณ base price)
	var internalType models.RequesterTypes
	if err := db.Where("type = ?", "ผู้ขอใช้บริการภายใน").First(&internalType).Error; err != nil {
		return err
	}

	// Find hourly rate type
	var hourlyRate models.RateTypes
	if err := db.Where("type = ?", "hourly").First(&hourlyRate).Error; err != nil {
		return err
	}

	now := time.Now()
	// Timeslot: 16:00 - 19:00 = 3 hours
	startTime := time.Date(now.Year(), now.Month(), now.Day(), 16, 0, 0, 0, time.UTC)
	endTime := time.Date(now.Year(), now.Month(), now.Day(), 19, 0, 0, 0, time.UTC)

	for _, seed := range sampleBookings {
		// Find user
		var user models.Users
		if err := db.Where("email = ?", seed.RequesterEmail).First(&user).Error; err != nil {
			return err
		}

		// Find location
		var loc models.Locations
		if err := db.Where("name = ?", seed.LocationName).First(&loc).Error; err != nil {
			return err
		}

		// Get pricing tier for internal requester, hourly rate
		var pricingTier models.LocationPricingTiers
		if err := db.Where("location_id = ? AND requester_type_id = ? AND rate_type_id = ?",
			loc.ID, internalType.ID, hourlyRate.ID).First(&pricingTier).Error; err != nil {
			return err
		}

		// BasePrice is left as 0 (null equivalent) as requested
		basePrice := 0

		// Calculate addon total price starting with normal addons
		addonTotal := 0
		var addonRecords []models.LocationAddons
		for _, addonName := range seed.AddonNames {
			var addon models.LocationAddons
			if err := db.Where("name = ? AND location_id IS NULL", addonName).First(&addon).Error; err != nil {
				return err
			}
			addonRecords = append(addonRecords, addon)
			addonTotal += addon.DefaultPrice * addon.Quantity
		}

		totalPrice := addonTotal

		// Create Booking
		booking := models.Bookings{
			UserID:     user.ID,
			Purpose:    seed.Purpose,
			BasePrice:  basePrice,
			AddonPrice: addonTotal,
			TotalPrice: totalPrice,
			StatusID:   status.ID,
		}
		if err := db.FirstOrCreate(&booking, models.Bookings{Purpose: booking.Purpose, UserID: booking.UserID}).Error; err != nil {
			return err
		}

		// Check if timeslot already exists for this booking
		var existingTS models.Timeslots
		if err := db.Where("booking_id = ?", booking.ID).First(&existingTS).Error; err != nil {
			dateOnly := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)

			ts := models.Timeslots{
				LocationID:    loc.ID,
				BookingID:     &booking.ID,
				Date:          dateOnly,
				StartTime:     startTime,
				EndTime:       endTime,
				PriceSnapshot: addonTotal,
				StatusID:      tsStatus.ID,
			}
			if err := db.Create(&ts).Error; err != nil {
				return err
			}

			// Create normal addons
			for _, addon := range addonRecords {
				addonID := addon.ID
				bta := models.BookingTimeslotAddons{
					LocationAddonID: &addonID,
					TimeslotID:      ts.ID,
					Name:            addon.Name,
					AppliedPrice:    addon.DefaultPrice,
					Quantity:        addon.Quantity,
					TotalPrice:      addon.DefaultPrice * addon.Quantity,
				}
				if err := db.Create(&bta).Error; err != nil {
					return err
				}
			}
		}
	}

	log.Println("Sample bookings and timeslots seeded successfully.")
	return nil
}
