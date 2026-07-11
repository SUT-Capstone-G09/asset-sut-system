package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type RentalSpaceRepository struct {
	db *gorm.DB
}

func NewRentalSpaceRepository(db *gorm.DB) *RentalSpaceRepository {
	return &RentalSpaceRepository{db: db}
}

// FindAll ค้นหา Rental Space ทั้งหมด (กรองตาม Building ID ได้)
func (r *RentalSpaceRepository) FindAll(buildingID *uint) ([]models.RentalSpaces, error) {
	var spaces []models.RentalSpaces

	query := r.db.
		Preload("Building").
		Preload("Images").
		Preload("Tags")

	if buildingID != nil {
		query = query.Where("building_id = ?", buildingID)
	}

	err := query.Find(&spaces).Error
	return spaces, err
}

// FindByID ค้นหา Rental Space ด้วย ID
func (r *RentalSpaceRepository) FindByID(id uint) (*models.RentalSpaces, error) {
	var space models.RentalSpaces
	err := r.db.
		Preload("Building").
		Preload("Images").
		Preload("Tags").
		First(&space, id).Error
	if err != nil {
		return nil, err
	}
	return &space, nil
}
