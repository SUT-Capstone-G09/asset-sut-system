package controllers

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

type DocumentController struct {
	documentService *services.DocumentService
}

func NewDocumentController(documentService *services.DocumentService) *DocumentController {
	return &DocumentController{documentService: documentService}
}

func (c *DocumentController) GetByBookingID(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
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
	response.OK(ctx, doc)
}

func (c *DocumentController) Create(ctx *gin.Context) {
	var req dto.CreateDocumentRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	doc, err := c.documentService.Create(req)
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
	if err := c.documentService.Delete(id); err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "deleted"})
}
