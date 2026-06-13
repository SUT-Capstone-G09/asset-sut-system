package services

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
)

type LocationService struct {
	locationRepo  *repositories.LocationRepository
	timeslotRepo  *repositories.TimeslotRepository
}

func NewLocationService(locationRepo *repositories.LocationRepository, timeslotRepo *repositories.TimeslotRepository) *LocationService {
	return &LocationService{locationRepo: locationRepo, timeslotRepo: timeslotRepo}
}

func (s *LocationService) GetTypes() ([]models.LocationTypes, error) {
	return s.locationRepo.FindAllTypes()
}

func (s *LocationService) GetAll() ([]dto.LocationResponse, error) {
	locations, err := s.locationRepo.FindAll()
	if err != nil {
		return nil, err
	}
	var result []dto.LocationResponse
	for _, l := range locations {
		result = append(result, toLocationResponse(l))
	}
	return result, nil
}

func (s *LocationService) GetByID(id uint) (*dto.LocationResponse, error) {
	location, err := s.locationRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	res := toLocationResponse(*location)
	return &res, nil
}

func (s *LocationService) Create(req dto.CreateLocationRequest) (*dto.LocationResponse, error) {
	location := &models.Locations{
		ParentID:    req.ParentID,
		TypeID:      req.TypeID,
		Name:        req.Name,
		Building:    req.Building,
		ImageURL:    req.ImageURL,
		RoomNumber:  req.RoomNumber,
		FloorNumber: req.FloorNumber,
		Capacity:    req.Capacity,
		StatusID:    req.StatusID,
	}
	if err := s.locationRepo.Create(location); err != nil {
		return nil, err
	}
	return s.GetByID(location.ID)
}

func (s *LocationService) Update(id uint, req dto.UpdateLocationRequest) (*dto.LocationResponse, error) {
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
	if req.Building != nil {
		location.Building = req.Building
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
	return s.GetByID(location.ID)
}

func (s *LocationService) Delete(id uint) error {
	return s.locationRepo.Delete(id)
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

func toLocationResponse(l models.Locations) dto.LocationResponse {
	res := dto.LocationResponse{
		ID:          l.ID,
		ParentID:    l.ParentID,
		TypeID:      l.TypeID,
		Name:        l.Name,
		Building:    l.Building,
		ImageURL:    l.ImageURL,
		RoomNumber:  l.RoomNumber,
		FloorNumber: l.FloorNumber,
		Capacity:    l.Capacity,
		StatusID:    l.StatusID,
	}
	if l.Type != nil {
		res.Type = l.Type.Type
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




