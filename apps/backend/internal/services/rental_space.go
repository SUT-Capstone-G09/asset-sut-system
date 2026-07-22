package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
	"gorm.io/gorm"
)

type RentalSpaceService struct {
	rentalSpaceRepo repositories.RentalSpaceRepository
	buildingRepo    repositories.BuildingRepository
}

func NewRentalSpaceService(
	rentalSpaceRepo repositories.RentalSpaceRepository,
	buildingRepo *repositories.BuildingRepository,
) *RentalSpaceService {
	return &RentalSpaceService{
		rentalSpaceRepo: rentalSpaceRepo,
		buildingRepo:    *buildingRepo,
	}
}

// FindAll retrieves all rental spaces that match the given filter criteria.
func (s *RentalSpaceService) FindAll(
	ctx context.Context,
	filter repositories.RentalSpaceFilter,
) ([]dto.RentalSpaceResponse, error) {
	spaces, err := s.rentalSpaceRepo.FindAll(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("find rental spaces: %w", err)
	}

	res := make([]dto.RentalSpaceResponse, 0, len(spaces))
	for _, s := range spaces {
		res = append(res, toRentalSpaceResponse(s))
	}

	return res, nil
}

// FindByID retrieves a single rental space by its unique identifier.
func (s *RentalSpaceService) FindByID(
	ctx context.Context, 
	id uint,
) (*dto.RentalSpaceResponse, error) {
	space, err := s.rentalSpaceRepo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("find rental space by id: %w", err)
	}

	res := toRentalSpaceResponse(*space)

	return &res, nil
} 

// Create validates the input, checks building existence, and inserts a new rental space.
func (s *RentalSpaceService) Create(
	ctx context.Context,
	req dto.CreateRentalSpaceRequest,
) (*dto.RentalSpaceResponse, error) {
	if req.BuildingID != nil {

		_, err := s.buildingRepo.FindByID(*req.BuildingID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, fmt.Errorf("building not found with id %d: %w", *req.BuildingID, err)
			}

			return nil, fmt.Errorf("verify building existence: %w", err)
		}
	}

	status := req.Status
	if status == "" {
		status = "available"
	}

	space := &models.RentalSpaces{
		BuildingID: req.BuildingID,
		Name: req.Name,
		Description: req.Description,
		Size: req.Size,
		AreaCode: req.AreaCode,
		BasePrice: req.BasePrice,
		Status: status,
	}

	err := s.rentalSpaceRepo.Create(ctx, space)
	if err != nil {
		return nil, fmt.Errorf("create rental space: %w", err)
	}

	createdSpace, err := s.rentalSpaceRepo.FindByID(ctx, space.ID)
	if err != nil {
		return nil, fmt.Errorf("fetch created rental space: %w", err)
	}

	res := toRentalSpaceResponse(*createdSpace)

	return &res, nil
}

// Update validates building assignment and applies partial updates to a rental space.
func (s *RentalSpaceService) Update(
	ctx context.Context,
	id uint,
	req dto.UpdateRentalSpaceRequest,
) (*dto.RentalSpaceResponse, error) {
	space, err := s.rentalSpaceRepo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("find rental space for update: %w", err)
	}

	if req.BuildingID != nil {	
		_, err := s.buildingRepo.FindByID(*req.BuildingID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, fmt.Errorf("building not found with id %d: %w", *req.BuildingID, err)
			}

			return nil, fmt.Errorf("verify building existence: %w", err)
		}

		space.BuildingID = req.BuildingID
	}

	if req.Name != nil {
		space.Name = *req.Name
	}

	if req.Description != nil {
		space.Description = req.Description
	}

	if req.Size != nil {
		space.Size = req.Size
	}

	if req.AreaCode != nil {
		space.AreaCode = req.AreaCode
	}

	if req.BasePrice != nil {
		space.BasePrice = req.BasePrice
	}

	if req.Status != nil {
		space.Status = *req.Status
	}

	err = s.rentalSpaceRepo.Update(ctx, space)
	if err != nil {
		return nil, fmt.Errorf("update rental space: %w", err)
	}

	updatedSpace, err := s.rentalSpaceRepo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("fetch updated rental space: %w", err)
	}

	res := toRentalSpaceResponse(*updatedSpace)

	return &res, nil
}

// Delete removes a rental space from the database by its ID.
func (s *RentalSpaceService) Delete(
	ctx context.Context,
	id uint,
) error {
	err := s.rentalSpaceRepo.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("delete rental space: %w", err)
	}

	return nil
}

// =======
// Mappers

func toRentalSpaceResponse(space models.RentalSpaces) dto.RentalSpaceResponse {
	var buildingName *string
	if space.Building != nil {
		buildingName = &space.Building.Name
	}

	images := make([]dto.RentalSpaceImageResponse, 0, len(space.Images))
	for _, img := range space.Images {
		images = append(images, dto.RentalSpaceImageResponse{
			ID: 				img.ID,
			URL: 				img.URL,
			AltText: 		img.AltText,
			IsPrimary: 	img.IsPrimary,
			SortOrder: 	img.SortOrder,
		})
	}

	tags := make([]string, 0, len(space.Tags))
	for _, t := range space.Tags {
		tags = append(tags, t.Tag)
	}

	return dto.RentalSpaceResponse{
		ID:           space.ID,
		BuildingID:   space.BuildingID,
		BuildingName: buildingName,
		Name:         space.Name,
		Description:  space.Description,
		Size:         space.Size,
		AreaCode:     space.AreaCode,
		BasePrice:    space.BasePrice,
		Status:       space.Status,
		Images:       images,
		Tags:         tags,
		CreatedAt:    space.CreatedAt,
		UpdatedAt:    space.UpdatedAt,
	}
}