package controllers

import (
	"mime/multipart"
	"strconv"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

const maxUploadSize = 10 << 20 // 10 MB

type UploadController struct {
	minio       *services.StorageService
	drive       *services.DriveService   // nil ถ้าไม่ได้ configure
	driveRoutes map[string]string        // folder name → Drive folder ID
}

func NewUploadController(
	minio *services.StorageService,
	drive *services.DriveService,
	driveRoutes map[string]string,
) *UploadController {
	return &UploadController{
		minio:       minio,
		drive:       drive,
		driveRoutes: driveRoutes,
	}
}

// Upload รับ multipart file + form field "folder"
// แล้ว route ไปยัง Google Drive หรือ MinIO ตาม folder routing rules
func (c *UploadController) Upload(ctx *gin.Context) {
	fh, err := ctx.FormFile("file")
	if err != nil {
		response.BadRequest(ctx, "missing form-data file field 'file'")
		return
	}
	if fh.Size > maxUploadSize {
		response.BadRequest(ctx, "file too large (max 10MB)")
		return
	}

	folder := ctx.PostForm("folder")

	// Parse optional booking_date (ISO date "2006-01-02"); fallback to now
	bookingDate := time.Now()
	if dateStr := ctx.PostForm("booking_date"); dateStr != "" {
		if parsed, err := time.Parse("2006-01-02", dateStr); err == nil {
			bookingDate = parsed
		}
	}

	locationName := ctx.PostForm("location_name")

	bookingID, _ := strconv.Atoi(ctx.PostForm("booking_id"))

	// Route to Drive if folder is mapped and Drive is configured
	if c.drive != nil {
		if drivefolderID, ok := c.driveRoutes[folder]; ok {
			c.uploadToDrive(ctx, drivefolderID, fh, bookingDate, locationName, bookingID)
			return
		}
	}

	// Default: MinIO
	c.uploadToMinio(ctx, folder, fh)
}

func (c *UploadController) uploadToMinio(ctx *gin.Context, folder string, fh *multipart.FileHeader) {
	result, err := c.minio.UploadMultipart(ctx.Request.Context(), folder, fh)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.Created(ctx, dto.UploadResponse{
		BucketName:  result.BucketName,
		ObjectKey:   result.ObjectKey,
		URL:         result.URL,
		FileName:    result.FileName,
		ContentType: result.ContentType,
		Size:        result.Size,
		ExpiresIn:   result.ExpiresIn,
	})
}

func (c *UploadController) uploadToDrive(ctx *gin.Context, folderID string, fh *multipart.FileHeader, bookingDate time.Time, locationName string, bookingID int) {
	result, err := c.drive.UploadMultipart(ctx.Request.Context(), folderID, fh, bookingDate, locationName, bookingID)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.Created(ctx, dto.UploadResponse{
		BucketName:  "gdrive",
		ObjectKey:   result.FileID,
		URL:         result.ViewURL,
		FileName:    result.FileName,
		ContentType: result.ContentType,
		Size:        result.Size,
		ExpiresIn:   0,
	})
}
