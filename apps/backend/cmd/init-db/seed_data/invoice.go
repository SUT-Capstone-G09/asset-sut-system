package seeder

import (
	"log"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

// seedInvoices creates one pending invoice per booking, deriving the amount from
// the booking's total_price so the two never drift apart (the QR and slip
// verification both read the booking amount).
func seedInvoices(db *gorm.DB, cfg *config.Config) error {
	var pending models.InvoiceStatuses
	if err := db.Where("status = ?", "pending").First(&pending).Error; err != nil {
		return err
	}

	var bookings []models.Bookings
	if err := db.Find(&bookings).Error; err != nil {
		return err
	}

	for _, b := range bookings {
		inv := models.Invoices{BookingID: b.ID, StatusID: pending.ID, TotalAmount: b.TotalPrice}
		if err := db.FirstOrCreate(&inv, models.Invoices{BookingID: b.ID}).Error; err != nil {
			return err
		}
	}
	log.Println("Sample invoices seeded successfully.")
	return nil
}
