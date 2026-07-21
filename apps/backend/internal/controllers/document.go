package controllers

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

type DocumentController struct {
	documentService *services.DocumentService
	bookingService  *services.BookingService
}

func NewDocumentController(documentService *services.DocumentService, bookingService *services.BookingService) *DocumentController {
	return &DocumentController{documentService: documentService, bookingService: bookingService}
}

// canAccessBooking reports whether the caller may read/write documents
// belonging to bookingID — the same ownership rule enforced on the booking
// itself (see BookingController.GetByID), since a document is only ever
// reachable through its parent booking.
func (c *DocumentController) canAccessBooking(ctx *gin.Context, bookingID uint) bool {
	booking, err := c.bookingService.GetByID(bookingID)
	if err != nil {
		return false
	}
	return isOwnerOrStaff(ctx, booking.UserID)
}

func (c *DocumentController) GetByBookingID(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	if !c.canAccessBooking(ctx, id) {
		response.NotFound(ctx, "booking not found")
		return
	}
	docs, err := c.documentService.GetByBookingID(id)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, docs)
}

func (c *DocumentController) GetByID(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	doc, err := c.documentService.GetByID(id)
	if err != nil {
		response.NotFound(ctx, "document not found")
		return
	}
	if !c.canAccessBooking(ctx, doc.BookingID) {
		response.NotFound(ctx, "document not found")
		return
	}
	response.OK(ctx, doc)
}

func (c *DocumentController) Create(ctx *gin.Context) {
	var req dto.CreateDocumentRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	if !c.canAccessBooking(ctx, req.BookingID) {
		response.NotFound(ctx, "booking not found")
		return
	}
	doc, err := c.documentService.Create(ctx.GetUint("user_id"), req)
	if err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.Created(ctx, doc)
}

func (c *DocumentController) Delete(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	doc, err := c.documentService.GetByID(id)
	if err != nil {
		response.NotFound(ctx, "document not found")
		return
	}
	if !c.canAccessBooking(ctx, doc.BookingID) {
		response.NotFound(ctx, "document not found")
		return
	}
	if err := c.documentService.Delete(id); err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "deleted"})
}
