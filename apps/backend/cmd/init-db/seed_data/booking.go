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
	BasePrice      int
	TotalPrice     int
	LocationName   string
}

var sampleBookings = []bookingSeed{
	{
		RequesterEmail: "worawut@gmail.com",
		Purpose:        "ประชุมโครงงาน Capstone",
		BasePrice:      150,
		TotalPrice:     150,
		LocationName:   "ห้องประชุม Executive A",
	},
	{
		RequesterEmail: "worawut@gmail.com",
		Purpose:        "สัมมนาเทคโนโลยี",
		BasePrice:      2500,
		TotalPrice:     2500,
		LocationName:   "ห้องสัมมนา Grand Hall",
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

	now := time.Now()

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

		// Create Booking struct
		booking := models.Bookings{
			UserID:     user.ID,
			Purpose:    seed.Purpose,
			BasePrice:  seed.BasePrice,
			TotalPrice: seed.TotalPrice,
			StatusID:   status.ID,
		}
		if err := db.FirstOrCreate(&booking, models.Bookings{Purpose: booking.Purpose, UserID: booking.UserID}).Error; err != nil {
			return err
		}

		// Check if timeslot already exists for this booking
		var existingTS models.Timeslots
		if err := db.Where("booking_id = ?", booking.ID).First(&existingTS).Error; err != nil {
			dateOnly := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
			startTime := time.Date(now.Year(), now.Month(), now.Day(), 16, 0, 0, 0, time.UTC)
			endTime := time.Date(now.Year(), now.Month(), now.Day(), 19, 0, 0, 0, time.UTC)

			ts := models.Timeslots{
				LocationID:    loc.ID,
				BookingID:     &booking.ID,
				Date:          dateOnly,
				StartTime:     startTime,
				EndTime:       endTime,
				PriceSnapshot: booking.TotalPrice,
				StatusID:      tsStatus.ID,
			}
			if err := db.Create(&ts).Error; err != nil {
				return err
			}
		}
	}

	log.Println("Sample bookings and timeslots seeded successfully.")
	return nil
}
