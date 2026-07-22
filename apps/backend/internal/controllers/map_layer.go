package controllers

import (
	"errors"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MapLayerController struct {
	mapLayerService *services.MapLayerService
}

func NewMapLayerController(mapLayerService *services.MapLayerService) *MapLayerController {
	return &MapLayerController{mapLayerService: mapLayerService}
}

// Create inserts a new map layer inside a floor plan.
func (h *MapLayerController) Create(c *gin.Context) {
	idStr := c.Param("floorPlanId")

	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "invalid floor plan uuid")
		return
	}

	var req dto.CreateMapLayerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request body")
		return
	}

	layer, err := h.mapLayerService.Create(c.Request.Context(), id, req)
	if err != nil {
		writeMapError(c, err)
		return
	}

	response.Created(c, layer)
}

// Update updates standard attributes of an existing map layer.
func (h *MapLayerController) Update(c *gin.Context) {
	idStr := c.Param("id")

	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "invalid layer uuid")
		return
	}

	var req dto.UpdateMapLayerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request body")
		return
	}

	layer, err := h.mapLayerService.Update(c.Request.Context(), id, req)
	if err != nil {
		writeMapError(c, err)
		return
	}

	response.OK(c, layer)
}

// Delete removes a map layer and all its nested elements.
func (h *MapLayerController) Delete(c *gin.Context) {
	idStr := c.Param("id")

	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "invalid layer uuid")
		return
	}

	err = h.mapLayerService.Delete(c.Request.Context(), id)
	if err != nil {
		writeMapError(c, err)
		return
	}

	response.OK(c, gin.H{"message": "map layer deleted successfully"})
}

// CreateMapElement inserts a new map element inside a layer.
func (h *MapLayerController) CreateMapElement(c *gin.Context) {
	idStr := c.Param("layerId")

	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "invalid layer uuid")
		return
	}

	var req dto.CreateMapElementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request body")
		return
	}

	element, err := h.mapLayerService.CreateMapElement(c.Request.Context(), id, req)
	if err != nil {
		writeMapError(c, err)
		return
	}

	response.Created(c, element)
}

// UpdateMapElement updates standard map element attributes.
func (h *MapLayerController) UpdateMapElement(c *gin.Context) {
	idStr := c.Param("id")

	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "invalid element uuid")
		return
	}

	var req dto.UpdateMapElementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request body")
		return
	}

	element, err := h.mapLayerService.UpdateMapElement(c.Request.Context(), id, req)
	if err != nil {
		writeMapError(c, err)
		return
	}

	response.OK(c, element)
}

// DeleteMapElement removes a map element from the database.
func (h *MapLayerController) DeleteMapElement(c *gin.Context) {
	idStr := c.Param("id")

	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "invalid element uuid")
		return
	}

	err = h.mapLayerService.DeleteMapElement(c.Request.Context(), id)
	if err != nil {
		writeMapError(c, err)
		return
	}

	response.OK(c, gin.H{"message": "map element deleted successfully"})
}

func writeMapError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, gorm.ErrRecordNotFound):
		response.NotFound(c, "resource not found")

	default:
		response.InternalError(c, "internal server error")
	}
}