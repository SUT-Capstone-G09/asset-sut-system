package repositories

import (
	"errors"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type PaymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) *PaymentRepository {
	return &PaymentRepository{db: db}
}

// FindByInvoiceID returns the payment tied to an invoice, or gorm.ErrRecordNotFound.
func (r *PaymentRepository) FindByInvoiceID(invoiceID uint) (*models.Payment, error) {
	var payment models.Payment
	err := r.db.Where("invoice_id = ?", invoiceID).First(&payment).Error
	return &payment, err
}

func (r *PaymentRepository) Create(payment *models.Payment) error {
	return r.db.Create(payment).Error
}

func (r *PaymentRepository) Save(payment *models.Payment) error {
	return r.db.Save(payment).Error
}

// UpsertForInvoice returns the existing payment for an invoice or creates a new
// one. Used by QR generation so repeated requests reuse the same payment row.
func (r *PaymentRepository) UpsertForInvoice(invoiceID uint, amount float64) (*models.Payment, error) {
	payment, err := r.FindByInvoiceID(invoiceID)
	if err == nil {
		return payment, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	payment = &models.Payment{InvoiceID: invoiceID, Amount: amount}
	if err := r.Create(payment); err != nil {
		return nil, err
	}
	return payment, nil
}
