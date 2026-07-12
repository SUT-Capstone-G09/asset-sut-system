package services

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
	"github.com/lib/pq"
)

type RequestService struct {
	requestRepo *repositories.RequestRepository
}

func NewRequestService(requestRepo *repositories.RequestRepository) *RequestService {
	return &RequestService{requestRepo: requestRepo}
}

func (s *RequestService) GenerateRefcode() string {
	// Generate refcode like REQ-YYYY-XXXXXX (e.g. REQ-2026-104829)
	randNum := 100000 + rand.Intn(900000) // Generates a number between 100000 and 999999
	return fmt.Sprintf("REQ-%d-%d", time.Now().Year(), randNum)
}

func (s *RequestService) CreateRequest(userID uint, reqDTO dto.CreateRequestDTO) (*models.Requests, error) {
	// 1. Fetch pending status
	status, err := s.requestRepo.FindStatusByName("pending")
	if err != nil {
		return nil, fmt.Errorf("default status 'pending' not found: %w", err)
	}

	// 2. Generate refcode
	refcode := s.GenerateRefcode()

	// 3. Create request object
	request := &models.Requests{
		UserID:        userID,
		Refcode:       refcode,
		RequestTypeID: reqDTO.RequestTypeID,
		Title:         reqDTO.Title,
		Description:   reqDTO.Description,
		Location:      reqDTO.Location,
		StatusID:      status.ID,
		EvidenceUrls:  pq.StringArray(reqDTO.EvidenceUrls),
		ContactInfo:   reqDTO.ContactInfo,
		IncidentDate:  reqDTO.IncidentDate,
	}

	// 4. Save to DB
	if err := s.requestRepo.Create(request); err != nil {
		return nil, fmt.Errorf("failed to save request: %w", err)
	}

	// 5. Load relations for returning
	return s.requestRepo.FindByID(request.ID)
}

func (s *RequestService) GetRequestTypes() ([]models.RequestTypes, error) {
	return s.requestRepo.FindAllRequestTypes()
}

func (s *RequestService) GetRequestsByUserID(userID uint) ([]models.Requests, error) {
	return s.requestRepo.FindAllByUserID(userID)
}

func (s *RequestService) GetRequestByRefcode(refcode string) (*models.Requests, error) {
	return s.requestRepo.FindByRefcode(refcode)
}

func (s *RequestService) GetRequestHistories(requestID uint) ([]models.ActionHistories, error) {
	return s.requestRepo.FindHistoriesByRequestID(requestID)
}

func (s *RequestService) GetRequestChatMessages(requestID uint) ([]models.ChatMessage, error) {
	return s.requestRepo.FindChatMessagesByRequestID(requestID)
}

func (s *RequestService) UpdateRequestStatusAndStaff(refcode string, adminID uint, reqDTO dto.UpdateRequestStatusDTO) error {
	req, err := s.requestRepo.FindByRefcode(refcode)
	if err != nil {
		return err
	}

	status, err := s.requestRepo.FindStatusByName(reqDTO.Status)
	if err != nil {
		return err
	}

	return s.requestRepo.UpdateRequestStatusAndStaff(req.ID, status.ID, reqDTO.StaffID, adminID, reqDTO.Detail)
}

func (s *RequestService) GetAllRequests() ([]models.Requests, error) {
	return s.requestRepo.FindAllRequests()
}
