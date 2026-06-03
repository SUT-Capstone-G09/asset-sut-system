package controllers

import (
	"errors"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PaymentController struct {
	qrService *services.PaymentQRService
}

func NewPaymentController(qrService *services.PaymentQRService) *PaymentController {
	return &PaymentController{qrService: qrService}
}

// GenerateQR creates a payment QR for an invoice. The amount is read from the
// invoice in the database; only the invoice id (and optional mode) come from the
// client.
func (c *PaymentController) GenerateQR(ctx *gin.Context) {
	var req dto.GenerateQRRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}

	resp, err := c.qrService.Generate(ctx.Request.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrInvalidMode):
			response.BadRequest(ctx, err.Error())
		case errors.Is(err, gorm.ErrRecordNotFound):
			response.NotFound(ctx, "invoice not found")
		default:
			response.InternalError(ctx, err.Error())
		}
		return
	}

	response.OK(ctx, resp)
}
