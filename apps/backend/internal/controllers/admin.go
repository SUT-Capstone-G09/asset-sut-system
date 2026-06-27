package controllers

import (
	"strconv"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

type AdminController struct {
	adminService *services.AdminService
}

func NewAdminController(adminService *services.AdminService) *AdminController {
	return &AdminController{adminService: adminService}
}

func (c *AdminController) GetAll(ctx *gin.Context) {
	admins, err := c.adminService.GetAll()
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, admins)
}

func (c *AdminController) GetByID(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	admin, err := c.adminService.GetByID(id)
	if err != nil {
		response.NotFound(ctx, "admin not found")
		return
	}
	response.OK(ctx, admin)
}

func (c *AdminController) Create(ctx *gin.Context) {
	var req dto.CreateAdminRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	admin, err := c.adminService.Create(req)
	if err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.Created(ctx, admin)
}

func (c *AdminController) Update(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	var req dto.UpdateAdminRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	admin, err := c.adminService.Update(id, req)
	if err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, admin)
}

func (c *AdminController) Delete(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	if err := c.adminService.Delete(id); err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "deleted"})
}

func (c *AdminController) GetMyProfile(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")
	admin, err := c.adminService.GetProfile(userID)
	if err != nil {
		response.NotFound(ctx, "profile not found")
		return
	}
	response.OK(ctx, admin)
}

func parseID(ctx *gin.Context) (uint, error) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	return uint(id), err
}

func parseSubID(ctx *gin.Context, param string) (uint, error) {
	id, err := strconv.ParseUint(ctx.Param(param), 10, 64)
	return uint(id), err
}
