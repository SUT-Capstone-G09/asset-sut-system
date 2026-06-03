package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type InvoiceRepository struct {
	db *gorm.DB
}

func NewInvoiceRepository(db *gorm.DB) *InvoiceRepository {
	return &InvoiceRepository{db: db}
}

func (r *InvoiceRepository) FindByID(id uint) (*models.Invoice, error) {
	var invoice models.Invoice
	err := r.db.First(&invoice, id).Error
	return &invoice, err
}
