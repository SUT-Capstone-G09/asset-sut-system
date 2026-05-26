package main

import (
	"log"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/database"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	db, err := database.Connect(cfg.Database)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	// AutoMigrate all entities
	if err := db.AutoMigrate(models.AllEntities...); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}
}