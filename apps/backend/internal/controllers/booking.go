package controllers

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

type BookingController struct {
	bookingService *services.BookingService
	invoiceService *services.InvoiceService
}

func NewBookingController(bookingService *services.BookingService, invoiceService *services.InvoiceService) *BookingController {
	return &BookingController{
		bookingService: bookingService,
		invoiceService: invoiceService,
	}
}

func (c *BookingController) GetAll(ctx *gin.Context) {
	bookings, err := c.bookingService.GetAll()
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, bookings)
}

func (c *BookingController) GetMyBookings(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")
	bookings, err := c.bookingService.GetByUserID(userID)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, bookings)
}

func (c *BookingController) GetByID(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	booking, err := c.bookingService.GetByID(id)
	if err != nil {
		response.NotFound(ctx, "booking not found")
		return
	}
	response.OK(ctx, booking)
}

func (c *BookingController) Create(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")
	var req dto.CreateBookingRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	booking, err := c.bookingService.Create(userID, req)
	if err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.Created(ctx, booking)
}

func (c *BookingController) UpdateStatus(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	changedBy := ctx.GetUint("user_id")
	var req dto.UpdateBookingStatusRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	booking, err := c.bookingService.UpdateStatus(id, changedBy, req)
	if err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, booking)
}

func (c *BookingController) GetInvoice(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	invoice, err := c.invoiceService.GetByBookingID(id)
	if err != nil {
		response.NotFound(ctx, "invoice not found")
		return
	}
	response.OK(ctx, invoice)
}

func (c *BookingController) UpdateExpenses(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	var req dto.UpdateBookingExpensesRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	booking, err := c.bookingService.UpdateExpenses(id, req)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, booking)
}
