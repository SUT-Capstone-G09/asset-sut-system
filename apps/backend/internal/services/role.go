package services

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
)

type RoleService struct {
	roleRepo       *repositories.RoleRepository
	permissionRepo *repositories.PermissionRepository
}

func NewRoleService(
	roleRepo *repositories.RoleRepository,
	permissionRepo *repositories.PermissionRepository,
) *RoleService {
	return &RoleService{roleRepo: roleRepo, permissionRepo: permissionRepo}
}

func (s *RoleService) GetAll() ([]dto.RoleResponse, error) {
	roles, err := s.roleRepo.FindAll()
	if err != nil {
		return nil, err
	}
	var result []dto.RoleResponse
	for _, r := range roles {
		result = append(result, toRoleResponse(r))
	}
	return result, nil
}

func (s *RoleService) GetByID(id uint) (*dto.RoleResponse, error) {
	role, err := s.roleRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	res := toRoleResponse(*role)
	return &res, nil
}

func (s *RoleService) Create(req dto.CreateRoleRequest) (*dto.RoleResponse, error) {
	permissions, err := s.permissionRepo.FindByIDs(req.PermissionIDs)
	if err != nil {
		return nil, err
	}
	role := &models.Roles{
		Name:        req.Name,
		Permissions: permissions,
	}
	if err := s.roleRepo.Create(role); err != nil {
		return nil, err
	}
	res := toRoleResponse(*role)
	return &res, nil
}

func (s *RoleService) Update(id uint, req dto.UpdateRoleRequest) (*dto.RoleResponse, error) {
	role, err := s.roleRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if req.Name != "" {
		role.Name = req.Name
	}
	if req.PermissionIDs != nil {
		permissions, err := s.permissionRepo.FindByIDs(req.PermissionIDs)
		if err != nil {
			return nil, err
		}
		if err := s.roleRepo.SetPermissions(role, permissions); err != nil {
			return nil, err
		}
		role.Permissions = permissions
	}
	if err := s.roleRepo.Update(role); err != nil {
		return nil, err
	}
	res := toRoleResponse(*role)
	return &res, nil
}

func (s *RoleService) Delete(id uint) error {
	return s.roleRepo.Delete(id)
}

func (s *RoleService) GetAllPermissions() ([]dto.PermissionResponse, error) {
	permissions, err := s.permissionRepo.FindAll()
	if err != nil {
		return nil, err
	}
	var result []dto.PermissionResponse
	for _, p := range permissions {
		result = append(result, dto.PermissionResponse{ID: p.ID, Module: p.Module, Action: p.Action})
	}
	return result, nil
}

func toRoleResponse(r models.Roles) dto.RoleResponse {
	res := dto.RoleResponse{ID: r.ID, Name: r.Name}
	for _, p := range r.Permissions {
		res.Permissions = append(res.Permissions, dto.PermissionResponse{
			ID:     p.ID,
			Module: p.Module,
			Action: p.Action,
		})
	}
	return res
}
