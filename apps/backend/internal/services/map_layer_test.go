package services_test

import (
	"context"
	"errors"
	"testing"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/mocks"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)

func TestMapLayerService_CreateLayer(t *testing.T) {
	ctx := context.Background()
	floorPlanID := uuid.New()
	req := dto.CreateMapLayerRequest{
		Name:    "Layer 1",
		Visible: true,
		Locked:  false,
		Color:   "#FF0000",
	}

	t.Run("success", func(t *testing.T) {
		mockLayerRepo := new(mocks.MapLayerRepository)
		mockFPRepo := new(mocks.FloorPlanRepository)
		mockRentalRepo := new(mocks.RentalSpaceRepository)
		svc := services.NewMapLayerService(mockLayerRepo, mockFPRepo, mockRentalRepo)

		mockFPRepo.On("FindFloorPlanByID", ctx, floorPlanID).Return(&models.FloorPlans{UUIDBase: models.UUIDBase{ID: floorPlanID}}, nil)
		mockLayerRepo.On("CreateMapLayer", ctx, mock.MatchedBy(func(l *models.MapLayers) bool {
			return l.FloorPlanID == floorPlanID && l.Name == "Layer 1" && l.Color == "#FF0000"
		})).Return(nil)

		res, err := svc.Create(ctx, floorPlanID, req)

		assert.NoError(t, err)
		assert.NotNil(t, res)
		assert.Equal(t, "Layer 1", res.Name)
		assert.Equal(t, "#FF0000", res.Color)
		mockFPRepo.AssertExpectations(t)
		mockLayerRepo.AssertExpectations(t)
	})

	t.Run("floor plan not found", func(t *testing.T) {
		mockLayerRepo := new(mocks.MapLayerRepository)
		mockFPRepo := new(mocks.FloorPlanRepository)
		mockRentalRepo := new(mocks.RentalSpaceRepository)
		svc := services.NewMapLayerService(mockLayerRepo, mockFPRepo, mockRentalRepo)

		mockFPRepo.On("FindFloorPlanByID", ctx, floorPlanID).Return(nil, gorm.ErrRecordNotFound)

		res, err := svc.Create(ctx, floorPlanID, req)

		assert.Error(t, err)
		assert.Nil(t, res)
		assert.Contains(t, err.Error(), "floor plan not found")
		mockFPRepo.AssertExpectations(t)
	})
}

func TestMapLayerService_UpdateLayer(t *testing.T) {
	ctx := context.Background()
	layerID := uuid.New()
	newName := "Updated Layer"
	newColor := "#00FF00"

	req := dto.UpdateMapLayerRequest{
		Name:  &newName,
		Color: &newColor,
	}

	t.Run("success", func(t *testing.T) {
		mockLayerRepo := new(mocks.MapLayerRepository)
		mockFPRepo := new(mocks.FloorPlanRepository)
		mockRentalRepo := new(mocks.RentalSpaceRepository)
		svc := services.NewMapLayerService(mockLayerRepo, mockFPRepo, mockRentalRepo)

		existingLayer := &models.MapLayers{
			UUIDBase: models.UUIDBase{ID: layerID},
			Name:     "Old Layer",
			Visible:  true,
			Color:    "#000000",
		}

		mockLayerRepo.On("FindMapLayerByID", ctx, layerID).Return(existingLayer, nil)
		mockLayerRepo.On("UpdateMapLayer", ctx, mock.MatchedBy(func(l *models.MapLayers) bool {
			return l.Name == "Updated Layer" && l.Color == "#00FF00"
		})).Return(nil)

		res, err := svc.Update(ctx, layerID, req)

		assert.NoError(t, err)
		assert.NotNil(t, res)
		assert.Equal(t, "Updated Layer", res.Name)
		assert.Equal(t, "#00FF00", res.Color)
		mockLayerRepo.AssertExpectations(t)
	})

	t.Run("layer not found", func(t *testing.T) {
		mockLayerRepo := new(mocks.MapLayerRepository)
		mockFPRepo := new(mocks.FloorPlanRepository)
		mockRentalRepo := new(mocks.RentalSpaceRepository)
		svc := services.NewMapLayerService(mockLayerRepo, mockFPRepo, mockRentalRepo)

		mockLayerRepo.On("FindMapLayerByID", ctx, layerID).Return(nil, gorm.ErrRecordNotFound)

		res, err := svc.Update(ctx, layerID, req)

		assert.Error(t, err)
		assert.Nil(t, res)
		mockLayerRepo.AssertExpectations(t)
	})
}

func TestMapLayerService_DeleteLayer(t *testing.T) {
	ctx := context.Background()
	layerID := uuid.New()

	t.Run("success", func(t *testing.T) {
		mockLayerRepo := new(mocks.MapLayerRepository)
		mockFPRepo := new(mocks.FloorPlanRepository)
		mockRentalRepo := new(mocks.RentalSpaceRepository)
		svc := services.NewMapLayerService(mockLayerRepo, mockFPRepo, mockRentalRepo)

		mockLayerRepo.On("DeleteMapLayer", ctx, layerID).Return(nil)

		err := svc.Delete(ctx, layerID)

		assert.NoError(t, err)
		mockLayerRepo.AssertExpectations(t)
	})
}

func TestMapLayerService_CreateMapElement(t *testing.T) {
	ctx := context.Background()
	layerID := uuid.New()
	rentalSpaceID := uint(10)

	req := dto.CreateMapElementRequest{
		CanvasElementID: "elem-1",
		RentalSpaceID:   &rentalSpaceID,
		Name:            "Stall A1",
		Type:            "rect",
		X:               10,
		Y:               20,
		Width:           100,
		Height:          50,
	}

	t.Run("success with rental space link", func(t *testing.T) {
		mockLayerRepo := new(mocks.MapLayerRepository)
		mockFPRepo := new(mocks.FloorPlanRepository)
		mockRentalRepo := new(mocks.RentalSpaceRepository)
		svc := services.NewMapLayerService(mockLayerRepo, mockFPRepo, mockRentalRepo)

		mockLayerRepo.On("FindMapLayerByID", ctx, layerID).Return(&models.MapLayers{UUIDBase: models.UUIDBase{ID: layerID}}, nil)
		mockRentalRepo.On("FindByID", ctx, rentalSpaceID).Return(&models.RentalSpaces{Base: models.Base{ID: rentalSpaceID}}, nil)
		mockLayerRepo.On("CreateMapElement", ctx, mock.MatchedBy(func(elem *models.MapElements) bool {
			return elem.LayerID == layerID && *elem.RentalSpaceID == rentalSpaceID && elem.Name == "Stall A1" && elem.Status == "open"
		})).Return(nil)

		res, err := svc.CreateMapElement(ctx, layerID, req)

		assert.NoError(t, err)
		assert.NotNil(t, res)
		assert.Equal(t, "Stall A1", res.Name)
		assert.Equal(t, "open", res.Status)
		mockLayerRepo.AssertExpectations(t)
		mockRentalRepo.AssertExpectations(t)
	})

	t.Run("rental space not found", func(t *testing.T) {
		mockLayerRepo := new(mocks.MapLayerRepository)
		mockFPRepo := new(mocks.FloorPlanRepository)
		mockRentalRepo := new(mocks.RentalSpaceRepository)
		svc := services.NewMapLayerService(mockLayerRepo, mockFPRepo, mockRentalRepo)

		mockLayerRepo.On("FindMapLayerByID", ctx, layerID).Return(&models.MapLayers{UUIDBase: models.UUIDBase{ID: layerID}}, nil)
		mockRentalRepo.On("FindByID", ctx, rentalSpaceID).Return(nil, gorm.ErrRecordNotFound)

		res, err := svc.CreateMapElement(ctx, layerID, req)

		assert.Error(t, err)
		assert.Nil(t, res)
		assert.Contains(t, err.Error(), "rental space not found")
		mockLayerRepo.AssertExpectations(t)
		mockRentalRepo.AssertExpectations(t)
	})
}

func TestMapLayerService_UpdateMapElement(t *testing.T) {
	ctx := context.Background()
	elemID := uuid.New()
	newName := "Updated Stall A1"
	newX := 150.0

	req := dto.UpdateMapElementRequest{
		Name: &newName,
		X:    &newX,
	}

	t.Run("success", func(t *testing.T) {
		mockLayerRepo := new(mocks.MapLayerRepository)
		mockFPRepo := new(mocks.FloorPlanRepository)
		mockRentalRepo := new(mocks.RentalSpaceRepository)
		svc := services.NewMapLayerService(mockLayerRepo, mockFPRepo, mockRentalRepo)

		existingElem := &models.MapElements{
			UUIDBase: models.UUIDBase{ID: elemID},
			Name:     "Stall A1",
			X:        10,
			Y:        20,
			Status:   "open",
		}

		mockLayerRepo.On("FindMapElementByID", ctx, elemID).Return(existingElem, nil)
		mockLayerRepo.On("UpdateMapElement", ctx, mock.MatchedBy(func(elem *models.MapElements) bool {
			return elem.Name == "Updated Stall A1" && elem.X == 150.0
		})).Return(nil)

		res, err := svc.UpdateMapElement(ctx, elemID, req)

		assert.NoError(t, err)
		assert.NotNil(t, res)
		assert.Equal(t, "Updated Stall A1", res.Name)
		assert.Equal(t, 150.0, res.X)
		mockLayerRepo.AssertExpectations(t)
	})
}

func TestMapLayerService_DeleteMapElement(t *testing.T) {
	ctx := context.Background()
	elemID := uuid.New()

	t.Run("success", func(t *testing.T) {
		mockLayerRepo := new(mocks.MapLayerRepository)
		mockFPRepo := new(mocks.FloorPlanRepository)
		mockRentalRepo := new(mocks.RentalSpaceRepository)
		svc := services.NewMapLayerService(mockLayerRepo, mockFPRepo, mockRentalRepo)

		mockLayerRepo.On("DeleteMapElement", ctx, elemID).Return(nil)

		err := svc.DeleteMapElement(ctx, elemID)

		assert.NoError(t, err)
		mockLayerRepo.AssertExpectations(t)
	})

	t.Run("error", func(t *testing.T) {
		mockLayerRepo := new(mocks.MapLayerRepository)
		mockFPRepo := new(mocks.FloorPlanRepository)
		mockRentalRepo := new(mocks.RentalSpaceRepository)
		svc := services.NewMapLayerService(mockLayerRepo, mockFPRepo, mockRentalRepo)

		mockLayerRepo.On("DeleteMapElement", ctx, elemID).Return(errors.New("db error"))

		err := svc.DeleteMapElement(ctx, elemID)

		assert.Error(t, err)
		mockLayerRepo.AssertExpectations(t)
	})
}
