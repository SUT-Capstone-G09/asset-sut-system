package repositories

import (
	"strings"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type EmailTemplateRepository struct {
	db *gorm.DB
}

func NewEmailTemplateRepository(db *gorm.DB) *EmailTemplateRepository {
	return &EmailTemplateRepository{db: db}
}

func (r *EmailTemplateRepository) FindAll(search string) ([]models.EmailTemplate, error) {
	var templates []models.EmailTemplate
	q := r.db.Order("created_at desc")
	if search = strings.TrimSpace(search); search != "" {
		like := "%" + search + "%"
		q = q.Where("name ILIKE ? OR key ILIKE ? OR subject ILIKE ?", like, like, like)
	}
	err := q.Find(&templates).Error
	return templates, err
}

func (r *EmailTemplateRepository) FindByID(id uint) (*models.EmailTemplate, error) {
	var t models.EmailTemplate
	err := r.db.First(&t, id).Error
	return &t, err
}

func (r *EmailTemplateRepository) FindByKey(key string) (*models.EmailTemplate, error) {
	var t models.EmailTemplate
	err := r.db.Where("key = ?", key).First(&t).Error
	return &t, err
}

func (r *EmailTemplateRepository) FindActiveByKey(key string) (*models.EmailTemplate, error) {
	var t models.EmailTemplate
	err := r.db.Where("key = ? AND is_active = ?", key, true).First(&t).Error
	return &t, err
}

func (r *EmailTemplateRepository) Create(t *models.EmailTemplate) error {
	return r.db.Create(t).Error
}

func (r *EmailTemplateRepository) Update(t *models.EmailTemplate) error {
	return r.db.Save(t).Error
}

func (r *EmailTemplateRepository) Delete(id uint) error {
	return r.db.Delete(&models.EmailTemplate{}, id).Error
}
