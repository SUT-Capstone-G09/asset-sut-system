package services

import (
	"errors"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/hash"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
	"gorm.io/gorm"
)

type StaffService struct {
	userRepo       *repositories.UserRepository
	staffRepo      *repositories.StaffRepository
	roleRepo       *repositories.RoleRepository
	permissionRepo *repositories.PermissionRepository
}

func NewStaffService(
	userRepo *repositories.UserRepository,
	staffRepo *repositories.StaffRepository,
	roleRepo *repositories.RoleRepository,
	permissionRepo *repositories.PermissionRepository,
) *StaffService {
	return &StaffService{
		userRepo:       userRepo,
		staffRepo:      staffRepo,
		roleRepo:       roleRepo,
		permissionRepo: permissionRepo,
	}
}

func (s *StaffService) GetAll() ([]dto.StaffResponse, error) {
	staffs, err := s.staffRepo.FindAll()
	if err != nil {
		return nil, err
	}
	var result []dto.StaffResponse
	for _, st := range staffs {
		result = append(result, toStaffResponse(st))
	}
	return result, nil
}

func (s *StaffService) GetByID(id uint) (*dto.StaffResponse, error) {
	staff, err := s.staffRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	res := toStaffResponse(*staff)
	return &res, nil
}

func (s *StaffService) Create(req dto.CreateStaffRequest) (*dto.StaffResponse, error) {
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

	staffRole, err := s.roleRepo.FindByName("staff")
	if err != nil {
		return nil, err
	}
	if err := s.userRepo.AssignRole(user.ID, staffRole); err != nil {
		return nil, err
	}

	staff := &models.Profiles{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Phone:     req.Phone,
		LineID:    req.LineID,
		UserID:    user.ID,
	}
	if err := s.staffRepo.Create(staff); err != nil {
		return nil, err
	}

	staff.User = user
	res := toStaffResponse(*staff)
	return &res, nil
}

func (s *StaffService) Update(id uint, req dto.UpdateStaffRequest) (*dto.StaffResponse, error) {
	staff, err := s.staffRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if req.FirstName != "" {
		staff.FirstName = req.FirstName
	}
	if req.LastName != "" {
		staff.LastName = req.LastName
	}
	if req.Phone != "" {
		staff.Phone = req.Phone
	}
	if req.LineID != "" {
		staff.LineID = req.LineID
	}
	if err := s.staffRepo.Update(staff); err != nil {
		return nil, err
	}
	res := toStaffResponse(*staff)
	return &res, nil
}

func (s *StaffService) Delete(id uint) error {
	staff, err := s.staffRepo.FindByID(id)
	if err != nil {
		return err
	}
	if err := s.staffRepo.Delete(id); err != nil {
		return err
	}
	return s.userRepo.Deactivate(staff.UserID)
}

func (s *StaffService) AssignPermissions(staffID uint, req dto.AssignPermissionsRequest) error {
	staff, err := s.staffRepo.FindByID(staffID)
	if err != nil {
		return err
	}
	permissions, err := s.permissionRepo.FindByIDs(req.PermissionIDs)
	if err != nil {
		return err
	}
	return s.staffRepo.AssignPermissions(staff.UserID, permissions)
}

func (s *StaffService) GetPermissions(staffID uint) ([]dto.PermissionResponse, error) {
	staff, err := s.staffRepo.FindByID(staffID)
	if err != nil {
		return nil, err
	}
	permissions, err := s.staffRepo.GetPermissions(staff.UserID)
	if err != nil {
		return nil, err
	}
	var result []dto.PermissionResponse
	for _, p := range permissions {
		result = append(result, dto.PermissionResponse{ID: p.ID, Module: p.Module, Action: p.Action})
	}
	return result, nil
}

func (s *StaffService) GetProfile(userID uint) (*dto.StaffResponse, error) {
	staff, err := s.staffRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}
	return s.GetByID(staff.ID)
}

func toStaffResponse(st models.Profiles) dto.StaffResponse {
	res := dto.StaffResponse{
		ID:        st.ID,
		FirstName: st.FirstName,
		LastName:  st.LastName,
		Phone:     st.Phone,
		LineID:    st.LineID,
	}
	if st.User != nil {
		res.Email = st.User.Email
		res.IsActive = st.User.IsActive
		for _, p := range st.User.Permissions {
			res.Permissions = append(res.Permissions, dto.PermissionResponse{
				ID:     p.ID,
				Module: p.Module,
				Action: p.Action,
			})
		}
	}
	return res
}
