package seeder

import (
	"log"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

var sampleInvoices = []models.Invoices{
	{BookingID: 1, StatusID: 1, TotalAmount: 150},
	{BookingID: 2, StatusID: 1, TotalAmount: 2500},
}

func seedInvoices(db *gorm.DB, cfg *config.Config) error {
	for _, inv := range sampleInvoices {
		if err := db.FirstOrCreate(&inv, models.Invoices{BookingID: inv.BookingID}).Error; err != nil {
			return err
		}
	}
	log.Println("Sample invoices seeded successfully.")
	return nil
}
