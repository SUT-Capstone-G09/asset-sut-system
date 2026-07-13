package services

import (
	"bytes"
	"context"
	"errors"
	"image"
	"image/png"
	"io"
	"mime/multipart"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
)

// pngMagic is the fixed 8-byte signature every valid PNG file starts with.
// The client-supplied Content-Type header is not trustworthy on its own —
// anyone calling the API directly can set it to whatever they like.
var pngMagic = []byte{0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}

// validateSignaturePNG re-opens the uploaded file and checks it is a genuine
// PNG with at least one non-opaque pixel — mirroring the check the frontend
// does in the browser, which a direct API call bypasses entirely.
func validateSignaturePNG(fh *multipart.FileHeader) error {
	f, err := fh.Open()
	if err != nil {
		return errors.New("could not read uploaded file")
	}
	defer f.Close()

	data, err := io.ReadAll(f)
	if err != nil {
		return errors.New("could not read uploaded file")
	}

	if !bytes.HasPrefix(data, pngMagic) {
		return errors.New("signature must be a genuine PNG file")
	}

	img, err := png.Decode(bytes.NewReader(data))
	if err != nil {
		return errors.New("could not decode PNG image")
	}

	if !hasTransparentPixel(img) {
		return errors.New("signature PNG must have a transparent background")
	}

	return nil
}

func hasTransparentPixel(img image.Image) bool {
	bounds := img.Bounds()
	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			_, _, _, a := img.At(x, y).RGBA()
			if a < 0xffff {
				return true
			}
		}
	}
	return false
}

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
	if err := validateSignaturePNG(fh); err != nil {
		return dto.SignatureResponse{}, err
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
