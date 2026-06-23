package controllers

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

type EmailController struct {
	emailService *services.EmailService
}

func NewEmailController(emailService *services.EmailService) *EmailController {
	return &EmailController{emailService: emailService}
}

func (c *EmailController) SendEmail(ctx *gin.Context) {
	var req dto.SendTestEmailRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}

	key := req.Key
	if key == "" {
		key = "booking.approved"
	}

	if err := c.emailService.Send(req.To, key, req.Data); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}

	response.OK(ctx, gin.H{"message": "email queued for delivery", "to": req.To, "key": key})
}
