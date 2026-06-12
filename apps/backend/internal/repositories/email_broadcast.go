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
