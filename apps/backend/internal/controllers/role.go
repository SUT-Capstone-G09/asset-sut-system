package controllers

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

type RoleController struct {
	roleService *services.RoleService
}

func NewRoleController(roleService *services.RoleService) *RoleController {
	return &RoleController{roleService: roleService}
}

func (c *RoleController) GetAll(ctx *gin.Context) {
	roles, err := c.roleService.GetAll()
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, roles)
}

func (c *RoleController) GetByID(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	role, err := c.roleService.GetByID(id)
	if err != nil {
		response.NotFound(ctx, "role not found")
		return
	}
	response.OK(ctx, role)
}

func (c *RoleController) Create(ctx *gin.Context) {
	var req dto.CreateRoleRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	role, err := c.roleService.Create(req)
	if err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.Created(ctx, role)
}

func (c *RoleController) Update(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	var req dto.UpdateRoleRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	role, err := c.roleService.Update(id, req)
	if err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, role)
}

func (c *RoleController) Delete(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	if err := c.roleService.Delete(id); err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "deleted"})
}

func (c *RoleController) GetAllPermissions(ctx *gin.Context) {
	permissions, err := c.roleService.GetAllPermissions()
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, permissions)
}
