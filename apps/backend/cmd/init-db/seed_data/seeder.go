package seeder

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"gorm.io/gorm"
)

type Seeder func(db *gorm.DB, cfg *config.Config) error

var AllSeeders = []Seeder{
	seedPermissions,
	seedRoles,
	seedRequestTypes,
	seedAdmins,
	seedStaffs,
	seedRequesters,
}

func RunSeeders(db *gorm.DB, cfg *config.Config) error {
	for _, seeder := range AllSeeders {
		if err := seeder(db, cfg); err != nil {
			return err
		}
	}
	return nil
}
