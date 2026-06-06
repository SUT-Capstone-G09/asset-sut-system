package controllers

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

type StaffController struct {
	staffService *services.StaffService
}

func NewStaffController(staffService *services.StaffService) *StaffController {
	return &StaffController{staffService: staffService}
}

func (c *StaffController) GetAll(ctx *gin.Context) {
	staffs, err := c.staffService.GetAll()
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, staffs)
}

func (c *StaffController) GetByID(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	staff, err := c.staffService.GetByID(id)
	if err != nil {
		response.NotFound(ctx, "staff not found")
		return
	}
	response.OK(ctx, staff)
}

func (c *StaffController) Create(ctx *gin.Context) {
	var req dto.CreateStaffRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	staff, err := c.staffService.Create(req)
	if err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.Created(ctx, staff)
}

func (c *StaffController) Update(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	var req dto.UpdateStaffRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	staff, err := c.staffService.Update(id, req)
	if err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, staff)
}

func (c *StaffController) Delete(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	if err := c.staffService.Delete(id); err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "deleted"})
}

func (c *StaffController) AssignPermissions(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	var req dto.AssignPermissionsRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	if err := c.staffService.AssignPermissions(id, req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "permissions updated"})
}

func (c *StaffController) GetPermissions(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	permissions, err := c.staffService.GetPermissions(id)
	if err != nil {
		response.NotFound(ctx, "staff not found")
		return
	}
	response.OK(ctx, permissions)
}

func (c *StaffController) GetMyProfile(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")
	staff, err := c.staffService.GetProfile(userID)
	if err != nil {
		response.NotFound(ctx, "profile not found")
		return
	}
	response.OK(ctx, staff)
}
