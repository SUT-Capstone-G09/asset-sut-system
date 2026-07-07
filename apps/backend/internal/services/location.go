package services

import (
	"context"
	"errors"
	"strings"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
)

type LocationService struct {
	locationRepo *repositories.LocationRepository
	timeslotRepo *repositories.TimeslotRepository
	staffRepo    *repositories.StaffRepository
	storage      *StorageService
}

func NewLocationService(locationRepo *repositories.LocationRepository, timeslotRepo *repositories.TimeslotRepository, staffRepo *repositories.StaffRepository, storage *StorageService) *LocationService {
	return &LocationService{locationRepo: locationRepo, timeslotRepo: timeslotRepo, staffRepo: staffRepo, storage: storage}
}

func (s *LocationService) GetTypes() ([]models.LocationTypes, error) {
	return s.locationRepo.FindAllTypes()
}

func (s *LocationService) GetBuildings() ([]dto.BuildingResponse, error) {
	buildings, err := s.locationRepo.FindAllBuildings()
	if err != nil {
		return nil, err
	}
	var res []dto.BuildingResponse
	for _, b := range buildings {
		res = append(res, dto.BuildingResponse{
			ID:        b.ID,
			Name:      b.Name,
			Code:      b.Code,
			CreatedAt: b.CreatedAt,
			UpdatedAt: b.UpdatedAt,
		})
	}
	return res, nil
}

func (s *LocationService) GetAll(role string, userID uint) ([]dto.LocationResponse, error) {
	var locations []models.Locations
	var err error
	if role == "staff" && userID > 0 {
		locations, err = s.locationRepo.FindByStaffID(userID)
	} else {
		locations, err = s.locationRepo.FindAll()
	}
	if err != nil {
		return nil, err
	}
	var result []dto.LocationResponse
	for _, l := range locations {
		result = append(result, s.toLocationResponse(l))
	}
	return result, nil
}

func (s *LocationService) GetByID(id uint, role string, userID uint) (*dto.LocationResponse, error) {
	if role == "staff" && userID > 0 {
		assigned, err := s.locationRepo.IsStaffAssigned(userID, id)
		if err != nil {
			return nil, err
		}
		if !assigned {
			return nil, errors.New("forbidden")
		}
	}
	location, err := s.locationRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	res := s.toLocationResponse(*location)
	return &res, nil
}

func (s *LocationService) Create(req dto.CreateLocationRequest, role string, userID uint) (*dto.LocationResponse, error) {
	location := &models.Locations{
		ParentID:    req.ParentID,
		TypeID:      req.TypeID,
		Name:        req.Name,
		BuildingID:  req.BuildingID,
		ImageURL:    req.ImageURL,
		RoomNumber:  req.RoomNumber,
		FloorNumber: req.FloorNumber,
		Capacity:    req.Capacity,
		StatusID:    req.StatusID,
	}
	if err := s.locationRepo.Create(location); err != nil {
		return nil, err
	}
	// Auto-assign to staff who created it
	if role == "staff" && userID > 0 {
		sl := &models.StaffLocations{UserID: userID, LocationID: location.ID}
		if err := s.locationRepo.AssignStaff(sl); err != nil {
			return nil, err
		}
	}
	return s.GetByID(location.ID, "admin", 0)
}

func (s *LocationService) Update(id uint, req dto.UpdateLocationRequest, role string, userID uint) (*dto.LocationResponse, error) {
	if role == "staff" && userID > 0 {
		assigned, err := s.locationRepo.IsStaffAssigned(userID, id)
		if err != nil {
			return nil, err
		}
		if !assigned {
			return nil, errors.New("forbidden")
		}
	}
	location, err := s.locationRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if req.ParentID != nil {
		location.ParentID = req.ParentID
	}
	if req.TypeID != nil {
		location.TypeID = *req.TypeID
	}
	if req.Name != "" {
		location.Name = req.Name
	}
	if req.BuildingID != nil {
		location.BuildingID = req.BuildingID
	}
	if req.ImageURL != nil {
		location.ImageURL = req.ImageURL
	}
	if req.RoomNumber != nil {
		location.RoomNumber = req.RoomNumber
	}
	if req.FloorNumber != nil {
		location.FloorNumber = req.FloorNumber
	}
	if req.Capacity != nil {
		location.Capacity = *req.Capacity
	}
	if req.StatusID != nil {
		location.StatusID = *req.StatusID
	}
	if err := s.locationRepo.Update(location); err != nil {
		return nil, err
	}
	return s.GetByID(location.ID, "admin", 0)
}

