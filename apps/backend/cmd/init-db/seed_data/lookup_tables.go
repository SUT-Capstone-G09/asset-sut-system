package seeder

import (
	"log"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

func seedLookupTables(db *gorm.DB, cfg *config.Config) error {
	// Location types
	for _, t := range []string{"ห้องประชุม", "ห้องเรียน", "พื้นที่สาธารณะ", "อื่นๆ"} {
		if err := db.FirstOrCreate(&models.LocationTypes{}, models.LocationTypes{Type: t}).Error; err != nil {
			return err
		}
	}

	// Location statuses
	for _, s := range []string{"available", "unavailable", "maintenance"} {
		if err := db.FirstOrCreate(&models.LocationStatuses{}, models.LocationStatuses{Status: s}).Error; err != nil {
			return err
		}
	}

	// Booking statuses
	for _, s := range []string{"pending", "approved", "rejected", "cancelled", "completed"} {
		if err := db.FirstOrCreate(&models.BookingStatuses{}, models.BookingStatuses{Status: s}).Error; err != nil {
			return err
		}
	}

	// Timeslot statuses
	for _, s := range []string{"available", "booked", "blocked"} {
		if err := db.FirstOrCreate(&models.TimeslotStatuses{}, models.TimeslotStatuses{Status: s}).Error; err != nil {
			return err
		}
	}

	// Invoice statuses
	for _, s := range []string{"pending", "paid", "cancelled"} {
		if err := db.FirstOrCreate(&models.InvoiceStatuses{}, models.InvoiceStatuses{Status: s}).Error; err != nil {
			return err
		}
	}

	// Payment methods
	for _, m := range []string{"bank_transfer", "cash", "promptpay"} {
		if err := db.FirstOrCreate(&models.PaymentMethods{}, models.PaymentMethods{Method: m}).Error; err != nil {
			return err
		}
	}

	// Payment statuses
	for _, s := range []string{"pending", "approved", "rejected"} {
		if err := db.FirstOrCreate(&models.PaymentStatuses{}, models.PaymentStatuses{Status: s}).Error; err != nil {
			return err
		}
	}

	// Document types
	for _, t := range []string{"payment_slip", "booking_form", "id_card", "other"} {
		if err := db.FirstOrCreate(&models.DocumentTypes{}, models.DocumentTypes{Type: t}).Error; err != nil {
			return err
		}
	}

	// Upload methods
	for _, m := range []string{"upload", "url"} {
		if err := db.FirstOrCreate(&models.Methods{}, models.Methods{Method: m}).Error; err != nil {
			return err
		}
	}

	// Charge types
	for _, t := range []string{"per_use", "per_hour", "per_day"} {
		if err := db.FirstOrCreate(&models.ChargeTypes{}, models.ChargeTypes{Type: t}).Error; err != nil {
			return err
		}
	}

	// Rate types
	for _, t := range []string{"hourly", "daily", "fixed"} {
		if err := db.FirstOrCreate(&models.RateTypes{}, models.RateTypes{Type: t}).Error; err != nil {
			return err
		}
	}

	log.Println("Lookup tables seeded successfully.")
	return nil
}
