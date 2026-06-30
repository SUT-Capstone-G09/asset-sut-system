package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type EmailBroadcastRepository struct {
	db *gorm.DB
}

func NewEmailBroadcastRepository(db *gorm.DB) *EmailBroadcastRepository {
	return &EmailBroadcastRepository{db: db}
}

func (r *EmailBroadcastRepository) Create(b *models.EmailBroadcast) error {
	return r.db.Create(b).Error
}

// CreateWithOutbox persists a broadcast and its outbox rows atomically. The rows'
// BroadcastID is filled from the new broadcast id inside the transaction, so a
// failed batch insert rolls the broadcast back too — never a broadcast with no
// recipients.
func (r *EmailBroadcastRepository) CreateWithOutbox(b *models.EmailBroadcast, rows []*models.EmailOutbox) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(b).Error; err != nil {
			return err
		}
		for _, row := range rows {
			row.BroadcastID = &b.ID
		}
		if len(rows) == 0 {
			return nil
		}
		return tx.CreateInBatches(rows, 200).Error
	})
}

func (r *EmailBroadcastRepository) FindByID(id uint) (*models.EmailBroadcast, error) {
	var b models.EmailBroadcast
	err := r.db.First(&b, id).Error
	return &b, err
}

func (r *EmailBroadcastRepository) FindAll() ([]models.EmailBroadcast, error) {
	var list []models.EmailBroadcast
	err := r.db.Order("created_at desc").Find(&list).Error
	return list, err
}
