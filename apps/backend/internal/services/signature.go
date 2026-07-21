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

// maxSignatureDimension bounds decoded width/height, not just the compressed
// upload size — a small, highly-compressible PNG can still decode to a huge
// pixel buffer (decompression bomb) and get scanned pixel-by-pixel below.
const maxSignatureDimension = 4096

// minTransparentPixelRatio guards against an opaque scanned image slipping
// through with a single deliberately-faked non-opaque pixel: a genuine
// signature-pad export is mostly transparent canvas with only thin pen
// strokes drawn on it, so a real signature clears this by a wide margin.
const minTransparentPixelRatio = 0.20

// validateSignaturePNG re-opens the uploaded file and checks it is a genuine
// PNG with a transparent background — mirroring the check the frontend does
// in the browser, which a direct API call bypasses entirely.
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

	cfg, err := png.DecodeConfig(bytes.NewReader(data))
	if err != nil {
		return errors.New("could not decode PNG image")
	}
	if cfg.Width > maxSignatureDimension || cfg.Height > maxSignatureDimension {
		return errors.New("signature PNG dimensions are too large")
	}

	img, err := png.Decode(bytes.NewReader(data))
	if err != nil {
		return errors.New("could not decode PNG image")
	}

	if !hasTransparentBackground(img) {
		return errors.New("signature PNG must have a transparent background")
	}

	return nil
}

func hasTransparentBackground(img image.Image) bool {
	bounds := img.Bounds()
	total := (bounds.Max.X - bounds.Min.X) * (bounds.Max.Y - bounds.Min.Y)
	if total == 0 {
		return false
	}
	transparent := 0
	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			_, _, _, a := img.At(x, y).RGBA()
			if a < 0x8000 { // meaningfully transparent, not just one off-by-one pixel
				transparent++
			}
		}
	}
	return float64(transparent)/float64(total) >= minTransparentPixelRatio
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

	result, err := s.storage.UploadMultipart(ctx, SignatureFolder, fh, userID)
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
