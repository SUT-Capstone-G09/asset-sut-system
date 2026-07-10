package controllers

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

const maxSignatureSize = 1 << 20 // 1 MB — generous ceiling for a small transparent PNG

type SignatureController struct {
	service *services.SignatureService
}

func NewSignatureController(service *services.SignatureService) *SignatureController {
	return &SignatureController{service: service}
}

func (c *SignatureController) Save(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")

	fh, err := ctx.FormFile("file")
	if err != nil {
		response.BadRequest(ctx, "missing form-data file field 'file'")
		return
	}
	if fh.Size > maxSignatureSize {
		response.BadRequest(ctx, "file too large (max 1MB)")
		return
	}

	result, err := c.service.Save(ctx.Request.Context(), userID, fh)
	if err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.Created(ctx, result)
}

func (c *SignatureController) Get(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")
	result, err := c.service.Get(ctx.Request.Context(), userID)
	if err != nil {
		response.NotFound(ctx, "no saved signature")
		return
	}
	response.OK(ctx, result)
}

func (c *SignatureController) Delete(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")
	if err := c.service.Delete(ctx.Request.Context(), userID); err != nil {
		response.NotFound(ctx, "no saved signature")
		return
	}
	response.OK(ctx, gin.H{"deleted": true})
}