func (s *LocationService) Delete(id uint) error {
	return s.locationRepo.Delete(id)
}

// ── Staff Location Management ─────────────────────────────────────────────────

func (s *LocationService) GetLocationStaff(locationID uint) ([]dto.StaffLocationResponse, error) {
	items, err := s.locationRepo.FindStaffByLocationID(locationID)
	if err != nil {
		return nil, err
	}
	var result []dto.StaffLocationResponse
	for _, sl := range items {
		res := dto.StaffLocationResponse{
			UserID:     sl.UserID,
			LocationID: sl.LocationID,
		}
		if sl.User != nil {
			res.Email = sl.User.Email
			if sl.User.Profiles != nil {
				res.FirstName = sl.User.Profiles.FirstName
				res.LastName = sl.User.Profiles.LastName
			}
		}
		result = append(result, res)
	}
	return result, nil
}

func (s *LocationService) AssignStaff(locationID, staffUserID uint) error {
	sl := &models.StaffLocations{UserID: staffUserID, LocationID: locationID}
	return s.locationRepo.AssignStaff(sl)
}

func (s *LocationService) UnassignStaff(locationID, staffUserID uint) error {
	return s.locationRepo.UnassignStaff(staffUserID, locationID)
}

func (s *LocationService) GetStaffLocations(staffID uint) ([]dto.LocationResponse, error) {
	staff, err := s.staffRepo.FindByID(staffID)
	if err != nil {
		return nil, err
	}
	locations, err := s.locationRepo.FindByStaffID(staff.UserID)
	if err != nil {
		return nil, err
	}
	var result []dto.LocationResponse
	for _, l := range locations {
		result = append(result, s.toLocationResponse(l))
	}
	return result, nil
}

func (s *LocationService) SetStaffLocations(staffID uint, locationIDs []uint) error {
	staff, err := s.staffRepo.FindByID(staffID)
	if err != nil {
		return err
	}
	return s.locationRepo.SetStaffLocations(staff.UserID, locationIDs)
}

// ── Unavailabilities ─────────────────────────────────────────────────────────

func (s *LocationService) GetUnavailabilities(locationID uint) ([]dto.UnavailabilityResponse, error) {
	items, err := s.locationRepo.FindUnavailabilities(locationID)
	if err != nil {
		return nil, err
	}
	var result []dto.UnavailabilityResponse
	for _, u := range items {
		result = append(result, dto.UnavailabilityResponse{
			ID:         u.ID,
			LocationID: u.LocationID,
			Date:       u.Date,
			StartTime:  u.StartTime,
			EndTime:    u.EndTime,
			Reason:     u.Reason,
		})
	}
	return result, nil
}

func (s *LocationService) CreateUnavailability(locationID uint, req dto.CreateUnavailabilityRequest) (*dto.UnavailabilityResponse, error) {
	u := &models.LocationUnavailabilities{
		LocationID: locationID,
		Date:       req.Date,
		StartTime:  req.StartTime,
		EndTime:    req.EndTime,
		Reason:     req.Reason,
	}
	if err := s.locationRepo.CreateUnavailability(u); err != nil {
		return nil, err
	}
	res := dto.UnavailabilityResponse{
		ID:         u.ID,
		LocationID: u.LocationID,
		Date:       u.Date,
		StartTime:  u.StartTime,
		EndTime:    u.EndTime,
		Reason:     u.Reason,
	}
	return &res, nil
}

func (s *LocationService) DeleteUnavailability(id uint) error {
	return s.locationRepo.DeleteUnavailability(id)
}

