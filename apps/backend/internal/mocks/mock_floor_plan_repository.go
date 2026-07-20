package mocks

import (
	"context"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
)

type FloorPlanRepository struct {
	mock.Mock
}

func (m *FloorPlanRepository) FindFloorPlanByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.FloorPlans, error) {
	args := m.Called(ctx, id)

	if args.Get(0) == nil {
		return nil, args.Error(1)
	}

	return args.Get(0).(*models.FloorPlans), args.Error(1)
}

func (m *FloorPlanRepository) FindFloorPlansByBuildingID(
	ctx context.Context,
	buildingID uint,
) ([]models.FloorPlans, error) {
	args := m.Called(ctx, buildingID)

	floorPlans, _ := args.Get(0).([]models.FloorPlans)

	return floorPlans, args.Error(1)
}

func (m *FloorPlanRepository) CreateFloorPlan(
	ctx context.Context,
	fp *models.FloorPlans,
) error {
	args := m.Called(ctx, fp)

	return args.Error(0)
}

func (m *FloorPlanRepository) UpdateFloorPlan(
	ctx context.Context,
	fp *models.FloorPlans,
) error {
	args := m.Called(ctx, fp)

	return args.Error(0)
}

func (m *FloorPlanRepository) DeleteFloorPlan(
	ctx context.Context,
	id uuid.UUID,
) error {
	args := m.Called(ctx, id)
	
	return args.Error(0)
}
