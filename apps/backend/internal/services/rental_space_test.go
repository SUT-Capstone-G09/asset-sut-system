package services_test

import (
	"context"
	"errors"
	"testing"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/mocks"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func TestRentalSpaceService_FindAll(t *testing.T) {
	ctx := context.Background()
	buildingID := uint(1)
	filter := repositories.RentalSpaceFilter{
		BuildingID: &buildingID,
	}

	t.Run("success", func(t *testing.T) {
		mockRentalRepo := new(mocks.RentalSpaceRepository)
		bRepo := repositories.NewBuildingRepository(nil)
		svc := services.NewRentalSpaceService(mockRentalRepo, bRepo)

		spaces := []models.RentalSpaces{
			{Base: models.Base{ID: 1}, BuildingID: &buildingID, Name: "Space A1", Status: "available"},
			{Base: models.Base{ID: 2}, BuildingID: &buildingID, Name: "Space A2", Status: "occupied"},
		}

		mockRentalRepo.On("FindAll", ctx, filter).Return(spaces, nil)

		res, err := svc.FindAll(ctx, filter)

		assert.NoError(t, err)
		assert.Len(t, res, 2)
		assert.Equal(t, "Space A1", res[0].Name)
		assert.Equal(t, "Space A2", res[1].Name)
		mockRentalRepo.AssertExpectations(t)
	})

	t.Run("repo error", func(t *testing.T) {
		mockRentalRepo := new(mocks.RentalSpaceRepository)
		bRepo := repositories.NewBuildingRepository(nil)
		svc := services.NewRentalSpaceService(mockRentalRepo, bRepo)

		mockRentalRepo.On("FindAll", ctx, filter).Return(nil, errors.New("db error"))

		res, err := svc.FindAll(ctx, filter)

		assert.Error(t, err)
		assert.Nil(t, res)
		assert.Contains(t, err.Error(), "find rental spaces")
		mockRentalRepo.AssertExpectations(t)
	})
}

func TestRentalSpaceService_FindByID(t *testing.T) {
	ctx := context.Background()
	spaceID := uint(5)

	t.Run("success", func(t *testing.T) {
		mockRentalRepo := new(mocks.RentalSpaceRepository)
		bRepo := repositories.NewBuildingRepository(nil)
		svc := services.NewRentalSpaceService(mockRentalRepo, bRepo)

		expectedSpace := &models.RentalSpaces{
			Base:   models.Base{ID: spaceID},
			Name:   "Space B5",
			Status: "available",
		}

		mockRentalRepo.On("FindByID", ctx, spaceID).Return(expectedSpace, nil)

		res, err := svc.FindByID(ctx, spaceID)

		assert.NoError(t, err)
		assert.NotNil(t, res)
		assert.Equal(t, spaceID, res.ID)
		assert.Equal(t, "Space B5", res.Name)
		mockRentalRepo.AssertExpectations(t)
	})

	t.Run("not found", func(t *testing.T) {
		mockRentalRepo := new(mocks.RentalSpaceRepository)
		bRepo := repositories.NewBuildingRepository(nil)
		svc := services.NewRentalSpaceService(mockRentalRepo, bRepo)

		mockRentalRepo.On("FindByID", ctx, spaceID).Return(nil, gorm.ErrRecordNotFound)

		res, err := svc.FindByID(ctx, spaceID)

		assert.Error(t, err)
		assert.Nil(t, res)
		assert.True(t, errors.Is(err, gorm.ErrRecordNotFound))
		mockRentalRepo.AssertExpectations(t)
	})
}

func TestRentalSpaceService_Delete(t *testing.T) {
	ctx := context.Background()
	spaceID := uint(3)

	t.Run("success", func(t *testing.T) {
		mockRentalRepo := new(mocks.RentalSpaceRepository)
		bRepo := repositories.NewBuildingRepository(nil)
		svc := services.NewRentalSpaceService(mockRentalRepo, bRepo)

		mockRentalRepo.On("Delete", ctx, spaceID).Return(nil)

		err := svc.Delete(ctx, spaceID)

		assert.NoError(t, err)
		mockRentalRepo.AssertExpectations(t)
	})

	t.Run("error", func(t *testing.T) {
		mockRentalRepo := new(mocks.RentalSpaceRepository)
		bRepo := repositories.NewBuildingRepository(nil)
		svc := services.NewRentalSpaceService(mockRentalRepo, bRepo)

		mockRentalRepo.On("Delete", ctx, spaceID).Return(errors.New("db error"))

		err := svc.Delete(ctx, spaceID)

		assert.Error(t, err)
		mockRentalRepo.AssertExpectations(t)
	})
}
