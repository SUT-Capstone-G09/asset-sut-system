package main

import (
	"log"

	seeder "github.com/SUT-Capstone-G09/asset-sut-system/cmd/init-db/seed_data"
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

	log.Println("Dropping all tables...")
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to get sql.DB: %v", err)
	}
	if _, err := sqlDB.Exec(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`); err != nil {
		log.Fatalf("failed to drop schema: %v", err)
	}
	log.Println("All tables dropped.")

	log.Println("Running migrations...")
	if err := db.AutoMigrate(models.AllEntities...); err != nil {
		log.Fatalf("failed to migrate: %v", err)
	}

	log.Println("Seeding data...")
	if err := seeder.RunSeeders(db, cfg); err != nil {
		log.Fatalf("failed to seed: %v", err)
	}

	log.Println("Database reset completed successfully.")
}
