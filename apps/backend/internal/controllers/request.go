package controllers

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

type RequestController struct {
	requestService *services.RequestService
}

func NewRequestController(requestService *services.RequestService) *RequestController {
	return &RequestController{requestService: requestService}
}

func (c *RequestController) Create(ctx *gin.Context) {
	var input dto.CreateRequestDTO
	if err := ctx.ShouldBindJSON(&input); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}

	userID := ctx.GetUint("user_id")
	if userID == 0 {
		response.Unauthorized(ctx, "unauthorized access")
		return
	}

	res, err := c.requestService.CreateRequest(userID, input)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}

	response.Created(ctx, res)
}

func (c *RequestController) GetRequestTypes(ctx *gin.Context) {
	res, err := c.requestService.GetRequestTypes()
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, res)
}

func (c *RequestController) GetMyRequests(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")
	if userID == 0 {
		response.Unauthorized(ctx, "unauthorized access")
		return
	}

	res, err := c.requestService.GetRequestsByUserID(userID)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}

	response.OK(ctx, res)
}

func (c *RequestController) GetRequestDetail(ctx *gin.Context) {
	refcode := ctx.Param("refcode")
	if refcode == "" {
		response.BadRequest(ctx, "refcode is required")
		return
	}

	userID := ctx.GetUint("user_id")
	if userID == 0 {
		response.Unauthorized(ctx, "unauthorized access")
		return
	}

	req, err := c.requestService.GetRequestByRefcode(refcode)
	if err != nil {
		response.NotFound(ctx, "request not found")
		return
	}

	histories, err := c.requestService.GetRequestHistories(req.ID)
	if err != nil {
		histories = []models.ActionHistories{}
	}

	messages, err := c.requestService.GetRequestChatMessages(req.ID)
	if err != nil {
		messages = []models.ChatMessage{}
	}

	response.OK(ctx, gin.H{
		"request":   req,
		"histories": histories,
		"messages":  messages,
	})
}

func (c *RequestController) UpdateRequestStatusAndStaff(ctx *gin.Context) {
	refcode := ctx.Param("refcode")
	if refcode == "" {
		response.BadRequest(ctx, "refcode is required")
		return
	}

	userID := ctx.GetUint("user_id")
	if userID == 0 {
		response.Unauthorized(ctx, "unauthorized access")
		return
	}

	var reqDTO dto.UpdateRequestStatusDTO
	if err := ctx.ShouldBindJSON(&reqDTO); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}

	err := c.requestService.UpdateRequestStatusAndStaff(refcode, userID, reqDTO)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}

	response.OK(ctx, gin.H{"message": "request status and staff updated successfully"})
}

func (c *RequestController) GetAllRequests(ctx *gin.Context) {
	res, err := c.requestService.GetAllRequests()
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, res)
}
