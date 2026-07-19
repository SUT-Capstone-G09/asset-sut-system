package repositories

import (
	"context"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type RentalSpaceFilter struct {
	BuildingID *uint
	Status     *string
	Keyword    string
	MinPrice   *float64
	MaxPrice   *float64
}

type RentalSpaceRepository struct {
	db *gorm.DB
}

func NewRentalSpaceRepository(db *gorm.DB) *RentalSpaceRepository {
	return &RentalSpaceRepository{db: db}
}

// FindAll retrieves all rental spaces matching the provided filter.
func (r *RentalSpaceRepository) FindAll(ctx context.Context, filter RentalSpaceFilter) ([]models.RentalSpaces, error) {
	var spaces []models.RentalSpaces

	query := r.db.WithContext(ctx).
		Preload("Building").
		Preload("Images").
		Preload("Tags").
		Order("id ASC")

	if filter.BuildingID != nil {
		query = query.Where("building_id = ?", *filter.BuildingID)
	}

	if filter.Status != nil && *filter.Status != "" {
		query = query.Where("status = ?", *filter.Status)
	}

	if filter.Keyword != "" {
		k := "%" + filter.Keyword + "%"
		query = query.Where("name LIKE ? OR area_code LIKE ? OR description LIKE ?", k, k, k)
	}

	if filter.MinPrice != nil {
		query = query.Where("base_price >= ?", *filter.MinPrice)
	}

	if filter.MaxPrice != nil {
		query = query.Where("base_price <= ?", *filter.MaxPrice)
	}

	err := query.Find(&spaces).Error

	return spaces, err
}

// FindByID retrieves a rental space by its ID.
func (r *RentalSpaceRepository) FindByID(ctx context.Context, id uint) (*models.RentalSpaces, error) {
	var space models.RentalSpaces
	
	err := r.db.WithContext(ctx).
		Preload("Building").
		Preload("Images").
		Preload("Tags").
		First(&space, id).Error
	if err != nil {
		return nil, err
	}

	return &space, nil
}

// Create inserts a new rental space record.
func (r *RentalSpaceRepository) Create(ctx context.Context, space *models.RentalSpaces) error {
	return r.db.WithContext(ctx).Create(space).Error
}

// Update updates an existing rental space record.
func (r *RentalSpaceRepository) Update(ctx context.Context, space *models.RentalSpaces) error {
	return r.db.WithContext(ctx).
		Model(&models.RentalSpaces{}).
		Where("id = ?", space.ID).
		Updates(space).Error
}

// Delete performs a soft-delete of a rental space by its ID.
func (r *RentalSpaceRepository) Delete(ctx context.Context, id uint) error {
	result := r.db.WithContext(ctx).Delete(&models.RentalSpaces{}, id)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	
	return nil
}
