package repositories

import (
	"errors"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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

func (r *LocationRepository) FindAllRateTypes() ([]models.RateTypes, error) {
	var rateTypes []models.RateTypes
	err := r.db.Find(&rateTypes).Error
	return rateTypes, err
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

// LockByID takes a SELECT ... FOR UPDATE row lock on the location before
// returning it, with pricing tiers preloaded for callers that need to price
// a booking. Used to serialize concurrent booking attempts on the same
// location: a plain "FOR UPDATE" on Timeslots only locks rows that already
// exist, so two transactions racing to book the same still-empty slot would
// each see zero conflicts. Locking the parent Locations row (which always
// exists) forces the second transaction to wait for the first to commit or
// roll back before it can even run its own overlap check.
func (r *LocationRepository) LockByID(id uint) (*models.Locations, error) {
	var location models.Locations
	err := r.db.
		Clauses(clause.Locking{Strength: "UPDATE"}).
		Preload("PricingTiers.RequesterType").
		Preload("PricingTiers.RateType").
		First(&location, id).Error
	return &location, err
}

func (r *LocationRepository) Create(location *models.Locations) error {
	return r.db.Create(location).Error
}

// Update บันทึกเฉพาะคอลัมน์ของ locations เท่านั้น
// ต้อง Omit associations ไว้ ไม่งั้น GORM จะเซฟ belongs-to (Building/Type/Status) ที่ถูก Preload มา
// แล้วเขียนทับ FK ด้วย id ของ association ตัวเก่า → การเปลี่ยน building_id จะเงียบหาย
func (r *LocationRepository) Update(location *models.Locations) error {
	return r.db.Omit(clause.Associations).Save(location).Error
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

// FindUnavailabilitiesByLocationsAndDates is the batch counterpart of
// FindUnavailabilities, for checking many locations across many dates in one
// query (see LocationService.CheckAvailability).
func (r *LocationRepository) FindUnavailabilitiesByLocationsAndDates(locationIDs []uint, dates []string) ([]models.LocationUnavailabilities, error) {
	var items []models.LocationUnavailabilities
	err := r.db.Where("location_id IN (?) AND date IN (?)", locationIDs, dates).Find(&items).Error
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

// UpdateAddon — เหตุผลเดียวกับ Update: FindAddonByID preload ChargeType มา
// ถ้าไม่ Omit การเปลี่ยน charge_type_id จะถูกเขียนทับกลับเป็นค่าเดิม
func (r *LocationRepository) UpdateAddon(addon *models.LocationAddons) error {
	return r.db.Omit(clause.Associations).Save(addon).Error
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
	err := r.db.
		Preload("HallPricings.HallUsagePurpose").
		Order("name asc").
		Find(&buildings).Error
	return buildings, err
}

// FindBuildingByID โหลดอาคารเดียวพร้อมราคาโถง (ใช้คืนค่าหลังอัปเดตราคา)
func (r *LocationRepository) FindBuildingByID(id uint) (*models.Buildings, error) {
	var building models.Buildings
	err := r.db.
		Preload("HallPricings.HallUsagePurpose").
		First(&building, id).Error
	if err != nil {
		return nil, err
	}
	return &building, nil
}

// FindActiveHallUsagePurposes คืน master data วัตถุประสงค์ที่เปิดใช้งาน เรียงตาม sort_order
func (r *LocationRepository) FindActiveHallUsagePurposes() ([]models.HallUsagePurposes, error) {
	var purposes []models.HallUsagePurposes
	err := r.db.Where("is_active = ?", true).Order("sort_order asc").Find(&purposes).Error
	return purposes, err
}

// FindAllHallUsagePurposes คืนวัตถุประสงค์ทั้งหมด (รวมที่ปิดใช้งาน) สำหรับหน้าจัดการ
func (r *LocationRepository) FindAllHallUsagePurposes() ([]models.HallUsagePurposes, error) {
	var purposes []models.HallUsagePurposes
	err := r.db.Order("sort_order asc").Find(&purposes).Error
	return purposes, err
}

// FindHallUsagePurposeByID โหลดวัตถุประสงค์เดียว
func (r *LocationRepository) FindHallUsagePurposeByID(id uint) (*models.HallUsagePurposes, error) {
	var p models.HallUsagePurposes
	if err := r.db.First(&p, id).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

// HallUsagePurposeNameExists ตรวจว่ามีชื่อวัตถุประสงค์นี้อยู่แล้วหรือไม่ (ยกเว้น id ที่กำหนด — ใช้ตอน update)
func (r *LocationRepository) HallUsagePurposeNameExists(name string, exceptID uint) (bool, error) {
	var count int64
	q := r.db.Model(&models.HallUsagePurposes{}).Where("name = ?", name)
	if exceptID != 0 {
		q = q.Where("id <> ?", exceptID)
	}
	err := q.Count(&count).Error
	return count > 0, err
}

// MaxHallPurposeSortOrder คืนค่า sort_order สูงสุดปัจจุบัน (0 ถ้ายังไม่มี) ใช้ต่อท้ายอัตโนมัติ
func (r *LocationRepository) MaxHallPurposeSortOrder() (int, error) {
	var result struct{ Max int }
	err := r.db.Model(&models.HallUsagePurposes{}).
		Select("COALESCE(MAX(sort_order), 0) AS max").
		Scan(&result).Error
	return result.Max, err
}

// CreateHallUsagePurpose บันทึกวัตถุประสงค์ใหม่
func (r *LocationRepository) CreateHallUsagePurpose(p *models.HallUsagePurposes) error {
	return r.db.Create(p).Error
}

// UpdateHallUsagePurpose บันทึกการแก้ไขวัตถุประสงค์
func (r *LocationRepository) UpdateHallUsagePurpose(p *models.HallUsagePurposes) error {
	return r.db.Save(p).Error
}

// UpsertBuildingHallPricing สร้างหรืออัปเดตราคาโถง 1 แถว (อ้าง unique building_id + hall_usage_purpose_id)
func (r *LocationRepository) UpsertBuildingHallPricing(p *models.BuildingHallPricings) error {
	var existing models.BuildingHallPricings
	err := r.db.
		Where("building_id = ? AND hall_usage_purpose_id = ?", p.BuildingID, p.HallUsagePurposeID).
		First(&existing).Error
	if err == gorm.ErrRecordNotFound {
		return r.db.Create(p).Error
	}
	if err != nil {
		return err
	}
	existing.Price = p.Price
	existing.IsActive = p.IsActive
	return r.db.Save(&existing).Error
}

// FindLocationHallPricings โหลดราคาเฉพาะโถง (ทำเลทอง) ของโถงหนึ่ง ทุกวัตถุประสงค์
func (r *LocationRepository) FindLocationHallPricings(locationID uint) ([]models.LocationHallPricings, error) {
	var pricings []models.LocationHallPricings
	err := r.db.Where("location_id = ?", locationID).Find(&pricings).Error
	return pricings, err
}

// UpsertLocationHallPricing สร้างหรืออัปเดตราคาเฉพาะโถง 1 แถว (อ้าง unique location_id + hall_usage_purpose_id)
func (r *LocationRepository) UpsertLocationHallPricing(p *models.LocationHallPricings) error {
	var existing models.LocationHallPricings
	err := r.db.
		Where("location_id = ? AND hall_usage_purpose_id = ?", p.LocationID, p.HallUsagePurposeID).
		First(&existing).Error
	if err == gorm.ErrRecordNotFound {
		return r.db.Create(p).Error
	}
	if err != nil {
		return err
	}
	existing.Price = p.Price
	return r.db.Save(&existing).Error
}

// DeleteLocationHallPricing ล้างราคาเฉพาะโถงของวัตถุประสงค์หนึ่ง → กลับไปใช้ราคาอาคาร
// ใช้ Unscoped: เป็นตารางตั้งค่า ไม่ต้องเก็บประวัติ (ราคาที่ใช้จริงถูก snapshot ไว้ที่ BookingPurposes แล้ว)
func (r *LocationRepository) DeleteLocationHallPricing(locationID, purposeID uint) error {
	return r.db.Unscoped().
		Where("location_id = ? AND hall_usage_purpose_id = ?", locationID, purposeID).
		Delete(&models.LocationHallPricings{}).Error
}

