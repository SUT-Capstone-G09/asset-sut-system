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
	qrService      *services.PaymentQRService
	paymentService *services.PaymentService
}

func NewPaymentController(qrService *services.PaymentQRService, paymentService *services.PaymentService) *PaymentController {
	return &PaymentController{qrService: qrService, paymentService: paymentService}
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

func (c *PaymentController) GetAll(ctx *gin.Context) {
	txs, err := c.paymentService.GetAll()
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, txs)
}

func (c *PaymentController) Create(ctx *gin.Context) {
	var req dto.CreatePaymentRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	tx, err := c.paymentService.Create(req)
	if err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.Created(ctx, tx)
}

func (c *PaymentController) Verify(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	verifierID := ctx.GetUint("user_id")
	var req dto.VerifyPaymentRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	tx, err := c.paymentService.Verify(id, verifierID, req)
	if err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.OK(ctx, tx)
}

func (c *PaymentController) AttachSlip(ctx *gin.Context) {
	txID, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid transaction id")
		return
	}
	docID, err := parseSubID(ctx, "docId")
	if err != nil {
		response.BadRequest(ctx, "invalid document id")
		return
	}
	if err := c.paymentService.AttachSlip(txID, docID); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "slip attached"})
}
