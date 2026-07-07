package repositories

import (
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
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
		Preload("Booking").
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

// UpdateQRByBookingID stores the issued QR (reference, payload, object key) on the
// booking's invoice so a later uploaded slip can be matched back to it. It updates
// only the QR columns; a booking without an invoice simply updates zero rows.
func (r *InvoiceRepository) UpdateQRByBookingID(bookingID uint, ref1, payload, objectKey string, issuedAt time.Time) error {
	return r.db.Model(&models.Invoices{}).
		Where("booking_id = ?", bookingID).
		Updates(map[string]interface{}{
			"qr_ref1":       ref1,
			"qr_payload":    payload,
			"qr_object_key": objectKey,
			"qr_issued_at":  issuedAt,
		}).Error
}

func (r *InvoiceRepository) Update(invoice *models.Invoices) error {
	return r.db.Omit("Status", "Transactions", "Booking").Save(invoice).Error
}

func (r *InvoiceRepository) FindStatusByName(name string) (*models.InvoiceStatuses, error) {
	var status models.InvoiceStatuses
	err := r.db.Where("status = ?", name).First(&status).Error
	return &status, err
}
