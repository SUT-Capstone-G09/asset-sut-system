package repositories

import (
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type LocationRepository struct {
	db *gorm.DB
}

func NewLocationRepository(db *gorm.DB) *LocationRepository {
	return &LocationRepository{db: db}
}

func (r *LocationRepository) FindAll() ([]models.Locations, error) {
	var locations []models.Locations
	err := r.db.
		Preload("Type").
		Preload("Status").
		Preload("PricingTiers.RequesterType").
		Preload("PricingTiers.RateType").
		Find(&locations).Error
	return locations, err
}

func (r *LocationRepository) FindByID(id uint) (*models.Locations, error) {
	var location models.Locations
	err := r.db.
		Preload("Type").
		Preload("Status").
		Preload("Equipments.Equipment").
		Preload("Addons.ChargeType").
		Preload("PricingTiers.RequesterType").
		Preload("PricingTiers.RateType").
		First(&location, id).Error
	return &location, err
}

func (r *LocationRepository) Create(location *models.Locations) error {
	return r.db.Create(location).Error
}

func (r *LocationRepository) Update(location *models.Locations) error {
	return r.db.Save(location).Error
}

func (r *LocationRepository) Delete(id uint) error {
	return r.db.Delete(&models.Locations{}, id).Error
}

// ── Unavailabilities ────────────────────────────────────────────────────────

func (r *LocationRepository) FindUnavailabilities(locationID uint) ([]models.LocationUnavailabilities, error) {
	var items []models.LocationUnavailabilities
	err := r.db.Where("location_id = ?", locationID).Find(&items).Error
	return items, err
}

func (r *LocationRepository) CreateUnavailability(u *models.LocationUnavailabilities) error {
	return r.db.Create(u).Error
}

func (r *LocationRepository) DeleteUnavailability(id uint) error {
	return r.db.Delete(&models.LocationUnavailabilities{}, id).Error
}

// ── Equipments ───────────────────────────────────────────────────────────────

func (r *LocationRepository) AddEquipment(le *models.LocationEquipments) error {
	return r.db.Create(le).Error
}

func (r *LocationRepository) RemoveEquipment(locationID, equipmentID uint) error {
	return r.db.Where("location_id = ? AND equipment_id = ?", locationID, equipmentID).
		Delete(&models.LocationEquipments{}).Error
}

// ── Addons ───────────────────────────────────────────────────────────────────

func (r *LocationRepository) CreateAddon(addon *models.LocationAddons) error {
	return r.db.Create(addon).Error
}

func (r *LocationRepository) FindAddonByID(id uint) (*models.LocationAddons, error) {
	var addon models.LocationAddons
	err := r.db.Preload("ChargeType").First(&addon, id).Error
	return &addon, err
}

func (r *LocationRepository) UpdateAddon(addon *models.LocationAddons) error {
	return r.db.Save(addon).Error
}

func (r *LocationRepository) DeleteAddon(id uint) error {
	return r.db.Delete(&models.LocationAddons{}, id).Error
}

// ── Pricing Tiers ─────────────────────────────────────────────────────────────

func (r *LocationRepository) CreatePricingTier(tier *models.LocationPricingTiers) error {
	return r.db.Create(tier).Error
}

func (r *LocationRepository) DeletePricingTier(id uint) error {
	return r.db.Delete(&models.LocationPricingTiers{}, id).Error
}

// ── Availability ─────────────────────────────────────────────────────────────

func (r *LocationRepository) FindUnavailabilitiesByDate(locationID uint, date time.Time) ([]models.LocationUnavailabilities, error) {
	var items []models.LocationUnavailabilities
	err := r.db.Where("location_id = ? AND date = ?", locationID, date.Format("2006-01-02")).Find(&items).Error
	return items, err
}
