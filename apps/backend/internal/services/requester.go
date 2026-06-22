package services

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
)

type RequesterService struct {
	userRepo      *repositories.UserRepository
	requesterRepo *repositories.RequesterRepository
}

func NewRequesterService(
	userRepo *repositories.UserRepository,
	requesterRepo *repositories.RequesterRepository,
) *RequesterService {
	return &RequesterService{userRepo: userRepo, requesterRepo: requesterRepo}
}

func (s *RequesterService) GetAll() ([]dto.RequesterResponse, error) {
	requesters, err := s.requesterRepo.FindAll()
	if err != nil {
		return nil, err
	}
	var result []dto.RequesterResponse
	for _, r := range requesters {
		result = append(result, toRequesterResponse(r))
	}
	return result, nil
}

func (s *RequesterService) GetByID(id uint) (*dto.RequesterResponse, error) {
	requester, err := s.requesterRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	res := toRequesterResponse(*requester)
	return &res, nil
}

func (s *RequesterService) GetProfile(userID uint) (*dto.RequesterResponse, error) {
	requester, err := s.requesterRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}
	res := toRequesterResponse(*requester)
	return &res, nil
}

func (s *RequesterService) Update(id uint, req dto.UpdateRequesterRequest) (*dto.RequesterResponse, error) {
	requester, err := s.requesterRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if req.FirstName != "" {
		requester.FirstName = req.FirstName
	}
	if req.LastName != "" {
		requester.LastName = req.LastName
	}
	if req.Phone != "" {
		requester.Phone = req.Phone
	}
	if req.LineID != "" {
		requester.LineID = req.LineID
	}
	if err := s.requesterRepo.Update(requester); err != nil {
		return nil, err
	}
	res := toRequesterResponse(*requester)
	return &res, nil
}

func (s *RequesterService) Delete(id uint) error {
	requester, err := s.requesterRepo.FindByID(id)
	if err != nil {
		return err
	}
	if err := s.requesterRepo.Delete(id); err != nil {
		return err
	}
	return s.userRepo.Deactivate(requester.UserID)
}

func toRequesterResponse(r models.Profiles) dto.RequesterResponse {
	res := dto.RequesterResponse{
		ID:        r.ID,
		FirstName: r.FirstName,
		LastName:  r.LastName,
		Phone:     r.Phone,
		LineID:    r.LineID,
	}
	if r.User != nil {
		res.Email = r.User.Email
		res.IsActive = r.User.IsActive
	}
	if r.RequesterType != nil {
		res.RequesterType = r.RequesterType.Type
	}
	return res
}
