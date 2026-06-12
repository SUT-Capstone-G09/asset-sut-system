package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type PermissionRepository struct {
	db *gorm.DB
}

func NewPermissionRepository(db *gorm.DB) *PermissionRepository {
	return &PermissionRepository{db: db}
}

func (r *PermissionRepository) FindAll() ([]models.Permissions, error) {
	var permissions []models.Permissions
	err := r.db.Find(&permissions).Error
	return permissions, err
}

func (r *PermissionRepository) FindByIDs(ids []uint) ([]models.Permissions, error) {
	var permissions []models.Permissions
	err := r.db.Where("id IN ?", ids).Find(&permissions).Error
	return permissions, err
}

func (r *PermissionRepository) FindByID(id uint) (*models.Permissions, error) {
	var permission models.Permissions
	err := r.db.First(&permission, id).Error
	return &permission, err
}

func (r *PermissionRepository) UserHasPermission(userID uint, module, action string) (bool, error) {
	var user models.Users
	err := r.db.
		Preload("Permissions", "module = ? AND action = ?", module, action).
		Preload("Roles.Permissions", "module = ? AND action = ?", module, action).
		First(&user, userID).Error
	if err != nil {
		return false, err
	}

	if len(user.Permissions) > 0 {
		return true, nil
	}
	for _, role := range user.Roles {
		if len(role.Permissions) > 0 {
			return true, nil
		}
	}
	return false, nil
}
