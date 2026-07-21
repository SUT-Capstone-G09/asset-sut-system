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

	// idx_timeslot_slot: แปลงเป็น partial unique index — บังคับกันเวลาซ้ำเฉพาะการจองที่ไม่ใช่โถง
	// (is_shared=false) ; โถง (is_shared=true) แชร์วันเดียวกันหลายบูธได้ กันชนด้วยการตรวจเซลล์แทน
	// GORM tag ทำ WHERE ไม่ได้ จึงจัดการด้วย raw SQL ตรงนี้ (idempotent)
	if err := db.Exec(`DROP INDEX IF EXISTS idx_timeslot_slot`).Error; err != nil {
		log.Fatalf("failed to drop idx_timeslot_slot: %v", err)
	}
	if err := db.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_timeslot_slot ON timeslots (location_id, date, start_time) WHERE is_shared = false`).Error; err != nil {
		log.Fatalf("failed to create partial idx_timeslot_slot: %v", err)
	}

	// Seed Data
	log.Println("Seeding initial data...")
	if err := seeder.RunSeeders(db, cfg); err != nil {
		log.Fatalf("failed to seed database: %v", err)
	}
	log.Println("Database initialization completed successfully.")
}
