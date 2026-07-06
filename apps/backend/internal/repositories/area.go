package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type AreaRepository struct {
	db *gorm.DB
}

func NewAreaRepository(db *gorm.DB) *AreaRepository {
	return &AreaRepository{db: db}
}

// ค้นหาพื้นที่เช่าพาณิชย์ทั้งหมด (สามารถกรองตามประเภท และ ตึก ได้)
func (r *AreaRepository) FindAll(category string, buildingID *uint) ([]models.Areas, error) {
	var areas []models.Areas

	query := r.db.
				Preload("Building").
				Preload("Images").
				Preload("Tags")

	if category != "" {
		query = query.Where("category = ?", category)
	}
	if buildingID != nil {
		query = query.Where("building_id = ?", buildingID)
	}

	err := query.Find(&areas).Error

	return areas, err
}

