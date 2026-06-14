package controllers

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

type RequesterController struct {
	requesterService *services.RequesterService
}

func NewRequesterController(requesterService *services.RequesterService) *RequesterController {
	return &RequesterController{requesterService: requesterService}
}

func (c *RequesterController) GetAll(ctx *gin.Context) {
	requesters, err := c.requesterService.GetAll()
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, requesters)
}

func (c *RequesterController) GetByID(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	requester, err := c.requesterService.GetByID(id)
	if err != nil {
		response.NotFound(ctx, "requester not found")
		return
	}
	response.OK(ctx, requester)
}

func (c *RequesterController) Update(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	var req dto.UpdateRequesterRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	requester, err := c.requesterService.Update(id, req)
	if err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, requester)
}

func (c *RequesterController) Delete(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	if err := c.requesterService.Delete(id); err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "deleted"})
}

func (c *RequesterController) GetMyProfile(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")
	requester, err := c.requesterService.GetProfile(userID)
	if err != nil {
		response.NotFound(ctx, "profile not found")
		return
	}
	response.OK(ctx, requester)
}
