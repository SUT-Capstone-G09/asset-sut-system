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

type MapLayerService struct {
	mapLayerRepo    repositories.MapLayerRepository
	floorPlanRepo   repositories.FloorPlanRepository
	rentalSpaceRepo repositories.RentalSpaceRepository
}

func NewMapLayerService(
	mapLayerRepo repositories.MapLayerRepository,
	floorPlanRepo repositories.FloorPlanRepository,
	rentalSpaceRepo repositories.RentalSpaceRepository,
) *MapLayerService {
	return &MapLayerService{
		mapLayerRepo:	mapLayerRepo,
		floorPlanRepo:	floorPlanRepo,
		rentalSpaceRepo: rentalSpaceRepo,
	}
}

// Create validates the floor plan existence and inserts a new map layer.
func (s *MapLayerService) Create(
	ctx context.Context,
	floorPlanID uuid.UUID,
	req dto.CreateMapLayerRequest,
) (*dto.MapLayerResponse, error) {
	_, err := s.floorPlanRepo.FindFloorPlanByID(ctx, floorPlanID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("floor plan not found with id %s: %w", floorPlanID, err)
		}

		return nil, fmt.Errorf("verify floor plan existence: %w", err)
	}

	layer := &models.MapLayers{
		FloorPlanID: floorPlanID,
		Name:        req.Name,
		Visible:     req.Visible,
		Locked:      req.Locked,
		Color:       req.Color,
	}

	err = s.mapLayerRepo.CreateMapLayer(ctx, layer)
	if err != nil {
		return nil, fmt.Errorf("create map layer: %w", err)
	}

	res := toMapLayerResponse(*layer)
	return &res, nil
}

// Update applies partial updates to standard map layer attributes.
func (s *MapLayerService) Update(
	ctx context.Context,
	id uuid.UUID,
	req dto.UpdateMapLayerRequest,
) (*dto.MapLayerResponse, error) {
	layer, err := s.mapLayerRepo.FindMapLayerByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("find map layer for update: %w", err)
	}

	if req.Name != nil {
		layer.Name = *req.Name
	}

	if req.Visible != nil {
		layer.Visible = *req.Visible
	}

	if req.Locked != nil {
		layer.Locked = *req.Locked
	}

	if req.Color != nil {
		layer.Color = *req.Color
	}

	err = s.mapLayerRepo.UpdateMapLayer(ctx, layer)
	if err != nil {
		return nil, fmt.Errorf("update map layer: %w", err)
	}

	res := toMapLayerResponse(*layer)

	return &res, nil
}

// Delete removes a map layer and all its nested elements from the database.
func (s *MapLayerService) Delete(
	ctx context.Context,
	id uuid.UUID,
) error {
	err := s.mapLayerRepo.DeleteMapLayer(ctx, id)
	if err != nil {
		return fmt.Errorf("delete map layer: %w", err)
	}

	return nil
}

// CreateMapElement validates the parent layer and rental space link, then inserts a map element.
func (s *MapLayerService) CreateMapElement(
	ctx context.Context,
	layerID uuid.UUID,
	req dto.CreateMapElementRequest,
) (*dto.MapElementResponse, error) {
	_, err := s.mapLayerRepo.FindMapLayerByID(ctx, layerID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("map layer not found with id %s: %w", layerID, err)
		}
		
		return nil, fmt.Errorf("verify map layer existence: %w", err)
	}

	if req.RentalSpaceID != nil {
		_, err = s.rentalSpaceRepo.FindByID(ctx, *req.RentalSpaceID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, fmt.Errorf("rental space not found with id %d: %w", *req.RentalSpaceID, err)
			}
			
			return nil, fmt.Errorf("verify rental space existence for map element: %w", err)
		}
	}
	
	status := "open"
	if req.Status != nil {
		status = *req.Status
	}
	
	rotation := 0.0
	if req.Rotation != nil {
		rotation = *req.Rotation
	}

	element := &models.MapElements{
		LayerID:         layerID,
		RentalSpaceID:   req.RentalSpaceID,
		CanvasElementID: req.CanvasElementID,
		Name:            req.Name,
		Type:            req.Type,
		Status:          status,
		AreaType:        req.AreaType,
		CustomAreaType:  req.CustomAreaType,
		X:               req.X,
		Y:               req.Y,
		Width:           req.Width,
		Height:          req.Height,
		Rotation:        rotation,
		Zone:            req.Zone,
		Tenant:          req.Tenant,
		Description:     req.Description,
		Tags:            req.Tags,
	}

	err = s.mapLayerRepo.CreateMapElement(ctx, element)
	if err != nil {
		return nil, fmt.Errorf("create map element: %w", err)
	}
	
	res := toMapElementResponse(*element)
	
	return &res, nil
}

