package mocks

import (
	"context"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
	"github.com/stretchr/testify/mock"
)

type RentalSpaceRepository struct {
	mock.Mock
}

func (m *RentalSpaceRepository) FindAll(
	ctx context.Context,
	filter repositories.RentalSpaceFilter,
) ([]models.RentalSpaces, error) {
	args := m.Called(ctx, filter)

	spaces, _ := args.Get(0).([]models.RentalSpaces)
	
	return spaces, args.Error(1)
}


func (m *RentalSpaceRepository) FindByID(
	ctx context.Context,
	id uint,
) (*models.RentalSpaces, error) {
	args := m.Called(ctx, id)

	if args.Get(0) == nil {
		return nil, args.Error(1)
	}

	return args.Get(0).(*models.RentalSpaces), args.Error(1)
}

func (m *RentalSpaceRepository) Create(
	ctx context.Context,
	space *models.RentalSpaces,
) error {
	args := m.Called(ctx, space)

	return args.Error(0)
}

func (m *RentalSpaceRepository) Update(
	ctx context.Context,
	space *models.RentalSpaces,
) error {
	args := m.Called(ctx, space)

	return args.Error(0)
}

func (m *RentalSpaceRepository) Delete(
	ctx context.Context,
	id uint,
) error {
	args := m.Called(ctx, id)
	
	return args.Error(0)
}