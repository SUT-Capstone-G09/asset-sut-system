package services

import (
	"context"
	"errors"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
)

type DocumentService struct {
	documentRepo   *repositories.DocumentRepository
	storageService *StorageService
}

func NewDocumentService(documentRepo *repositories.DocumentRepository, storageService *StorageService) *DocumentService {
	return &DocumentService{
		documentRepo:   documentRepo,
		storageService: storageService,
	}
}

func (s *DocumentService) GetByBookingID(bookingID uint) ([]dto.DocumentResponse, error) {
	docs, err := s.documentRepo.FindByBookingID(bookingID)
	if err != nil {
		return nil, err
	}
	var result []dto.DocumentResponse
	for _, d := range docs {
		result = append(result, s.toDocumentResponse(d))
	}
	return result, nil
}

func (s *DocumentService) GetByID(id uint) (*dto.DocumentResponse, error) {
	doc, err := s.documentRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	res := s.toDocumentResponse(*doc)
	return &res, nil
}

func (s *DocumentService) Create(uploadedBy uint, req dto.CreateDocumentRequest) (*dto.DocumentResponse, error) {
	// The caller only proved they can access req.BookingID — that says nothing
	// about whether they're the one who actually uploaded req.ObjectKey. Without
	// this check, anyone who learns another user's object key (e.g. a leaked or
	// expired presigned URL) could attach that file to their own booking.
	if err := s.storageService.VerifyObjectOwner(context.Background(), req.ObjectKey, uploadedBy); err != nil {
		return nil, errors.New("object was not uploaded by this user")
	}

	doc := &models.Documents{
		BookingID:      req.BookingID,
		DocumentTypeID: req.DocumentTypeID,
		FileName:       req.FileName,
		BucketName:     req.BucketName,
		ObjectKey:      req.ObjectKey,
		FileURL:        req.FileURL,
		ContentType:    req.ContentType,
		MethodID:       req.MethodID,
	}
	if err := s.documentRepo.Create(doc); err != nil {
		return nil, err
	}
	return s.GetByID(doc.ID)
}

func (s *DocumentService) Delete(id uint) error {
	return s.documentRepo.Delete(id)
}

func (s *DocumentService) toDocumentResponse(d models.Documents) dto.DocumentResponse {
	res := dto.DocumentResponse{
		ID:             d.ID,
		BookingID:      d.BookingID,
		DocumentTypeID: d.DocumentTypeID,
		FileName:       d.FileName,
		FileURL:        d.FileURL,
		ContentType:    d.ContentType,
		CreatedAt:      d.CreatedAt,
	}
	
	// Generate fresh presigned URL
	if freshURL, err := s.storageService.PresignedURL(context.Background(), d.ObjectKey); err == nil {
		res.FileURL = freshURL
	}

	if d.DocumentType != nil {
		res.DocumentType = d.DocumentType.Type
	}
	if d.Method != nil {
		res.Method = d.Method.Method
	}
	return res
}
