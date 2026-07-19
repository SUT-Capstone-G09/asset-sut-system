package controllers

import (
	"errors"
	"strconv"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FloorPlanController struct {
	floorPlanService *services.FloorPlanService
}

func NewFloorPlanController(
	floorPlanService *services.FloorPlanService,
) *FloorPlanController {
	return &FloorPlanController{
		floorPlanService: floorPlanService,
	}
}

// FindByID retrieves a single floor plan by its UUID.
func (h *FloorPlanController) FindByID(c *gin.Context) {
	idStr := c.Param("id")

	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "invalid floor plan uuid")
		return
	}

	plan, err := h.floorPlanService.FindByID(c.Request.Context(), id)
	if err != nil {
		writeFloorPlanError(c, err)
		return
	}

	response.OK(c, plan)
}

// FindAll retrieves all floor plans associated with a building.
func (h *FloorPlanController) FindAll(c *gin.Context) {
	idStr := c.Param("buildingId")

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "invalid building id")
		return
	}

	plans, err := h.floorPlanService.FindAll(c.Request.Context(), uint(id))
	if err != nil {
		writeFloorPlanError(c, err)
		return
	}

	response.OK(c, plans)
}

// Create inserts a new floor plan linked to a building.
func (h *FloorPlanController) Create(c *gin.Context) {
	idStr := c.Param("buildingId")
	
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "invalid building id")
		return
	}

	var req dto.CreateFloorPlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request body")
		return
	}

	plan, err := h.floorPlanService.Create(c.Request.Context(), uint(id), req)
	if err != nil {
		writeFloorPlanError(c, err)
		return
	}

	response.Created(c, plan)
}

// Update updates an existing floor plan record.
func (h *FloorPlanController) Update(c *gin.Context) {
	idStr := c.Param("id")

	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "invalid floor plan uuid")
		return
	}

	var req dto.UpdateFloorPlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request body")
		return
	}

	plan, err := h.floorPlanService.Update(c.Request.Context(), id, req)
	if err != nil {
		writeFloorPlanError(c, err)
		return
	}

	response.OK(c, plan)
}

// Delete removes a floor plan from the database.
func (h *FloorPlanController) Delete(c *gin.Context) {
	idStr := c.Param("id")
	
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "invalid floor plan uuid")
		return
	}

	err = h.floorPlanService.Delete(c.Request.Context(), id)
	if err != nil {
		writeFloorPlanError(c, err)
		return
	}

	response.OK(c, gin.H{"message": "floor plan deleted successfully"})
}

func writeFloorPlanError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, gorm.ErrRecordNotFound):
		response.NotFound(c, "floor plan not found")

	default:
		response.InternalError(c, "internal server error")
	}
}