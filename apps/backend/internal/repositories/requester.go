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

func (r *RequesterRepository) FindAll() ([]models.Requesters, error) {
	var requesters []models.Requesters
	err := r.db.Preload("User").Preload("RequesterType").Find(&requesters).Error
	return requesters, err
}

func (r *RequesterRepository) FindByID(id uint) (*models.Requesters, error) {
	var requester models.Requesters
	err := r.db.Preload("User").Preload("RequesterType").First(&requester, id).Error
	return &requester, err
}

func (r *RequesterRepository) FindByUserID(userID uint) (*models.Requesters, error) {
	var requester models.Requesters
	err := r.db.Preload("RequesterType").Where("user_id = ?", userID).First(&requester).Error
	return &requester, err
}

func (r *RequesterRepository) Create(requester *models.Requesters) error {
	return r.db.Create(requester).Error
}

func (r *RequesterRepository) Update(requester *models.Requesters) error {
	return r.db.Save(requester).Error
}

func (r *RequesterRepository) Delete(id uint) error {
	return r.db.Delete(&models.Requesters{}, id).Error
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
