package services

import (
	"errors"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/hash"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
	"gorm.io/gorm"
)

type AdminService struct {
	userRepo  *repositories.UserRepository
	adminRepo *repositories.AdminRepository
	roleRepo  *repositories.RoleRepository
}

func NewAdminService(
	userRepo *repositories.UserRepository,
	adminRepo *repositories.AdminRepository,
	roleRepo *repositories.RoleRepository,
) *AdminService {
	return &AdminService{userRepo: userRepo, adminRepo: adminRepo, roleRepo: roleRepo}
}

func (s *AdminService) GetAll() ([]dto.AdminResponse, error) {
	admins, err := s.adminRepo.FindAll()
	if err != nil {
		return nil, err
	}
	var result []dto.AdminResponse
	for _, a := range admins {
		result = append(result, toAdminResponse(a))
	}
	return result, nil
}

func (s *AdminService) GetByID(id uint) (*dto.AdminResponse, error) {
	admin, err := s.adminRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	res := toAdminResponse(*admin)
	return &res, nil
}

func (s *AdminService) Create(req dto.CreateAdminRequest) (*dto.AdminResponse, error) {
	_, err := s.userRepo.FindByEmail(req.Email)
	if err == nil {
		return nil, errors.New("email already in use")
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	hashed, err := hash.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := &models.Users{
		Email:        req.Email,
		Password:     hashed,
		AuthProvider: "local",
		ProviderID:   "local",
		IsActive:     true,
	}
	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	adminRole, err := s.roleRepo.FindByName("admin")
	if err != nil {
		return nil, err
	}
	if err := s.userRepo.AssignRole(user.ID, adminRole); err != nil {
		return nil, err
	}

	admin := &models.Profiles{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Phone:     req.Phone,
		LineID:    req.LineID,
		UserID:    user.ID,
	}
	if err := s.adminRepo.Create(admin); err != nil {
		return nil, err
	}

	admin.User = user
	res := toAdminResponse(*admin)
	return &res, nil
}

func (s *AdminService) Update(id uint, req dto.UpdateAdminRequest) (*dto.AdminResponse, error) {
	admin, err := s.adminRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if req.FirstName != "" {
		admin.FirstName = req.FirstName
	}
	if req.LastName != "" {
		admin.LastName = req.LastName
	}
	if req.Phone != "" {
		admin.Phone = req.Phone
	}
	if req.LineID != "" {
		admin.LineID = req.LineID
	}
	if err := s.adminRepo.Update(admin); err != nil {
		return nil, err
	}
	res := toAdminResponse(*admin)
	return &res, nil
}

func (s *AdminService) Delete(id uint) error {
	admin, err := s.adminRepo.FindByID(id)
	if err != nil {
		return err
	}
	if err := s.adminRepo.Delete(id); err != nil {
		return err
	}
	return s.userRepo.Deactivate(admin.UserID)
}

func (s *AdminService) GetProfile(userID uint) (*dto.AdminResponse, error) {
	admin, err := s.adminRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, err
	}
	admin.User = user
	res := toAdminResponse(*admin)
	return &res, nil
}

func toAdminResponse(a models.Profiles) dto.AdminResponse {
	res := dto.AdminResponse{
		ID:        a.ID,
		FirstName: a.FirstName,
		LastName:  a.LastName,
		Phone:     a.Phone,
		LineID:    a.LineID,
	}
	if a.User != nil {
		res.Email = a.User.Email
		res.IsActive = a.User.IsActive
	}
	return res
}
