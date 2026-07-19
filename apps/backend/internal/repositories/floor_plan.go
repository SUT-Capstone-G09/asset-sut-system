package repositories

import (
	"context"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FloorPlanRepository struct {
	db *gorm.DB
}

func NewFloorPlanRepository(db *gorm.DB) *FloorPlanRepository {
	return &FloorPlanRepository{db: db}
}

// FindFloorPlanByID retrieves a FloorPlan by its ID along with preloaded building, map layers, and map elements.
func (r *FloorPlanRepository) FindFloorPlanByID(ctx context.Context, id uuid.UUID) (*models.FloorPlans, error) {
	var fp models.FloorPlans

	err := r.db.WithContext(ctx).
		Preload("Building").
		Preload("MapLayers.MapElements").
		First(&fp, "id = ?", id).Error
	if err != nil {
		return nil, err
	}

	return &fp, nil
}

// FindFloorPlansByBuildingID retrieves all FloorPlans associated with the given building ID.
func (r *FloorPlanRepository) FindFloorPlansByBuildingID(ctx context.Context, buildingID uint) ([]models.FloorPlans, error) {
	var floorPlans []models.FloorPlans

	err := r.db.WithContext(ctx).
		Where("building_id = ?", buildingID).
		Order("id ASC").
		Find(&floorPlans).Error
	
		return floorPlans, err
}

// CreateFloorPlan inserts a new FloorPlan record.
func (r *FloorPlanRepository) CreateFloorPlan(ctx context.Context, fp *models.FloorPlans) error {
	return r.db.WithContext(ctx).Create(fp).Error
}

// UpdateFloorPlan updates an existing FloorPlan record.
func (r *FloorPlanRepository) UpdateFloorPlan(ctx context.Context, fp *models.FloorPlans) error {
	return r.db.WithContext(ctx).
		Model(&models.FloorPlans{}).
		Where("id = ?", fp.ID).
		Updates(fp).Error
}

// DeleteFloorPlan deletes a FloorPlan by its ID.
func (r *FloorPlanRepository) DeleteFloorPlan(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&models.FloorPlans{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}
