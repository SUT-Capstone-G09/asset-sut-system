package services

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
)

type DocumentService struct {
	documentRepo *repositories.DocumentRepository
}

func NewDocumentService(documentRepo *repositories.DocumentRepository) *DocumentService {
	return &DocumentService{documentRepo: documentRepo}
}

func (s *DocumentService) GetByBookingID(bookingID uint) ([]dto.DocumentResponse, error) {
	docs, err := s.documentRepo.FindByBookingID(bookingID)
	if err != nil {
		return nil, err
	}
	var result []dto.DocumentResponse
	for _, d := range docs {
		result = append(result, toDocumentResponse(d))
	}
	return result, nil
}

func (s *DocumentService) GetByID(id uint) (*dto.DocumentResponse, error) {
	doc, err := s.documentRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	res := toDocumentResponse(*doc)
	return &res, nil
}

func (s *DocumentService) Create(req dto.CreateDocumentRequest) (*dto.DocumentResponse, error) {
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

func toDocumentResponse(d models.Documents) dto.DocumentResponse {
	res := dto.DocumentResponse{
		ID:             d.ID,
		BookingID:      d.BookingID,
		DocumentTypeID: d.DocumentTypeID,
		FileName:       d.FileName,
		FileURL:        d.FileURL,
		ContentType:    d.ContentType,
		CreatedAt:      d.CreatedAt,
	}
	if d.DocumentType != nil {
		res.DocumentType = d.DocumentType.Type
	}
	if d.Method != nil {
		res.Method = d.Method.Method
	}
	return res
}
