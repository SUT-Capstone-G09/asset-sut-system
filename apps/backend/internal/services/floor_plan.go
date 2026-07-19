package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FloorPlanService struct {
	floorPlanRepo *repositories.FloorPlanRepository
	buildingRepo *repositories.BuildingRepository
}

func NewFloorPlanService(
	floorPlanRepo *repositories.FloorPlanRepository,
	buildingRepo *repositories.BuildingRepository,
) *FloorPlanService {
	return &FloorPlanService{
		floorPlanRepo: floorPlanRepo,
		buildingRepo: buildingRepo,
	}
}

// FindByID retrieves a single floor plan by its unique UUID along with layers and elements.
func (s *FloorPlanService) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*dto.FloorPlanResponse, error) {
	fp, err := s.floorPlanRepo.FindFloorPlanByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("find floor plan by id: %w", err)
	}

	res := toFloorPlanResponse(*fp)

	return &res, nil
}

// FindAll retrieves all floor plans configured for a given building.
func (s *FloorPlanService) FindAll(
	ctx context.Context,
	buildingID uint,
) ([]dto.FloorPlanResponse, error) {
	_, err := s.buildingRepo.FindByID(buildingID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("building not found with id %d: %w", buildingID, err)
		}

		return nil, fmt.Errorf("verify building existence: %w", err)
	}

	floorPlans, err := s.floorPlanRepo.FindFloorPlansByBuildingID(ctx, buildingID)
	if err != nil {
		return nil, fmt.Errorf("find floor plans by building id: %w", err)
	}

	res := make([]dto.FloorPlanResponse, 0, len(floorPlans))
	for _, plan := range floorPlans {
		res = append(res, toFloorPlanResponse(plan))
	}

	return res, nil
}

// Create validates the building existence and inserts a new floor plan.
func (s *FloorPlanService) Create(
	ctx context.Context,
	buildingID uint,
	req dto.CreateFloorPlanRequest,
) (*dto.FloorPlanResponse, error) {
	_, err := s.buildingRepo.FindByID(buildingID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("building not found with id %d: %w", buildingID, err)
		}
		return nil, fmt.Errorf("verify building existence: %w", err)
	}

	fp := &models.FloorPlans{
		BuildingID:  buildingID,
		Name:        req.Name,
		Width:       req.Width,
		Height:      req.Height,
		FloorNumber: 1,
	}

	err = s.floorPlanRepo.CreateFloorPlan(ctx, fp)
	if err != nil {
		return nil, fmt.Errorf("create floor plan: %w", err)
	}
	
	res := toFloorPlanResponse(*fp)
	return &res, nil
}

// Update updates the dimensions or name of an existing floor plan.
func (s *FloorPlanService) Update(
	ctx context.Context,
	id uuid.UUID,
	req dto.UpdateFloorPlanRequest,
) (*dto.FloorPlanResponse, error) {
	fp, err := s.floorPlanRepo.FindFloorPlanByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("find floor plan for update: %w", err)
	}

	if req.Name != nil {
		fp.Name = *req.Name
	}

	if req.Width != nil {
		fp.Width = *req.Width
	}

	if req.Height != nil {
		fp.Height = *req.Height
	}

	err = s.floorPlanRepo.UpdateFloorPlan(ctx, fp)
	if err != nil {
		return nil, fmt.Errorf("update floor plan: %w", err)
	}

	res := toFloorPlanResponse(*fp)
	return &res, nil
}

// Delete removes a floor plan from the database.
func (s *FloorPlanService) Delete(
	ctx context.Context,
	id uuid.UUID,
) error {
	err := s.floorPlanRepo.DeleteFloorPlan(ctx, id)
	if err != nil {
		return fmt.Errorf("delete floor plan: %w", err)
	}

	return nil
}

// =======
// Mappers

func toFloorPlanResponse(fp models.FloorPlans) dto.FloorPlanResponse {
	layers := make([]dto.MapLayerResponse, 0, len(fp.MapLayers))
	for _, layer := range fp.MapLayers {
		layers = append(layers, toMapLayerResponse(layer))
	}

	return dto.FloorPlanResponse{
		ID:         fp.ID,
		BuildingID: fp.BuildingID,
		Name:       fp.Name,
		Width:      fp.Width,
		Height:     fp.Height,
		Layers:     layers,
		UpdatedAt:  fp.UpdatedAt,
	}
}