package controllers

import (
	"log"
	"strconv"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/docpath"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

const maxUploadSize = 10 << 20 // 10 MB

type UploadController struct {
	minio       *services.StorageService
	drive       *services.DriveService  // nil ถ้าไม่ได้ configure
	driveRoutes map[string]string       // doc-type key → Drive folder ID
}

func NewUploadController(
	minio *services.StorageService,
	drive *services.DriveService,
	driveRoutes map[string]string,
) *UploadController {
	return &UploadController{minio: minio, drive: drive, driveRoutes: driveRoutes}
}

// Upload รับ multipart file + form fields แล้วอัปโหลดตาม DocTypes routing table
// ถ้า doc type รู้จัก → ใช้ docpath naming, อัปโหลดไปทุก storage ที่ระบุ
// ถ้าไม่รู้จัก → fallback ไป MinIO ด้วย path เดิม
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

	bookingDate := time.Now()
	if dateStr := ctx.PostForm("booking_date"); dateStr != "" {
		if parsed, err := time.Parse("2006-01-02", dateStr); err == nil {
			bookingDate = parsed
		}
	}

	locationName := ctx.PostForm("location_name")
	bookingID, _ := strconv.Atoi(ctx.PostForm("booking_id"))

	dt, known := docpath.DocTypes[folder]
	if !known {
		// Unknown folder → legacy MinIO path (sanitized)
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
		return
	}

	objectKey := docpath.ObjectKey(dt.FolderName, bookingDate, locationName, bookingID, fh.Filename)

	// ── MinIO ────────────────────────────────────────────────────────────────
	var minioResult services.UploadResult
	if dt.StoreMinio {
		minioResult, err = c.minio.UploadWithKey(ctx.Request.Context(), objectKey, fh)
		if err != nil {
			response.InternalError(ctx, "minio upload failed: "+err.Error())
			return
		}
	}

	// ── Google Drive ─────────────────────────────────────────────────────────
	var driveURL string
	if dt.StoreDrive && c.drive != nil {
		if driveFolderID, ok := c.driveRoutes[folder]; ok {
			driveResult, driveErr := c.drive.UploadMultipart(ctx.Request.Context(), driveFolderID, fh, bookingDate, locationName, bookingID)
			if driveErr != nil {
				// Drive failure is non-fatal — log and continue
				log.Printf("drive upload warning (folder=%s): %v", folder, driveErr)
			} else {
				driveURL = driveResult.ViewURL
			}
		}
	}

	response.Created(ctx, dto.UploadResponse{
		BucketName:  minioResult.BucketName,
		ObjectKey:   minioResult.ObjectKey,
		URL:         minioResult.URL,
		DriveURL:    driveURL,
		FileName:    fh.Filename,
		ContentType: minioResult.ContentType,
		Size:        fh.Size,
		ExpiresIn:   minioResult.ExpiresIn,
	})
}
