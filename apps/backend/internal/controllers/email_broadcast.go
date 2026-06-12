package controllers

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

type EmailBroadcastController struct {
	service *services.EmailBroadcastService
}

func NewEmailBroadcastController(service *services.EmailBroadcastService) *EmailBroadcastController {
	return &EmailBroadcastController{service: service}
}

func (c *EmailBroadcastController) Preview(ctx *gin.Context) {
	var req dto.PreviewAudienceRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	res, err := c.service.Preview(req.Audience)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, res)
}

func (c *EmailBroadcastController) Create(ctx *gin.Context) {
	var req dto.SendBroadcastRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	res, err := c.service.Create(req, ctx.GetUint("user_id"))
	if err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.Created(ctx, res)
}

func (c *EmailBroadcastController) List(ctx *gin.Context) {
	list, err := c.service.List()
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, list)
}

func (c *EmailBroadcastController) Get(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	res, err := c.service.Get(id)
	if err != nil {
		response.NotFound(ctx, "broadcast not found")
		return
	}
	response.OK(ctx, res)
}

func (c *EmailBroadcastController) Options(ctx *gin.Context) {
	res, err := c.service.Options()
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, res)
}

func (c *EmailBroadcastController) SearchRecipients(ctx *gin.Context) {
	res, err := c.service.SearchRecipients(ctx.Query("q"))
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, res)
}
