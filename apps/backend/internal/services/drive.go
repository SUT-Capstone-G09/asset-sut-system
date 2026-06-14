package services

import (
	"context"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"time"

	"golang.org/x/oauth2/google"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/googleapi"
	"google.golang.org/api/option"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/docpath"
)

type DriveService struct {
	client *drive.Service
}

type DriveUploadResult struct {
	FileID      string
	FileName    string
	ContentType string
	Size        int64
	ViewURL     string
	DownloadURL string
}

func NewDriveService(cfg config.GDriveConfig) (*DriveService, error) {
	// Build minimal service-account JSON from individual env fields
	sa := map[string]string{
		"type":         "service_account",
		"client_email": cfg.ClientEmail,
		"private_key":  cfg.PrivateKey,
		"token_uri":    "https://oauth2.googleapis.com/token",
	}
	jsonBytes, err := json.Marshal(sa)
	if err != nil {
		return nil, fmt.Errorf("marshal service account: %w", err)
	}

	creds, err := google.CredentialsFromJSON(
		context.Background(), jsonBytes,
		drive.DriveScope,
	)
	if err != nil {
		return nil, fmt.Errorf("load google credentials: %w", err)
	}

	svc, err := drive.NewService(context.Background(), option.WithCredentials(creds))
	if err != nil {
		return nil, fmt.Errorf("create drive service: %w", err)
	}

	return &DriveService{client: svc}, nil
}

// UploadMultipart อัปโหลดไฟล์ไปยัง subfolder MM-YYYY (พ.ศ.) ของ bookingDate
// สร้าง subfolder อัตโนมัติถ้ายังไม่มี
func (s *DriveService) UploadMultipart(ctx context.Context, folderID string, fh *multipart.FileHeader, bookingDate time.Time, locationName string, bookingID int) (DriveUploadResult, error) {
	// หา (หรือสร้าง) subfolder ตามเดือนของวันที่จอง
	monthFolderID, err := s.getOrCreateMonthFolder(ctx, folderID, docpath.MonthFolder(bookingDate))
	if err != nil {
		return DriveUploadResult{}, err
	}

	f, err := fh.Open()
	if err != nil {
		return DriveUploadResult{}, fmt.Errorf("open upload: %w", err)
	}
	defer f.Close()

	contentType := fh.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	meta := &drive.File{
		Name:    docpath.FileName(locationName, bookingDate, bookingID, fh.Filename),
		Parents: []string{monthFolderID},
	}

	created, err := s.client.Files.Create(meta).
		Media(f, googleapi.ContentType(contentType)).
		Fields("id,name,size,webViewLink").
		SupportsAllDrives(true).
		Context(ctx).
		Do()
	if err != nil {
		return DriveUploadResult{}, fmt.Errorf("drive upload: %w", err)
	}

	// อนุญาตให้ทุกคนที่มี link ดูได้
	if _, err = s.client.Permissions.Create(created.Id, &drive.Permission{
		Type: "anyone",
		Role: "reader",
	}).SupportsAllDrives(true).Context(ctx).Do(); err != nil {
		return DriveUploadResult{}, fmt.Errorf("set permission: %w", err)
	}

	return DriveUploadResult{
		FileID:      created.Id,
		FileName:    fh.Filename,
		ContentType: contentType,
		Size:        fh.Size,
		ViewURL:     created.WebViewLink,
		DownloadURL: "https://drive.google.com/uc?export=download&id=" + created.Id,
	}, nil
}

// getOrCreateMonthFolder คืน ID ของ subfolder ชื่อ folderName ใน parentID
// ถ้ายังไม่มีจะสร้างใหม่ (สร้างครั้งเดียว — ค้นหาก่อนเสมอ)
func (s *DriveService) getOrCreateMonthFolder(ctx context.Context, parentID, folderName string) (string, error) {
	q := fmt.Sprintf(
		"name='%s' and '%s' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false",
		folderName, parentID,
	)
	list, err := s.client.Files.List().
		Q(q).
		Fields("files(id)").
		SupportsAllDrives(true).
		IncludeItemsFromAllDrives(true).
		PageSize(1).
		Context(ctx).
		Do()
	if err != nil {
		return "", fmt.Errorf("list month folder: %w", err)
	}
	if len(list.Files) > 0 {
		return list.Files[0].Id, nil
	}

	// ไม่มี → สร้างใหม่
	newFolder := &drive.File{
		Name:     folderName,
		MimeType: "application/vnd.google-apps.folder",
		Parents:  []string{parentID},
	}
	created, err := s.client.Files.Create(newFolder).
		Fields("id").
		SupportsAllDrives(true).
		Context(ctx).
		Do()
	if err != nil {
		return "", fmt.Errorf("create month folder: %w", err)
	}
	return created.Id, nil
}

