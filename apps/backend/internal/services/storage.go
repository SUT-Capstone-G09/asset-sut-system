package services

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/minio/minio-go/v7"
)

// StorageService is a thin, reusable wrapper around MinIO. Any module can inject
// it to store a file and get back a presigned URL without touching the client.
type StorageService struct {
	client    *minio.Client
	bucket    string
	urlExpiry time.Duration
}

func NewStorageService(client *minio.Client, cfg config.MinioConfig) *StorageService {
	return &StorageService{
		client:    client,
		bucket:    cfg.Bucket,
		urlExpiry: cfg.URLExpiry,
	}
}

// UploadResult describes a stored object.
type UploadResult struct {
	BucketName  string
	ObjectKey   string
	URL         string
	FileName    string
	ContentType string
	Size        int64
	ExpiresIn   int // seconds until URL expires
}

// UploadMultipart stores an uploaded form file under folder/ and returns its
// metadata including a presigned URL. Easiest entry point for HTTP handlers.
func (s *StorageService) UploadMultipart(ctx context.Context, folder string, fh *multipart.FileHeader) (UploadResult, error) {
	file, err := fh.Open()
	if err != nil {
		return UploadResult{}, fmt.Errorf("open upload: %w", err)
	}
	defer file.Close()

	contentType := fh.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	objectKey := s.BuildObjectKey(folder, fh.Filename)
	if _, err := s.client.PutObject(ctx, s.bucket, objectKey, file, fh.Size, minio.PutObjectOptions{
		ContentType: contentType,
	}); err != nil {
		return UploadResult{}, fmt.Errorf("upload object: %w", err)
	}

	url, err := s.PresignedURL(ctx, objectKey)
	if err != nil {
		return UploadResult{}, err
	}

	return UploadResult{
		BucketName:  s.bucket,
		ObjectKey:   objectKey,
		URL:         url,
		FileName:    fh.Filename,
		ContentType: contentType,
		Size:        fh.Size,
		ExpiresIn:   int(s.urlExpiry.Seconds()),
	}, nil
}

// UploadWithKey stores an uploaded form file under the exact objectKey provided.
// Use this when the key has already been built by a trusted source (e.g. docpath.ObjectKey)
// and must not be sanitized or randomized.
func (s *StorageService) UploadWithKey(ctx context.Context, objectKey string, fh *multipart.FileHeader) (UploadResult, error) {
	file, err := fh.Open()
	if err != nil {
		return UploadResult{}, fmt.Errorf("open upload: %w", err)
	}
	defer file.Close()

	contentType := fh.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	if _, err := s.client.PutObject(ctx, s.bucket, objectKey, file, fh.Size, minio.PutObjectOptions{
		ContentType: contentType,
	}); err != nil {
		return UploadResult{}, fmt.Errorf("upload object: %w", err)
	}

	url, err := s.PresignedURL(ctx, objectKey)
	if err != nil {
		return UploadResult{}, err
	}

	return UploadResult{
		BucketName:  s.bucket,
		ObjectKey:   objectKey,
		URL:         url,
		FileName:    fh.Filename,
		ContentType: contentType,
		Size:        fh.Size,
		ExpiresIn:   int(s.urlExpiry.Seconds()),
	}, nil
}

// UploadBytes stores raw bytes under an explicit object key (used when the
// caller already has the content in memory, e.g. a rendered QR image).
func (s *StorageService) UploadBytes(ctx context.Context, objectKey string, data []byte, contentType string) error {
	_, err := s.client.PutObject(ctx, s.bucket, objectKey, bytes.NewReader(data), int64(len(data)), minio.PutObjectOptions{
		ContentType: contentType,
	})
	return err
}

// Stream opens an object for reading along with its metadata (size, content
// type). The caller must Close the returned object. Used to proxy public images
// without exposing the bucket or relying on expiring presigned URLs.
func (s *StorageService) Stream(ctx context.Context, objectKey string) (*minio.Object, minio.ObjectInfo, error) {
	obj, err := s.client.GetObject(ctx, s.bucket, objectKey, minio.GetObjectOptions{})
	if err != nil {
		return nil, minio.ObjectInfo{}, fmt.Errorf("get object: %w", err)
	}
	info, err := obj.Stat()
	if err != nil {
		obj.Close()
		return nil, minio.ObjectInfo{}, err
	}
	return obj, info, nil
}

// Delete removes an object from storage (used e.g. when replacing or removing
// a user's saved signature).
func (s *StorageService) Delete(ctx context.Context, objectKey string) error {
	return s.client.RemoveObject(ctx, s.bucket, objectKey, minio.RemoveObjectOptions{})
}

// PresignedURL returns a temporary download URL for an object.
func (s *StorageService) PresignedURL(ctx context.Context, objectKey string) (string, error) {
	u, err := s.client.PresignedGetObject(ctx, s.bucket, objectKey, s.urlExpiry, nil)
	if err != nil {
		return "", fmt.Errorf("sign url: %w", err)
	}
	return u.String(), nil
}

// URLExpirySeconds exposes the configured presigned-URL lifetime in seconds.
func (s *StorageService) URLExpirySeconds() int {
	return int(s.urlExpiry.Seconds())
}

// BuildObjectKey produces a collision-resistant key "folder/<ts>-<rand><ext>".
func (s *StorageService) BuildObjectKey(folder, filename string) string {
	name := time.Now().UTC().Format("20060102150405") + "-" + randomSuffix() + strings.ToLower(filepath.Ext(filename))
	if folder = sanitizeFolder(folder); folder != "" {
		return folder + "/" + name
	}
	return name
}

// sanitizeFolder keeps a safe subset of characters and blocks path traversal.
func sanitizeFolder(folder string) string {
	folder = strings.ReplaceAll(strings.TrimSpace(folder), "\\", "/")
	var b strings.Builder
	for _, r := range folder {
		switch {
		case r >= 'a' && r <= 'z', r >= 'A' && r <= 'Z', r >= '0' && r <= '9',
			r == '-', r == '_', r == '/':
			b.WriteRune(r)
		}
	}
	cleaned := strings.ReplaceAll(b.String(), "..", "")
	return strings.Trim(cleaned, "/")
}

func randomSuffix() string {
	b := make([]byte, 4)
	if _, err := rand.Read(b); err != nil {
		return "00000000"
	}
	return hex.EncodeToString(b)
}
