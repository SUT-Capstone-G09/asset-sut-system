package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type TenantRepository struct {
	db *gorm.DB
}

func NewTenantRepository(db *gorm.DB) *TenantRepository {
	return &TenantRepository{db: db}
}

func (r *TenantRepository) FindByUserID(userID uint) (*models.TenantProfiles, error) {
	var tenant models.TenantProfiles
	err := r.db.Where("user_id = ?", userID).First(&tenant).Error
	return &tenant, err
}

func (r *TenantRepository) Create(tenant *models.TenantProfiles) error {
	return r.db.Create(tenant).Error
}
