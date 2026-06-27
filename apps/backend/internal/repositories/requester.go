package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type RequesterRepository struct {
	db *gorm.DB
}

func NewRequesterRepository(db *gorm.DB) *RequesterRepository {
	return &RequesterRepository{db: db}
}

func (r *RequesterRepository) FindAll() ([]models.Profiles, error) {
	var requesters []models.Profiles
	err := r.db.Preload("User").Preload("RequesterType").Preload("User.Roles").
		Joins("JOIN users ON users.id = profiles.user_id").
		Joins("JOIN user_roles ON user_roles.users_id = users.id").
		Joins("JOIN roles ON roles.id = user_roles.roles_id").
		Where("roles.name = ?", "requester").Find(&requesters).Error
	return requesters, err
}

func (r *RequesterRepository) FindByID(id uint) (*models.Profiles, error) {
	var requester models.Profiles
	err := r.db.
		Preload("User").
		Preload("RequesterType").
		Preload("User.Roles").
		Joins("JOIN users ON users.id = profiles.user_id").
		Joins("JOIN user_roles ON user_roles.users_id = users.id").
		Joins("JOIN roles ON roles.id = user_roles.roles_id").
		Where("roles.name = ?", "requester").
		Where("profiles.id = ?", id).
		First(&requester).Error
	return &requester, err
}

func (r *RequesterRepository) FindByUserID(userID uint) (*models.Profiles, error) {
	var requester models.Profiles
	err := r.db.Preload("RequesterType").Where("user_id = ?", userID).First(&requester).Error
	return &requester, err
}

func (r *RequesterRepository) Create(requester *models.Profiles) error {
	return r.db.Create(requester).Error
}

func (r *RequesterRepository) Update(requester *models.Profiles) error {
	return r.db.Save(requester).Error
}

func (r *RequesterRepository) Delete(id uint) error {
	return r.db.Delete(&models.Profiles{}, id).Error
}

func (r *RequesterRepository) FindRequesterTypeByID(id uint) (*models.RequesterTypes, error) {
	var rt models.RequesterTypes
	err := r.db.First(&rt, id).Error
	return &rt, err
}

func (r *RequesterRepository) FindAllRequesterTypes() ([]models.RequesterTypes, error) {
	var types []models.RequesterTypes
	err := r.db.Find(&types).Error
	return types, err
}