// ── Monthly Availability ─────────────────────────────────────────────────────

// GetMonthlyAvailability returns a map of date → DayAvailability for the given month.
// Days with no bookings are omitted (caller treats them as "available").
func (s *LocationService) GetMonthlyAvailability(locationID uint, year, month int) (dto.MonthlyAvailabilityResponse, error) {
	slots, err := s.timeslotRepo.FindBookedSlotsByMonth(locationID, year, month)
	if err != nil {
		return nil, err
	}

	type dayData struct {
		hours  float64
		ranges [][2]string
	}
	days := make(map[string]*dayData)

	for _, slot := range slots {
		dateStr := slot.Date.Format("2006-01-02")
		if days[dateStr] == nil {
			days[dateStr] = &dayData{}
		}
		hours := slot.EndTime.Sub(slot.StartTime).Hours()
		days[dateStr].hours += hours
		days[dateStr].ranges = append(days[dateStr].ranges, [2]string{
			slot.StartTime.Format("15:04"),
			slot.EndTime.Format("15:04"),
		})
	}

	const fullThreshold = 8.0
	result := make(dto.MonthlyAvailabilityResponse)
	for dateStr, d := range days {
		status := "partial"
		if d.hours >= fullThreshold {
			status = "full"
		}
		result[dateStr] = dto.DayAvailability{
			Status:       status,
			BookedHours:  d.hours,
			BookedRanges: d.ranges,
		}
	}
	return result, nil
}

// ── Equipments ───────────────────────────────────────────────────────────────

func (s *LocationService) AddEquipment(locationID uint, req dto.AddEquipmentRequest) error {
	le := &models.LocationEquipments{
		LocationID:  locationID,
		EquipmentID: req.EquipmentID,
		Quantity:    req.Quantity,
	}
	return s.locationRepo.AddEquipment(le)
}

func (s *LocationService) RemoveEquipment(locationID, equipmentID uint) error {
	return s.locationRepo.RemoveEquipment(locationID, equipmentID)
}

// ── Addons ───────────────────────────────────────────────────────────────────

func (s *LocationService) CreateAddon(locationID *uint, req dto.CreateAddonRequest) (*dto.AddonResponse, error) {
	addon := &models.LocationAddons{
		LocationID:   locationID,
		Name:         req.Name,
		Description:  req.Description,
		DefaultPrice: req.DefaultPrice,
		ChargeTypeID: req.ChargeTypeID,
		Quantity:     req.Quantity,
		IsActive:     true,
	}
	if err := s.locationRepo.CreateAddon(addon); err != nil {
		return nil, err
	}
	created, err := s.locationRepo.FindAddonByID(addon.ID)
	if err != nil {
		return nil, err
	}
	res := toAddonResponse(*created)
	return &res, nil
}

func (s *LocationService) UpdateAddon(id uint, req dto.CreateAddonRequest) (*dto.AddonResponse, error) {
	addon, err := s.locationRepo.FindAddonByID(id)
	if err != nil {
		return nil, err
	}
	if req.Name != "" {
		addon.Name = req.Name
	}
	addon.Description = req.Description
	if req.DefaultPrice >= 0 {
		addon.DefaultPrice = req.DefaultPrice
	}
	if req.ChargeTypeID != 0 {
		addon.ChargeTypeID = req.ChargeTypeID
	}
	if req.Quantity > 0 {
		addon.Quantity = req.Quantity
	}
	if err := s.locationRepo.UpdateAddon(addon); err != nil {
		return nil, err
	}
	updated, err := s.locationRepo.FindAddonByID(addon.ID)
	if err != nil {
		return nil, err
	}
	res := toAddonResponse(*updated)
	return &res, nil
}

func (s *LocationService) DeleteAddon(id uint) error {
	return s.locationRepo.DeleteAddon(id)
}

func (s *LocationService) GetAddonByID(id uint) (*dto.AddonResponse, error) {
	item, err := s.locationRepo.FindAddonByID(id)
	if err != nil {
		return nil, err
	}
	res := toAddonResponse(*item)
	return &res, nil
}


