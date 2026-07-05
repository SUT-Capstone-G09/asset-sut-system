package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type InvoiceRepository struct {
	db *gorm.DB
}

func NewInvoiceRepository(db *gorm.DB) *InvoiceRepository {
	return &InvoiceRepository{db: db}
}

func (r *InvoiceRepository) FindByBookingID(bookingID uint) (*models.Invoices, error) {
	var invoice models.Invoices
	err := r.db.
		Preload("Status").
		Preload("Transactions.Method").
		Preload("Transactions.Status").
		Where("booking_id = ?", bookingID).
		First(&invoice).Error
	return &invoice, err
}

func (r *InvoiceRepository) FindByID(id uint) (*models.Invoices, error) {
	var invoice models.Invoices
	err := r.db.
		Preload("Status").
		Preload("Transactions.Method").
		Preload("Transactions.Status").
		Preload("Transactions.Verifier").
		First(&invoice, id).Error
	return &invoice, err
}

func (r *InvoiceRepository) Create(invoice *models.Invoices) error {
	return r.db.Create(invoice).Error
}

// Omit(clause.Associations): FindByID preloads Status, so a plain Save would
// re-upsert that association from its (now stale) in-memory value and
// silently overwrite a StatusID change made after loading — same pitfall as
// PaymentRepository.Update.
func (r *InvoiceRepository) Update(invoice *models.Invoices) error {
	return r.db.Omit(clause.Associations).Save(invoice).Error
}

func (r *InvoiceRepository) FindStatusByName(name string) (*models.InvoiceStatuses, error) {
	var status models.InvoiceStatuses
	err := r.db.Where("status = ?", name).First(&status).Error
	return &status, err
}
