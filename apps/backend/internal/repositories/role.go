package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type RoleRepository struct {
	db *gorm.DB
}

func NewRoleRepository(db *gorm.DB) *RoleRepository {
	return &RoleRepository{db: db}
}

func (r *RoleRepository) FindAll() ([]models.Roles, error) {
	var roles []models.Roles
	err := r.db.Preload("Permissions").Find(&roles).Error
	return roles, err
}

func (r *RoleRepository) FindByID(id uint) (*models.Roles, error) {
	var role models.Roles
	err := r.db.Preload("Permissions").First(&role, id).Error
	return &role, err
}

func (r *RoleRepository) FindByName(name string) (*models.Roles, error) {
	var role models.Roles
	err := r.db.Where("name = ?", name).First(&role).Error
	return &role, err
}

func (r *RoleRepository) Create(role *models.Roles) error {
	return r.db.Create(role).Error
}

func (r *RoleRepository) Update(role *models.Roles) error {
	return r.db.Save(role).Error
}

func (r *RoleRepository) Delete(id uint) error {
	return r.db.Delete(&models.Roles{}, id).Error
}

func (r *RoleRepository) SetPermissions(role *models.Roles, permissions []models.Permissions) error {
	return r.db.Model(role).Association("Permissions").Replace(permissions)
}
