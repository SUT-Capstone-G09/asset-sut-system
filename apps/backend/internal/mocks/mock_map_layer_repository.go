package mocks

import (
	"context"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
)

type MapLayerRepository struct {
	mock.Mock
}

func (m *MapLayerRepository) FindMapLayerByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.MapLayers, error) {
	args := m.Called(ctx, id)

	if args.Get(0) == nil {
		return nil, args.Error(1)
	}

	return args.Get(0).(*models.MapLayers), args.Error(1)
}

func (m *MapLayerRepository) CreateMapLayer(
	ctx context.Context,
	ml *models.MapLayers,
) error {
	args := m.Called(ctx, ml)

	return args.Error(0)
}

func (m *MapLayerRepository) UpdateMapLayer(
	ctx context.Context,
	ml *models.MapLayers,
) error {
	args := m.Called(ctx, ml)

	return args.Error(0)
}

func (m *MapLayerRepository) DeleteMapLayer(
	ctx context.Context,
	id uuid.UUID,
) error {
	args := m.Called(ctx, id)

	return args.Error(0)
}

func (m *MapLayerRepository) FindMapElementByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.MapElements, error) {
	args := m.Called(ctx, id)

	if args.Get(0) == nil {
		return nil, args.Error(1)
	}

	return args.Get(0).(*models.MapElements), args.Error(1)
}

func (m *MapLayerRepository) CreateMapElement(
	ctx context.Context,
	me *models.MapElements,
) error {
	args := m.Called(ctx, me)

	return args.Error(0)
}

func (m *MapLayerRepository) UpdateMapElement(
	ctx context.Context,
	me *models.MapElements,
) error {
	args := m.Called(ctx, me)

	return args.Error(0)
}

func (m *MapLayerRepository) DeleteMapElement(
	ctx context.Context,
	id uuid.UUID,
) error {
	args := m.Called(ctx, id)
	
	return args.Error(0)
}
