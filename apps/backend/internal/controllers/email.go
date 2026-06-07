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

// SendTest renders and sends the "booking.approved" template to an arbitrary
// address. It exists to verify SMTP + template rendering and is admin-only.
func (c *EmailController) SendTest(ctx *gin.Context) {
	var req dto.SendTestEmailRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}

	err := c.emailService.Send(req.To, "booking.approved", map[string]any{
		"userName":   req.UserName,
		"assetName":  req.AssetName,
		"amount":     req.Amount,
		"paymentUrl": req.PaymentURL,
	})
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}

	response.OK(ctx, gin.H{"message": "email queued for delivery", "to": req.To})
}