// ── Pricing Tiers ─────────────────────────────────────────────────────────────

func (s *LocationService) CreatePricingTier(locationID uint, req dto.CreatePricingTierRequest) (*dto.PricingTierResponse, error) {
	tier := &models.LocationPricingTiers{
		LocationID:      locationID,
		RequesterTypeID: req.RequesterTypeID,
		RateTypeID:      req.RateTypeID,
		Price:           req.Price,
	}
	if err := s.locationRepo.CreatePricingTier(tier); err != nil {
		return nil, err
	}
	res := dto.PricingTierResponse{
		ID:              tier.ID,
		LocationID:      tier.LocationID,
		RequesterTypeID: tier.RequesterTypeID,
		RateTypeID:      tier.RateTypeID,
		Price:           tier.Price,
	}
	return &res, nil
}

func (s *LocationService) DeletePricingTier(id uint) error {
	return s.locationRepo.DeletePricingTier(id)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// resolveImageURL แปลง object_key เป็น presigned URL ใหม่
// ถ้าค่าที่เก็บเป็น URL อยู่แล้ว (http/https) จะส่งคืนตามเดิม
func (s *LocationService) resolveImageURL(objectKeyOrURL *string) *string {
	if objectKeyOrURL == nil || *objectKeyOrURL == "" {
		return objectKeyOrURL
	}
	if strings.HasPrefix(*objectKeyOrURL, "http://") || strings.HasPrefix(*objectKeyOrURL, "https://") {
		return objectKeyOrURL // เป็น URL เดิม (ข้อมูลเก่า) — ส่งคืนตามเดิม
	}
	// เป็น object_key → generate presigned URL ใหม่
	url, err := s.storage.PresignedURL(context.Background(), *objectKeyOrURL)
	if err != nil {
		return objectKeyOrURL // fallback
	}
	return &url
}

func (s *LocationService) toLocationResponse(l models.Locations) dto.LocationResponse {
	res := dto.LocationResponse{
		ID:          l.ID,
		ParentID:    l.ParentID,
		TypeID:      l.TypeID,
		Name:        l.Name,
		BuildingID:  l.BuildingID,
		ImageURL:    s.resolveImageURL(l.ImageURL),
		RoomNumber:  l.RoomNumber,
		FloorNumber: l.FloorNumber,
		Capacity:    l.Capacity,
		StatusID:    l.StatusID,
	}
	if l.Type != nil {
		res.Type = l.Type.Type
	}
	if l.Building != nil {
		name := l.Building.Name
		res.Building = &name
	}
	if l.Status != nil {
		res.Status = l.Status.Status
	}
	for _, t := range l.PricingTiers {
		tier := dto.PricingTierResponse{
			ID:              t.ID,
			LocationID:      t.LocationID,
			RequesterTypeID: t.RequesterTypeID,
			RateTypeID:      t.RateTypeID,
			Price:           t.Price,
		}
		if t.RequesterType != nil {
			tier.RequesterType = t.RequesterType.Type
		}
		if t.RateType != nil {
			tier.RateType = t.RateType.Type
		}
		res.PricingTiers = append(res.PricingTiers, tier)
	}
	for _, e := range l.Equipments {
		eq := dto.EquipmentResponse{
			ID:          e.ID,
			EquipmentID: e.EquipmentID,
			Quantity:    e.Quantity,
		}
		if e.Equipment != nil {
			eq.Name = e.Equipment.Name
		}
		res.Equipments = append(res.Equipments, eq)
	}
	return res
}

func toAddonResponse(a models.LocationAddons) dto.AddonResponse {
	res := dto.AddonResponse{
		ID:           a.ID,
		LocationID:   a.LocationID,
		Name:         a.Name,
		Description:  a.Description,
		DefaultPrice: a.DefaultPrice,
		ChargeTypeID: a.ChargeTypeID,
		Quantity:     a.Quantity,
		IsActive:     a.IsActive,
	}
	if a.ChargeType != nil {
		res.ChargeType = a.ChargeType.Type
	}
	return res
}

// ── Hall Floor Plan ──────────────────────────────────────────────────────────

func (s *LocationService) GetFloorPlan(locationID uint) (*dto.HallFloorPlanResponse, error) {
	fp, err := s.locationRepo.FindFloorPlanByLocationID(locationID)
	if err != nil {
		return nil, err
	}
	if fp == nil {
		return nil, nil
	}
	res := s.toFloorPlanResponse(fp)
	return &res, nil
}

func (s *LocationService) UpsertFloorPlan(locationID uint, req dto.UpsertHallFloorPlanRequest) (*dto.HallFloorPlanResponse, error) {
	existing, err := s.locationRepo.FindFloorPlanByLocationID(locationID)
	if err != nil {
		return nil, err
	}

	// object_key ของรูป: default คงของเดิม; อัปเดตเฉพาะเมื่อส่ง key ใหม่ (ไม่ใช่ presigned http url)
	var imageKey *string
	if existing != nil {
		imageKey = existing.TopViewImage
	}
	if req.TopViewImage != nil && *req.TopViewImage != "" &&
		!strings.HasPrefix(*req.TopViewImage, "http://") && !strings.HasPrefix(*req.TopViewImage, "https://") {
		imageKey = req.TopViewImage
	}

	blocked := req.BlockedCells
	if blocked == nil {
		blocked = [][]int{}
	}

	fp := &models.HallFloorPlans{
		LocationID:    locationID,
		TopViewImage:  imageKey,
		ImageNaturalW: req.ImageNaturalW,
		ImageNaturalH: req.ImageNaturalH,
		GridCols:      req.GridCols,
		GridRows:      req.GridRows,
		CellSizeM:     req.CellSizeM,
		RealWidthM:    req.RealWidthM,
		RealLengthM:   req.RealLengthM,
		OverlayX:      req.Overlay.X,
		OverlayY:      req.Overlay.Y,
		OverlayW:      req.Overlay.W,
		OverlayH:      req.Overlay.H,
		PxPerMX:       req.PxPerMX,
		PxPerMY:       req.PxPerMY,
		BlockedCells:  blocked,
	}
	if existing != nil {
		fp.ID = existing.ID
		fp.CreatedAt = existing.CreatedAt
	}
	if err := s.locationRepo.SaveFloorPlan(fp); err != nil {
		return nil, err
	}
	res := s.toFloorPlanResponse(fp)
	return &res, nil
}

func (s *LocationService) GetFloorPlanLocationIDs() ([]uint, error) {
	return s.locationRepo.FindFloorPlanLocationIDs()
}

func (s *LocationService) toFloorPlanResponse(fp *models.HallFloorPlans) dto.HallFloorPlanResponse {
	blocked := fp.BlockedCells
	if blocked == nil {
		blocked = [][]int{}
	}
	return dto.HallFloorPlanResponse{
		LocationID:      fp.LocationID,
		TopViewImageURL: s.resolveImageURL(fp.TopViewImage),
		ImageNaturalW:   fp.ImageNaturalW,
		ImageNaturalH:   fp.ImageNaturalH,
		GridCols:        fp.GridCols,
		GridRows:        fp.GridRows,
		CellSizeM:       fp.CellSizeM,
		RealWidthM:      fp.RealWidthM,
		RealLengthM:     fp.RealLengthM,
		Overlay:         dto.OverlayDTO{X: fp.OverlayX, Y: fp.OverlayY, W: fp.OverlayW, H: fp.OverlayH},
		PxPerMX:         fp.PxPerMX,
		PxPerMY:         fp.PxPerMY,
		BlockedCells:    blocked,
	}
}
// ── Global Addon Services ───────────────────────────────────────────────────

func (s *LocationService) GetGlobalAddons() ([]dto.AddonResponse, error) {
	items, err := s.locationRepo.FindAllGlobalAddons()
	if err != nil {
		return nil, err
	}
	var result []dto.AddonResponse
	for _, item := range items {
		result = append(result, toAddonResponse(item))
	}
	return result, nil
}




