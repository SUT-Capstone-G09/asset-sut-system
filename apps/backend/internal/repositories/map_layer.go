package repositories

import (
	"context"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MapLayerRepository struct {
	db *gorm.DB
}

func NewMapLayerRepository(db *gorm.DB) *MapLayerRepository {
	return &MapLayerRepository{db: db}
}

// FindMapLayerByID retrieves a MapLayer by its ID.
func (r *MapLayerRepository) FindMapLayerByID(ctx context.Context, id uuid.UUID) (*models.MapLayers, error) {
	var ml models.MapLayers

	err := r.db.WithContext(ctx).
		Preload("FloorPlan").
		Preload("MapElements").
		First(&ml, "id = ?", id).Error
	if err != nil {
		return nil, err
	}

	return &ml, nil
}

// CreateMapLayer inserts a new MapLayer record.
func (r *MapLayerRepository) CreateMapLayer(ctx context.Context, ml *models.MapLayers) error {
	return r.db.WithContext(ctx).Create(ml).Error
}

// UpdateMapLayer updates an existing MapLayer record.
func (r *MapLayerRepository) UpdateMapLayer(ctx context.Context, ml *models.MapLayers) error {
	return r.db.WithContext(ctx).
		Model(&models.MapLayers{}).
		Where("id = ?", ml.ID).
		Updates(ml).Error
}

// DeleteMapLayer deletes a MapLayer by its ID.
func (r *MapLayerRepository) DeleteMapLayer(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&models.MapLayers{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

// FindMapElementByID retrieves a MapElement by its ID.
func (r *MapLayerRepository) FindMapElementByID(ctx context.Context, id uuid.UUID) (*models.MapElements, error) {
	var me models.MapElements
	
	err := r.db.WithContext(ctx).
		Preload("Layer").
		Preload("RentalSpace").
		First(&me, "id = ?", id).Error
	if err != nil {
		return nil, err
	}

	return &me, nil
}

// CreateMapElement inserts a new MapElement record.
func (r *MapLayerRepository) CreateMapElement(ctx context.Context, me *models.MapElements) error {
	return r.db.WithContext(ctx).Create(me).Error
}

// UpdateMapElement updates an existing MapElement record.
func (r *MapLayerRepository) UpdateMapElement(ctx context.Context, me *models.MapElements) error {
	return r.db.WithContext(ctx).
		Model(&models.MapElements{}).
		Where("id = ?", me.ID).
		Updates(me).Error
}

// DeleteMapElement deletes a MapElement by its ID.
func (r *MapLayerRepository) DeleteMapElement(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&models.MapElements{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	
	return nil
}
