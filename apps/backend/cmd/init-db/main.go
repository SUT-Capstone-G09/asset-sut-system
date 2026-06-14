package main

import (
	"log"

	"github.com/SUT-Capstone-G09/asset-sut-system/cmd/init-db/seed_data"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/initializers/database"
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

	// Seed Data
	log.Println("Seeding initial data...")
	if err := seeder.RunSeeders(db, cfg); err != nil {
		log.Fatalf("failed to seed database: %v", err)
	}
	log.Println("Database initialization completed successfully.")
}
