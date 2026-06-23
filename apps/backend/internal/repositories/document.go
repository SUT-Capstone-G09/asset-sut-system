package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type DocumentRepository struct {
	db *gorm.DB
}

func NewDocumentRepository(db *gorm.DB) *DocumentRepository {
	return &DocumentRepository{db: db}
}

func (r *DocumentRepository) FindByBookingID(bookingID uint) ([]models.Documents, error) {
	var docs []models.Documents
	err := r.db.
		Where("booking_id = ?", bookingID).
		Preload("DocumentType").
		Preload("Method").
		Find(&docs).Error
	return docs, err
}

func (r *DocumentRepository) FindByID(id uint) (*models.Documents, error) {
	var doc models.Documents
	err := r.db.
		Preload("DocumentType").
		Preload("Method").
		First(&doc, id).Error
	return &doc, err
}

func (r *DocumentRepository) Create(doc *models.Documents) error {
	return r.db.Create(doc).Error
}

func (r *DocumentRepository) Delete(id uint) error {
	return r.db.Delete(&models.Documents{}, id).Error
}

func (r *DocumentRepository) FindMethodByID(id uint) (*models.Methods, error) {
	var method models.Methods
	err := r.db.First(&method, id).Error
	return &method, err
}

func (r *DocumentRepository) FindDocumentTypeByID(id uint) (*models.DocumentTypes, error) {
	var dt models.DocumentTypes
	err := r.db.First(&dt, id).Error
	return &dt, err
}
