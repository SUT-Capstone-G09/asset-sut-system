package repositories

import (
	"errors"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

// ── Staff Locations ───────────────────────────────────────────────────────────

func (r *LocationRepository) FindByStaffID(staffID uint) ([]models.Locations, error) {
	var locs []models.Locations
	err := r.db.
		Joins("JOIN staff_locations sl ON sl.building_id = locations.building_id").
		Where("sl.user_id = ?", staffID).
		Preload("Type").
		Preload("Status").
		Preload("Building").
		Preload("PricingTiers.RequesterType").
		Preload("PricingTiers.RateType").
		Find(&locs).Error
	return locs, err
}

func (r *LocationRepository) FindBuildingsByStaffID(staffID uint) ([]models.Buildings, error) {
	var buildings []models.Buildings
	err := r.db.
		Joins("JOIN staff_locations sl ON sl.building_id = buildings.id").
		Where("sl.user_id = ?", staffID).
		Find(&buildings).Error
	return buildings, err
}

func (r *LocationRepository) FindStaffByBuildingID(buildingID uint) ([]models.StaffLocations, error) {
	var items []models.StaffLocations
	err := r.db.
		Where("building_id = ?", buildingID).
		Preload("User.Profiles").
		Find(&items).Error
	return items, err
}

func (r *LocationRepository) AssignStaffBuilding(sl *models.StaffLocations) error {
	return r.db.Where(models.StaffLocations{UserID: sl.UserID, BuildingID: sl.BuildingID}).
		FirstOrCreate(sl).Error
}

func (r *LocationRepository) UnassignStaffBuilding(staffID, buildingID uint) error {
	return r.db.Where("user_id = ? AND building_id = ?", staffID, buildingID).
		Delete(&models.StaffLocations{}).Error
}

func (r *LocationRepository) IsStaffAssignedToBuilding(staffID, buildingID uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.StaffLocations{}).
		Where("user_id = ? AND building_id = ?", staffID, buildingID).
		Count(&count).Error
	return count > 0, err
}

func (r *LocationRepository) SetStaffBuildings(staffID uint, buildingIDs []uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("user_id = ?", staffID).Delete(&models.StaffLocations{}).Error; err != nil {
			return err
		}
		for _, bldID := range buildingIDs {
			sl := models.StaffLocations{UserID: staffID, BuildingID: bldID}
			if err := tx.Create(&sl).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

type LocationRepository struct {
	db *gorm.DB
}

func NewLocationRepository(db *gorm.DB) *LocationRepository {
	return &LocationRepository{db: db}
}

func (r *LocationRepository) FindAllTypes() ([]models.LocationTypes, error) {
	var types []models.LocationTypes
	err := r.db.Find(&types).Error
	return types, err
}

func (r *LocationRepository) FindAll() ([]models.Locations, error) {
	var locations []models.Locations
	err := r.db.
		Preload("Type").
		Preload("Status").
		Preload("Building").
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
		Preload("Building").
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

// ── Hall Floor Plan ──────────────────────────────────────────────────────────

// FindFloorPlanByLocationID คืน nil,nil ถ้ายังไม่มีผัง
func (r *LocationRepository) FindFloorPlanByLocationID(locationID uint) (*models.HallFloorPlans, error) {
	var fp models.HallFloorPlans
	err := r.db.Where("location_id = ?", locationID).First(&fp).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &fp, nil
}

// SaveFloorPlan สร้างใหม่ถ้าไม่มี ID, อัปเดตทั้งชุดถ้ามี ID
func (r *LocationRepository) SaveFloorPlan(fp *models.HallFloorPlans) error {
	return r.db.Save(fp).Error
}

// FindFloorPlanLocationIDs คืน location_id ทั้งหมดที่มีผังแล้ว
func (r *LocationRepository) FindFloorPlanLocationIDs() ([]uint, error) {
	var ids []uint
	err := r.db.Model(&models.HallFloorPlans{}).Pluck("location_id", &ids).Error
	return ids, err
}
func (r *LocationRepository) FindAllGlobalAddons() ([]models.LocationAddons, error) {
	var addons []models.LocationAddons
	err := r.db.Where("location_id IS NULL").Find(&addons).Error
	return addons, err
}

func (r *LocationRepository) FindAllBuildings() ([]models.Buildings, error) {
	var buildings []models.Buildings
	err := r.db.Find(&buildings).Error
	return buildings, err
}

