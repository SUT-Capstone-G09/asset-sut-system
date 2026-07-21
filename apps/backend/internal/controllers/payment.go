package controllers

import (
	"errors"

	"strconv"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/easyslip"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PaymentController struct {
	paymentService *services.PaymentService
	qrService      *services.PaymentQRService
	verifyService  *services.PaymentVerifyService
}

func NewPaymentController(
	paymentService *services.PaymentService,
	qrService *services.PaymentQRService,
	verifyService *services.PaymentVerifyService,
) *PaymentController {
	return &PaymentController{
		paymentService: paymentService,
		qrService:      qrService,
		verifyService:  verifyService,
	}
}

func getParamUint(ctx *gin.Context, param string) (uint, error) {
	valStr := ctx.Param(param)
	val, err := strconv.ParseUint(valStr, 10, 32)
	if err != nil {
		return 0, err
	}
	return uint(val), nil
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
			response.NotFound(ctx, "booking not found")
		default:
			response.InternalError(ctx, err.Error())
		}
		return
	}

	response.OK(ctx, resp)
}

// VerifySlip sends an uploaded slip to EasySlip and records the auto-match result.
func (c *PaymentController) VerifySlip(ctx *gin.Context) {
	var req dto.VerifySlipRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}

	resp, err := c.verifyService.VerifySlip(ctx.Request.Context(), req)
	if err != nil {
		var apiErr *easyslip.APIError
		switch {
		case errors.Is(err, services.ErrDuplicateSlip):
			response.BadRequest(ctx, "duplicate slip")
		case errors.Is(err, services.ErrNoSlipSource):
			response.BadRequest(ctx, err.Error())
		case errors.Is(err, easyslip.ErrNotConfigured):
			response.InternalError(ctx, "slip verification is not configured")
		case errors.Is(err, gorm.ErrRecordNotFound):
			response.NotFound(ctx, "booking, invoice or slip not found")
		case errors.As(err, &apiErr):
			response.BadRequest(ctx, apiErr.Message)
		default:
			response.InternalError(ctx, err.Error())
		}
		return
	}

	response.OK(ctx, resp)
}

// GetAllStatuses returns every payment status (id + name) so clients can
// resolve a status by name instead of hardcoding IDs.
func (c *PaymentController) GetAllStatuses(ctx *gin.Context) {
	resp, err := c.paymentService.GetAllStatuses()
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, resp)
}

// GetAll returns all payment transactions.
func (c *PaymentController) GetAll(ctx *gin.Context) {
	resp, err := c.paymentService.GetAll()
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, resp)
}

// GetByInvoiceID returns payment transactions for a given invoice.
func (c *PaymentController) GetByInvoiceID(ctx *gin.Context) {
	invoiceID, err := getParamUint(ctx, "id")
	if err != nil {
		response.BadRequest(ctx, "invalid invoice id")
		return
	}

	resp, err := c.paymentService.GetByInvoiceID(invoiceID)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, resp)
}

// Create handles payment creation (e.g. user submitting payment proof details).
func (c *PaymentController) Create(ctx *gin.Context) {
	var req dto.CreatePaymentRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}

	resp, err := c.paymentService.Create(ctx.GetUint("user_id"), ctx.GetString("role"), req)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.Created(ctx, resp)
}

// Verify approves or rejects a payment transaction.
func (c *PaymentController) Verify(ctx *gin.Context) {
	txID, err := getParamUint(ctx, "id")
	if err != nil {
		response.BadRequest(ctx, "invalid transaction id")
		return
	}

	// Assuming staff/admin is verifying
	verifierID, exists := ctx.Get("user_id")
	if !exists {
		response.Unauthorized(ctx, "unauthorized")
		return
	}

	var req dto.VerifyPaymentRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}

	resp, err := c.paymentService.Verify(txID, verifierID.(uint), req)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, resp)
}

// AttachSlip associates an uploaded slip document with a payment transaction.
func (c *PaymentController) AttachSlip(ctx *gin.Context) {
	txID, err := getParamUint(ctx, "id")
	if err != nil {
		response.BadRequest(ctx, "invalid transaction id")
		return
	}

	docID, err := getParamUint(ctx, "docId")
	if err != nil {
		response.BadRequest(ctx, "invalid document id")
		return
	}

	if err := c.paymentService.AttachSlip(txID, docID); err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "slip attached successfully"})
}
