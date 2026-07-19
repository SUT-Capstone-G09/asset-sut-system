package controllers

import (
	"errors"
	"strconv"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type RentalSpaceController struct {
	rentalSpaceService *services.RentalSpaceService
}

func NewRentalSpaceController(
	rentalSpaceService *services.RentalSpaceService,
) *RentalSpaceController {
	return &RentalSpaceController{
		rentalSpaceService: rentalSpaceService,
	}
}

// FindAll retrieves all rental spaces matching the query filter.
func (h *RentalSpaceController) FindAll(c *gin.Context) {
	var filter repositories.RentalSpaceFilter

	if err := c.ShouldBindQuery(&filter); err != nil {
		response.BadRequest(c, "invalid query parameters")
		return
	}

	spaces, err := h.rentalSpaceService.FindAll(c.Request.Context(), filter)
	if err != nil {
		writeRentalSpaceError(c, err)
		return
	}

	response.OK(c, spaces)
}

// FindByID retrieves a single rental space by its ID.
func (h *RentalSpaceController) FindByID(c *gin.Context) {
	idStr := c.Param("id")
	
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "invalid rental space id")
		return
	}

	space, err := h.rentalSpaceService.FindByID(c.Request.Context(), uint(id))
	if err != nil {
		writeRentalSpaceError(c, err)
		return
	}

	response.OK(c, space)
}

// Create inserts a new rental space record.
func (h *RentalSpaceController) Create(c *gin.Context) {
	var req dto.CreateRentalSpaceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request body")
		return
	}

	space, err := h.rentalSpaceService.Create(c.Request.Context(), req)
	if err != nil {
		writeRentalSpaceError(c, err)
		return
	}

	response.Created(c, space)
}

// Update updates an existing rental space record.
func (h *RentalSpaceController) Update(c *gin.Context) {
	idStr := c.Param("id")
	
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "invalid rental space id")
		return
	}

	var req dto.UpdateRentalSpaceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request body")
		return
	}

	space, err := h.rentalSpaceService.Update(c.Request.Context(), uint(id), req)
	if err != nil {
		writeRentalSpaceError(c, err)
		return
	}

	response.OK(c, space)
}

// Delete deletes a rental space by its ID.
func (h *RentalSpaceController) Delete(c *gin.Context) {
	idStr := c.Param("id")

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "invalid rental space id")
		return
	}

	err = h.rentalSpaceService.Delete(c.Request.Context(), uint(id))
	if err != nil {
		writeRentalSpaceError(c, err)
		return
	}

	response.OK(c, gin.H{"message": "rental space deleted successfully"})
}

// handleRentalSpaceError ใช้สำหรับจัดการแปลง Error จากชั้น DB/Service ให้เป็น HTTP Response
// เพิ่มเงื่อนไข Error ใหม่ได้ง่าย
// เพิ่มเครื่องมือช่วยตรวจสอบระบบได้ง่าย เช่น Log, Error Tracking
func writeRentalSpaceError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, gorm.ErrRecordNotFound):
		response.NotFound(c, "rental space not found")
		
	default:
		response.InternalError(c, "internal server error")
	}
}