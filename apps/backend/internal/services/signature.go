package services

import (
	"context"
	"errors"
	"mime/multipart"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
)

// SignatureFolder is the private storage folder holding saved user signatures.
const SignatureFolder = "signatures"

type SignatureService struct {
	repo    *repositories.SignatureRepository
	storage *StorageService
}

func NewSignatureService(repo *repositories.SignatureRepository, storage *StorageService) *SignatureService {
	return &SignatureService{repo: repo, storage: storage}
}

// Save stores a new signature image, replacing any previously saved one for
// this user (both the DB record and the old object in storage).
func (s *SignatureService) Save(ctx context.Context, userID uint, fh *multipart.FileHeader) (dto.SignatureResponse, error) {
	if fh.Header.Get("Content-Type") != "image/png" {
		return dto.SignatureResponse{}, errors.New("signature must be a PNG file")
	}

	result, err := s.storage.UploadMultipart(ctx, SignatureFolder, fh)
	if err != nil {
		return dto.SignatureResponse{}, err
	}

	if existing, err := s.repo.FindByUserID(userID); err == nil {
		_ = s.storage.Delete(ctx, existing.ObjectKey)
	}

	sig := &models.UserSignatures{
		UserID:     userID,
		BucketName: result.BucketName,
		ObjectKey:  result.ObjectKey,
	}
	if err := s.repo.Upsert(sig); err != nil {
		return dto.SignatureResponse{}, err
	}

	return dto.SignatureResponse{URL: result.URL, UpdatedAt: sig.UpdatedAt}, nil
}

func (s *SignatureService) Get(ctx context.Context, userID uint) (dto.SignatureResponse, error) {
	sig, err := s.repo.FindByUserID(userID)
	if err != nil {
		return dto.SignatureResponse{}, err
	}
	url, err := s.storage.PresignedURL(ctx, sig.ObjectKey)
	if err != nil {
		return dto.SignatureResponse{}, err
	}
	return dto.SignatureResponse{URL: url, UpdatedAt: sig.UpdatedAt}, nil
}

func (s *SignatureService) Delete(ctx context.Context, userID uint) error {
	sig, err := s.repo.FindByUserID(userID)
	if err != nil {
		return err
	}
	if err := s.storage.Delete(ctx, sig.ObjectKey); err != nil {
		return err
	}
	return s.repo.DeleteByUserID(userID)
}
