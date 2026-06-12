package seeder

import (
	"log"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

// sampleInvoices are matched on BookingID so re-running the seeder is idempotent
// (one invoice per booking). BookingID is a placeholder reference; bookings are
// not seeded/migrated yet.
var sampleInvoices = []models.Invoice{
	{BookingID: 1, TotalAmount: 150.00},
	{BookingID: 2, TotalAmount: 2500.50},
}

func seedInvoices(db *gorm.DB, cfg *config.Config) error {
	for _, inv := range sampleInvoices {
		if err := db.FirstOrCreate(&inv, models.Invoice{BookingID: inv.BookingID}).Error; err != nil {
			return err
		}
	}
	log.Println("Sample invoices seeded successfully.")
	return nil
}
