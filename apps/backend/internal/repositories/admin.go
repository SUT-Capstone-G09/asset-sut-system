package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type AdminRepository struct {
	db *gorm.DB
}

func NewAdminRepository(db *gorm.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

func (r *AdminRepository) FindAll() ([]models.Admins, error) {
	var admins []models.Admins
	err := r.db.Preload("User").Find(&admins).Error
	return admins, err
}

func (r *AdminRepository) FindByID(id uint) (*models.Admins, error) {
	var admin models.Admins
	err := r.db.Preload("User").First(&admin, id).Error
	return &admin, err
}

func (r *AdminRepository) FindByUserID(userID uint) (*models.Admins, error) {
	var admin models.Admins
	err := r.db.Where("user_id = ?", userID).First(&admin).Error
	return &admin, err
}

func (r *AdminRepository) Create(admin *models.Admins) error {
	return r.db.Create(admin).Error
}

func (r *AdminRepository) Update(admin *models.Admins) error {
	return r.db.Save(admin).Error
}

func (r *AdminRepository) Delete(id uint) error {
	return r.db.Delete(&models.Admins{}, id).Error
}
