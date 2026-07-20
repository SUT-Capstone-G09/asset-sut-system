package services_test

import (
	"context"
	"errors"
	"testing"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/mocks"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func TestFloorPlanService_FindByID(t *testing.T) {
	ctx := context.Background()
	testID := uuid.New()

	t.Run("success", func(t *testing.T) {
		mockFPRepo := new(mocks.FloorPlanRepository)
		bRepo := repositories.NewBuildingRepository(nil)
		svc := services.NewFloorPlanService(mockFPRepo, bRepo)

		expectedFP := &models.FloorPlans{
			UUIDBase:   models.UUIDBase{ID: testID},
			BuildingID: 1,
			Name:       "Floor 1",
			Width:      100,
			Height:     200,
		}

		mockFPRepo.On("FindFloorPlanByID", ctx, testID).Return(expectedFP, nil)

		res, err := svc.FindByID(ctx, testID)

		assert.NoError(t, err)
		assert.NotNil(t, res)
		assert.Equal(t, testID, res.ID)
		assert.Equal(t, "Floor 1", res.Name)
		mockFPRepo.AssertExpectations(t)
	})

	t.Run("not found error", func(t *testing.T) {
		mockFPRepo := new(mocks.FloorPlanRepository)
		bRepo := repositories.NewBuildingRepository(nil)
		svc := services.NewFloorPlanService(mockFPRepo, bRepo)

		mockFPRepo.On("FindFloorPlanByID", ctx, testID).Return(nil, gorm.ErrRecordNotFound)

		res, err := svc.FindByID(ctx, testID)

		assert.Error(t, err)
		assert.Nil(t, res)
		assert.True(t, errors.Is(err, gorm.ErrRecordNotFound))
		mockFPRepo.AssertExpectations(t)
	})
}

func TestFloorPlanService_Delete(t *testing.T) {
	ctx := context.Background()
	testID := uuid.New()

	t.Run("success", func(t *testing.T) {
		mockFPRepo := new(mocks.FloorPlanRepository)
		bRepo := repositories.NewBuildingRepository(nil)
		svc := services.NewFloorPlanService(mockFPRepo, bRepo)

		mockFPRepo.On("DeleteFloorPlan", ctx, testID).Return(nil)

		err := svc.Delete(ctx, testID)

		assert.NoError(t, err)
		mockFPRepo.AssertExpectations(t)
	})

	t.Run("error", func(t *testing.T) {
		mockFPRepo := new(mocks.FloorPlanRepository)
		bRepo := repositories.NewBuildingRepository(nil)
		svc := services.NewFloorPlanService(mockFPRepo, bRepo)

		mockFPRepo.On("DeleteFloorPlan", ctx, testID).Return(errors.New("db error"))

		err := svc.Delete(ctx, testID)

		assert.Error(t, err)
		mockFPRepo.AssertExpectations(t)
	})
}

func TestFloorPlanService_Update(t *testing.T) {
	ctx := context.Background()
	testID := uuid.New()
	newName := "Updated Floor Name"
	newWidth := 600

	req := dto.UpdateFloorPlanRequest{
		Name:  &newName,
		Width: &newWidth,
	}

	t.Run("success", func(t *testing.T) {
		mockFPRepo := new(mocks.FloorPlanRepository)
		bRepo := repositories.NewBuildingRepository(nil)
		svc := services.NewFloorPlanService(mockFPRepo, bRepo)

		existingFP := &models.FloorPlans{
			UUIDBase: models.UUIDBase{ID: testID},
			Name:     "Old Floor Name",
			Width:    400,
			Height:   300,
		}

		mockFPRepo.On("FindFloorPlanByID", ctx, testID).Return(existingFP, nil)
		mockFPRepo.On("UpdateFloorPlan", ctx, existingFP).Return(nil)

		res, err := svc.Update(ctx, testID, req)

		assert.NoError(t, err)
		assert.NotNil(t, res)
		assert.Equal(t, "Updated Floor Name", res.Name)
		assert.Equal(t, 600, res.Width)
		mockFPRepo.AssertExpectations(t)
	})

	t.Run("not found", func(t *testing.T) {
		mockFPRepo := new(mocks.FloorPlanRepository)
		bRepo := repositories.NewBuildingRepository(nil)
		svc := services.NewFloorPlanService(mockFPRepo, bRepo)

		mockFPRepo.On("FindFloorPlanByID", ctx, testID).Return(nil, gorm.ErrRecordNotFound)

		res, err := svc.Update(ctx, testID, req)

		assert.Error(t, err)
		assert.Nil(t, res)
		mockFPRepo.AssertExpectations(t)
	})
}