// UpdateMapElement validates linkage constraints and updates a map element.
func (s *MapLayerService) UpdateMapElement(
	ctx context.Context,
	id uuid.UUID,
	req dto.UpdateMapElementRequest,
) (*dto.MapElementResponse, error) {
	element, err := s.mapLayerRepo.FindMapElementByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("find map element for update: %w", err)
	}

	if req.RentalSpaceID != nil {
		_, err = s.rentalSpaceRepo.FindByID(ctx, *req.RentalSpaceID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, fmt.Errorf("rental space not found with id %d: %w", *req.RentalSpaceID, err)
			}
			
			return nil, fmt.Errorf("verify rental space existence for map element: %w", err)
		}
		
		element.RentalSpaceID = req.RentalSpaceID
	}
	
	if req.Name != nil {
		element.Name = *req.Name
	}
	
	if req.Status != nil {
		element.Status = *req.Status
	}
	
	if req.AreaType != nil {
		element.AreaType = req.AreaType
	}
	
	if req.CustomAreaType != nil {
		element.CustomAreaType = req.CustomAreaType
	}
	
	if req.X != nil {
		element.X = *req.X
	}
	
	if req.Y != nil {
		element.Y = *req.Y
	}
	
	if req.Width != nil {
		element.Width = *req.Width
	}
	
	if req.Height != nil {
		element.Height = *req.Height
	}
	
	if req.Rotation != nil {
		element.Rotation = *req.Rotation
	}
	
	if req.Zone != nil {
		element.Zone = req.Zone
	}
	
	if req.Tenant != nil {
		element.Tenant = req.Tenant
	}
	
	if req.Description != nil {
		element.Description = req.Description
	}
	
	if req.Tags != nil {
		element.Tags = req.Tags
	}

	err = s.mapLayerRepo.UpdateMapElement(ctx, element)
	if err != nil {
		return nil, fmt.Errorf("update map element: %w", err)
	}

	res := toMapElementResponse(*element)
	return &res, nil
}

// DeleteMapElement removes a map element from the database.
func (s *MapLayerService) DeleteMapElement(
	ctx context.Context,
	id uuid.UUID,
) error {
	err := s.mapLayerRepo.DeleteMapElement(ctx, id)
	if err != nil {
		return fmt.Errorf("delete map element: %w", err)
	}

	return nil
}

// =======
// Mappers

func toMapLayerResponse(layer models.MapLayers) dto.MapLayerResponse {
	elements := make([]dto.MapElementResponse, 0, len(layer.MapElements))
	for _, element := range layer.MapElements {
		elements = append(elements, toMapElementResponse(element))
	}
	return dto.MapLayerResponse{
		ID:       layer.ID,
		Name:     layer.Name,
		Visible:  layer.Visible,
		Locked:   layer.Locked,
		Color:    layer.Color,
		Elements: elements,
	}
}
func toMapElementResponse(element models.MapElements) dto.MapElementResponse {
	return dto.MapElementResponse{
		ID:              element.ID,
		CanvasElementID: element.CanvasElementID,
		RentalSpaceID:   element.RentalSpaceID,
		Name:            element.Name,
		Type:            element.Type,
		Status:          element.Status,
		AreaType:        element.AreaType,
		CustomAreaType:  element.CustomAreaType,
		X:               element.X,
		Y:               element.Y,
		Width:           element.Width,
		Height:          element.Height,
		Rotation:        element.Rotation,
		Zone:            element.Zone,
		Tenant:          element.Tenant,
		Description:     element.Description,
		Tags:            element.Tags,
		CreatedAt:       element.CreatedAt,
		UpdatedAt:       element.UpdatedAt,
	}
}