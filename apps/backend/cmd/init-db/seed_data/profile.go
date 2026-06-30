package seeder

import (
	"log"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/hash"
	"gorm.io/gorm"
)

func seedAdmins(db *gorm.DB, cfg *config.Config) error {
	hashed, err := hash.HashPassword("admin")
	if err != nil {
		return err
	}
	user := models.Users{
		Email:        "admin@example.com",
		Password:     hashed,
		AuthProvider: "local",
		ProviderID:   "local",
		IsActive:     true,
	}
	if err := db.FirstOrCreate(&user, models.Users{Email: user.Email}).Error; err != nil {
		return err
	}

	var adminRole models.Roles
	if err := db.Where("name = ?", "admin").First(&adminRole).Error; err != nil {
		return err
	}
	db.Model(&user).Association("Roles").Replace([]models.Roles{adminRole})

	admin := models.Profiles{
		FirstName: "ไพสินทร์",
		LastName:  "ศรีสุข",
		Phone:     "1234567890",
		LineID:    "superadmi",
		UserID:    user.ID,
	}
	if err := db.FirstOrCreate(&admin, models.Profiles{UserID: admin.UserID}).Error; err != nil {
		return err
	}
	log.Println("Admin seeded successfully.")
	return nil
}

func seedStaffs(db *gorm.DB, cfg *config.Config) error {
	hashed, err := hash.HashPassword("12345678")
	if err != nil {
		return err
	}
	user := models.Users{
		Email:        "staff@example.com",
		Password:     hashed,
		AuthProvider: "local",
		ProviderID:   "local",
		IsActive:     true,
	}
	if err := db.FirstOrCreate(&user, models.Users{Email: user.Email}).Error; err != nil {
		return err
	}

	var staffRole models.Roles
	if err := db.Where("name = ?", "staff").First(&staffRole).Error; err != nil {
		return err
	}
	db.Model(&user).Association("Roles").Replace([]models.Roles{staffRole})

	staff := models.Profiles{
		FirstName: "กฤษณะ",
		LastName:  "สุขสวัสดิ์",
		Phone:     "0987654321",
		LineID:    "kris",
		UserID:    user.ID,
	}
	if err := db.FirstOrCreate(&staff, models.Profiles{UserID: staff.UserID}).Error; err != nil {
		return err
	}
	log.Println("Staff seeded successfully.")
	return nil
}

func seedRequestTypes(db *gorm.DB, cfg *config.Config) error {
	types := []models.RequesterTypes{
		{Type: "ผู้ขอใช้บริการภายใน"},
		{Type: "ผู้ขอใช้บริการภายนอก"},
	}
	for _, rt := range types {
		if err := db.FirstOrCreate(&rt, models.RequesterTypes{Type: rt.Type}).Error; err != nil {
			return err
		}
	}
	log.Println("Requester types seeded successfully.")
	return nil
}

func seedRequesters(db *gorm.DB, cfg *config.Config) error {
	hashed, err := hash.HashPassword("12345678")
	if err != nil {
		return err
	}
	user := models.Users{
		Email:        "worawut@gmail.com",
		Password:     hashed,
		AuthProvider: "local",
		ProviderID:   "local",
		IsActive:     true,
	}
	if err := db.FirstOrCreate(&user, models.Users{Email: user.Email}).Error; err != nil {
		return err
	}

	var requesterRole models.Roles
	if err := db.Where("name = ?", "requester").First(&requesterRole).Error; err != nil {
		return err
	}
	db.Model(&user).Association("Roles").Replace([]models.Roles{requesterRole})

	requesterTypeID := uint(2)
	requester := models.Profiles{
		FirstName:       "วรวุฒิ",
		LastName:        "ทัศน์ทอง",
		Phone:           "5551234567",
		LineID:          "worawut",
		UserID:          user.ID,
		RequesterTypeID: &requesterTypeID,
	}
	if err := db.FirstOrCreate(&requester, models.Profiles{UserID: requester.UserID}).Error; err != nil {
		return err
	}
	log.Println("Requester seeded successfully.")
	return nil
}

func seedUsers(db *gorm.DB, cfg *config.Config) error {
	hashed, err := hash.HashPassword("12345678")
	if err != nil {
		return err
	}
	user := models.Users{
		Email:        "user@example.com",
		Password:     hashed,
		AuthProvider: "local",
		ProviderID:   "local",
		IsActive:     true,
	}
	if err := db.FirstOrCreate(&user, models.Users{Email: user.Email}).Error; err != nil {
		return err
	}

	var userRole models.Roles
	if err := db.Where("name = ?", "user").First(&userRole).Error; err != nil {
		return err
	}
	db.Model(&user).Association("Roles").Replace([]models.Roles{userRole})

	requesterTypeID := uint(1) // ภายใน
	profile := models.Profiles{
		FirstName:       "ผู้ใช้งาน",
		LastName:        "ทั่วไป",
		Phone:           "0812345678",
		LineID:          "general_user",
		UserID:          user.ID,
		RequesterTypeID: &requesterTypeID,
	}
	if err := db.FirstOrCreate(&profile, models.Profiles{UserID: profile.UserID}).Error; err != nil {
		return err
	}
	log.Println("User seeded successfully.")
	return nil
}
