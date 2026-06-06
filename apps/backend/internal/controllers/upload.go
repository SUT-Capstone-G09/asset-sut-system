package controllers

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

// maxUploadSize caps a single uploaded file at 10 MB.
const maxUploadSize = 10 << 20

type UploadController struct {
	storage *services.StorageService
}

func NewUploadController(storage *services.StorageService) *UploadController {
	return &UploadController{storage: storage}
}

// Upload stores a single multipart file (form field "file") in MinIO and returns
// its object key and a presigned URL. Optional form field "folder" groups files
// (e.g. "slips", "documents"). Any module can reuse this endpoint.
func (c *UploadController) Upload(ctx *gin.Context) {
	fileHeader, err := ctx.FormFile("file")
	if err != nil {
		response.BadRequest(ctx, "missing form-data file field 'file'")
		return
	}
	if fileHeader.Size > maxUploadSize {
		response.BadRequest(ctx, "file too large (max 10MB)")
		return
	}

	result, err := c.storage.UploadMultipart(ctx.Request.Context(), ctx.PostForm("folder"), fileHeader)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}

	response.Created(ctx, dto.UploadResponse{
		ObjectKey:   result.ObjectKey,
		URL:         result.URL,
		FileName:    result.FileName,
		ContentType: result.ContentType,
		Size:        result.Size,
		ExpiresIn:   result.ExpiresIn,
	})
}
