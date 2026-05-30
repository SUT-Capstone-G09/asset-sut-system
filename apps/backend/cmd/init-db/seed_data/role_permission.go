package seeder

import (
	"log"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

var allPermissions = []models.Permissions{
	{Module: "user_mgmt", Action: "create"},
	{Module: "user_mgmt", Action: "read"},
	{Module: "user_mgmt", Action: "update"},
	{Module: "user_mgmt", Action: "delete"},
	{Module: "booking", Action: "create"},
	{Module: "booking", Action: "read"},
	{Module: "booking", Action: "update"},
	{Module: "booking", Action: "delete"},
	{Module: "payment", Action: "create"},
	{Module: "payment", Action: "read"},
	{Module: "payment", Action: "update"},
	{Module: "payment", Action: "delete"},
	{Module: "upload_doc", Action: "create"},
	{Module: "upload_doc", Action: "read"},
	{Module: "upload_doc", Action: "update"},
	{Module: "upload_doc", Action: "delete"},
}

func seedPermissions(db *gorm.DB, cfg *config.Config) error {
	for _, p := range allPermissions {
		if err := db.FirstOrCreate(&p, models.Permissions{Module: p.Module, Action: p.Action}).Error; err != nil {
			return err
		}
	}
	log.Println("Permissions seeded successfully.")
	return nil
}

func seedRoles(db *gorm.DB, cfg *config.Config) error {
	roles := []string{"admin", "staff", "requester"}
	for _, name := range roles {
		role := models.Roles{Name: name}
		if err := db.FirstOrCreate(&role, models.Roles{Name: name}).Error; err != nil {
			return err
		}
	}

	var adminRole models.Roles
	if err := db.Where("name = ?", "admin").First(&adminRole).Error; err != nil {
		return err
	}
	var allPerms []models.Permissions
	if err := db.Find(&allPerms).Error; err != nil {
		return err
	}
	if err := db.Model(&adminRole).Association("Permissions").Replace(allPerms); err != nil {
		return err
	}

	log.Println("Roles seeded successfully.")
	return nil
}
