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

func (r *AdminRepository) FindAll() ([]models.Profiles, error) {
	var admins []models.Profiles
	err := r.db.
		Preload("User").
		Preload("User.Roles").
		Joins("JOIN users ON users.id = profiles.user_id").
		Joins("JOIN user_roles ON user_roles.users_id = users.id").
		Joins("JOIN roles ON roles.id = user_roles.roles_id").
		Where("roles.name = ?", "admin").
		Find(&admins).Error
	return admins, err
}

func (r *AdminRepository) FindByID(id uint) (*models.Profiles, error) {
	var admin models.Profiles
	err := r.db.
		Preload("User").
		Preload("User.Roles").
		Joins("JOIN users ON users.id = profiles.user_id").
		Joins("JOIN user_roles ON user_roles.users_id = users.id").
		Joins("JOIN roles ON roles.id = user_roles.roles_id").
		Where("roles.name = ?", "admin").
		Where("profiles.id = ?", id).
		First(&admin).Error
	return &admin, err
}

func (r *AdminRepository) FindByUserID(userID uint) (*models.Profiles, error) {
	var admin models.Profiles
	err := r.db.Where("user_id = ?", userID).First(&admin).Error
	return &admin, err
}

func (r *AdminRepository) Create(admin *models.Profiles) error {
	return r.db.Create(admin).Error
}

func (r *AdminRepository) Update(admin *models.Profiles) error {
	return r.db.Save(admin).Error
}

func (r *AdminRepository) Delete(id uint) error {
	return r.db.Delete(&models.Profiles{}, id).Error
}
