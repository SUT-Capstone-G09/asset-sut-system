package controllers

import (
	"net/http"
	"strings"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

const (
	emailImageFolder = "email-images"
	maxImageSize     = 5 << 20 // 5 MB
)

// ImageController stores template images in MinIO and serves them back over a
// permanent (non-expiring) URL, so images survive in recipients' inboxes.
type ImageController struct {
	storage       *services.StorageService
	publicBaseURL string
}

func NewImageController(storage *services.StorageService, publicBaseURL string) *ImageController {
	return &ImageController{storage: storage, publicBaseURL: strings.TrimRight(publicBaseURL, "/")}
}

// Upload stores an image (form field "file") under the email-images/ folder and
// returns a permanent public URL pointing at Serve.
func (c *ImageController) Upload(ctx *gin.Context) {
	fh, err := ctx.FormFile("file")
	if err != nil {
		response.BadRequest(ctx, "missing form-data file field 'file'")
		return
	}
	if fh.Size > maxImageSize {
		response.BadRequest(ctx, "image too large (max 5MB)")
		return
	}
	if !strings.HasPrefix(fh.Header.Get("Content-Type"), "image/") {
		response.BadRequest(ctx, "file must be an image")
		return
	}

	result, err := c.storage.UploadMultipart(ctx.Request.Context(), emailImageFolder, fh, ctx.GetUint("user_id"))
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}

	response.Created(ctx, gin.H{
		"url":        c.publicBaseURL + "/api/v1/images/" + result.ObjectKey,
		"object_key": result.ObjectKey,
	})
}

// Serve streams an image straight from MinIO. It is public (no auth) so email
// clients can load it, but restricted to the email-images/ prefix so other
// objects in the bucket (e.g. payment QR codes) stay private.
func (c *ImageController) Serve(ctx *gin.Context) {
	key := strings.TrimPrefix(ctx.Param("objectKey"), "/")
	if !strings.HasPrefix(key, emailImageFolder+"/") {
		response.NotFound(ctx, "not found")
		return
	}

	obj, info, err := c.storage.Stream(ctx.Request.Context(), key)
	if err != nil {
		response.NotFound(ctx, "image not found")
		return
	}
	defer obj.Close()

	ctx.DataFromReader(http.StatusOK, info.Size, info.ContentType, obj, nil)
}
