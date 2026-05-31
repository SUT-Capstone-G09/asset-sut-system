package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) FindByEmail(email string) (*models.Users, error) {
	var user models.Users
	err := r.db.Where("email = ?", email).First(&user).Error
	return &user, err
}

func (r *UserRepository) FindByID(id uint) (*models.Users, error) {
	var user models.Users
	err := r.db.Preload("Roles").Preload("Permissions").First(&user, id).Error
	return &user, err
}

func (r *UserRepository) Create(user *models.Users) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) UpdatePassword(userID uint, hashedPassword string) error {
	return r.db.Model(&models.Users{}).Where("id = ?", userID).Update("password", hashedPassword).Error
}

func (r *UserRepository) AssignRole(userID uint, role *models.Roles) error {
	var user models.Users
	if err := r.db.First(&user, userID).Error; err != nil {
		return err
	}
	return r.db.Model(&user).Association("Roles").Replace([]models.Roles{*role})
}

func (r *UserRepository) GetUserRole(userID uint) (string, error) {
	var user models.Users
	if err := r.db.Preload("Roles").First(&user, userID).Error; err != nil {
		return "", err
	}
	if len(user.Roles) == 0 {
		return "", nil
	}
	return user.Roles[0].Name, nil
}

func (r *UserRepository) Deactivate(userID uint) error {
	return r.db.Model(&models.Users{}).Where("id = ?", userID).Update("is_active", false).Error
}
