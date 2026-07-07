package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type PaymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) *PaymentRepository {
	return &PaymentRepository{db: db}
}

func (r *PaymentRepository) FindByID(id uint) (*models.PaymentTransactions, error) {
	var tx models.PaymentTransactions
	err := r.db.
		Preload("Method").
		Preload("Status").
		Preload("Verifier.Profiles").
		First(&tx, id).Error
	return &tx, err
}

func (r *PaymentRepository) FindByInvoiceID(invoiceID uint) ([]models.PaymentTransactions, error) {
	var txs []models.PaymentTransactions
	err := r.db.
		Where("invoice_id = ?", invoiceID).
		Preload("Method").
		Preload("Status").
		Preload("Verifier.Profiles").
		Find(&txs).Error
	return txs, err
}

func (r *PaymentRepository) Create(tx *models.PaymentTransactions) error {
	return r.db.Create(tx).Error
}

// Save (not Updates) so zero-value field changes persist — but a plain Save
// also re-upserts any preloaded association (Status, Verifier, ...), and when
// that association object is stale relative to a just-changed FK column (e.g.
// StatusID reassigned while the preloaded Status still points at the old
// row), GORM writes the association back and overwrites the FK with the
// stale value. Omit(clause.Associations) keeps Save scoped to tx's own
// columns.
func (r *PaymentRepository) Update(tx *models.PaymentTransactions) error {
	return r.db.Omit(clause.Associations).Save(tx).Error
}

func (r *PaymentRepository) FindStatusByName(name string) (*models.PaymentStatuses, error) {
	var status models.PaymentStatuses
	err := r.db.Where("status = ?", name).First(&status).Error
	return &status, err
}

func (r *PaymentRepository) FindMethodByID(id uint) (*models.PaymentMethods, error) {
	var method models.PaymentMethods
	err := r.db.First(&method, id).Error
	return &method, err
}

func (r *PaymentRepository) FindMethodByName(name string) (*models.PaymentMethods, error) {
	var method models.PaymentMethods
	err := r.db.Where("method = ?", name).First(&method).Error
	return &method, err
}

// FindBySlipTransRef looks up a transaction by the bank transaction reference read
// from a slip. Used to reject a slip that has already been submitted (dedupe).
func (r *PaymentRepository) FindBySlipTransRef(transRef string) (*models.PaymentTransactions, error) {
	var tx models.PaymentTransactions
	err := r.db.Where("slip_trans_ref = ?", transRef).First(&tx).Error
	return &tx, err
}

func (r *PaymentRepository) FindAll() ([]models.PaymentTransactions, error) {
	var txs []models.PaymentTransactions
	err := r.db.
		Preload("Method").
		Preload("Status").
		Preload("Verifier.Profiles").
		Preload("Invoice.Booking.User").
		Preload("Invoice.Booking.Timeslots.Location").
		Order("created_at DESC").
		Find(&txs).Error
	return txs, err
}
