package controllers

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

type PaymentController struct {
	paymentService *services.PaymentService
}

func NewPaymentController(paymentService *services.PaymentService) *PaymentController {
	return &PaymentController{paymentService: paymentService}
}

func (c *PaymentController) GetAll(ctx *gin.Context) {
	txs, err := c.paymentService.GetAll()
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, txs)
}

func (c *PaymentController) GetByInvoiceID(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	txs, err := c.paymentService.GetByInvoiceID(id)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, txs)
}

func (c *PaymentController) GetByID(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	tx, err := c.paymentService.GetByID(id)
	if err != nil {
		response.NotFound(ctx, "transaction not found")
		return
	}
	response.OK(ctx, tx)
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
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, tx)
}

func (c *PaymentController) AttachSlip(ctx *gin.Context) {
	txID, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	docID, err := parseSubID(ctx, "did")
	if err != nil {
		response.BadRequest(ctx, "invalid document id")
		return
	}
	if err := c.paymentService.AttachSlip(txID, docID); err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "slip attached"})
}
