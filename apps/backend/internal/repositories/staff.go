package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type StaffRepository struct {
	db *gorm.DB
}

func NewStaffRepository(db *gorm.DB) *StaffRepository {
	return &StaffRepository{db: db}
}

func (r *StaffRepository) FindAll() ([]models.Profiles, error) {
	var staffs []models.Profiles
	err := r.db.Preload("User").Preload("User.Permissions").Preload("User.Roles").
		Joins("JOIN users ON users.id = profiles.user_id").
		Joins("JOIN user_roles ON user_roles.users_id = users.id").
		Joins("JOIN roles ON roles.id = user_roles.roles_id").
		Where("roles.name = ?", "staff").Find(&staffs).Error
	return staffs, err
}

func (r *StaffRepository) FindByID(id uint) (*models.Profiles, error) {
	var staff models.Profiles
	err := r.db.
		Preload("User").
		Preload("User.Permissions").
		Preload("User.Roles").
		Joins("JOIN users ON users.id = profiles.user_id").
		Joins("JOIN user_roles ON user_roles.users_id = users.id").
		Joins("JOIN roles ON roles.id = user_roles.roles_id").
		Where("roles.name = ?", "staff").
		Where("profiles.id = ?", id).
		First(&staff).Error
	return &staff, err
}

func (r *StaffRepository) FindByUserID(userID uint) (*models.Profiles, error) {
	var staff models.Profiles
	err := r.db.Where("user_id = ?", userID).First(&staff).Error
	return &staff, err
}

func (r *StaffRepository) Create(staff *models.Profiles) error {
	return r.db.Create(staff).Error
}

func (r *StaffRepository) Update(staff *models.Profiles) error {
	return r.db.Save(staff).Error
}

func (r *StaffRepository) Delete(id uint) error {
	return r.db.Delete(&models.Profiles{}, id).Error
}

func (r *StaffRepository) AssignPermissions(userID uint, permissions []models.Permissions) error {
	var user models.Users
	if err := r.db.First(&user, userID).Error; err != nil {
		return err
	}
	return r.db.Model(&user).Association("Permissions").Replace(permissions)
}

func (r *StaffRepository) GetPermissions(userID uint) ([]models.Permissions, error) {
	var user models.Users
	if err := r.db.Preload("Permissions").First(&user, userID).Error; err != nil {
		return nil, err
	}
	return user.Permissions, nil
}
