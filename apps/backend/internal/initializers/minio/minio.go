// Package minio wires the MinIO/S3 client used to store generated artifacts
// (currently payment QR images).
package minio

import (
	"context"
	"fmt"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

// Connect builds a MinIO client and ensures the configured bucket exists.
func Connect(cfg config.MinioConfig) (*minio.Client, error) {
	client, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: cfg.UseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create minio client: %w", err)
	}

	if err := ensureBucket(context.Background(), client, cfg.Bucket); err != nil {
		return nil, fmt.Errorf("failed to ensure bucket %q: %w", cfg.Bucket, err)
	}
	return client, nil
}

func ensureBucket(ctx context.Context, client *minio.Client, bucket string) error {
	exists, err := client.BucketExists(ctx, bucket)
	if err != nil {
		return err
	}
	if exists {
		return nil
	}
	return client.MakeBucket(ctx, bucket, minio.MakeBucketOptions{})
}
