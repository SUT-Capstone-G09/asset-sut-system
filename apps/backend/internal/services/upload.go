package services

import (
	"context"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"time"

	"github.com/minio/minio-go/v7"
)

type UploadService struct {
	client   *minio.Client
	bucket   string
	endpoint string
	useSSL   bool
}

func NewUploadService(client *minio.Client, bucket, endpoint string, useSSL bool) *UploadService {
	return &UploadService{client: client, bucket: bucket, endpoint: endpoint, useSSL: useSSL}
}

func (s *UploadService) UploadFile(fileHeader *multipart.FileHeader) (string, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("open file: %w", err)
	}
	defer file.Close()

	ext := filepath.Ext(fileHeader.Filename)
	objectName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)

	contentType := fileHeader.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	_, err = s.client.PutObject(context.Background(), s.bucket, objectName, file, fileHeader.Size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", fmt.Errorf("put object: %w", err)
	}

	scheme := "http"
	if s.useSSL {
		scheme = "https"
	}
	url := fmt.Sprintf("%s://%s/%s/%s", scheme, s.endpoint, s.bucket, objectName)
	return url, nil
}
