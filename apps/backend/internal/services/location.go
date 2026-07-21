package services

import (
	"context"
	"errors"
	"fmt"
	"mime/multipart"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/docpath"
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

func (s *LocationService) GetRateTypes() ([]models.RateTypes, error) {
	return s.locationRepo.FindAllRateTypes()
}

func (s *LocationService) GetBuildings() ([]dto.BuildingResponse, error) {
	buildings, err := s.locationRepo.FindAllBuildings()
	if err != nil {
		return nil, err
	}
	var res []dto.BuildingResponse
	for _, b := range buildings {
		res = append(res, toBuildingResponse(b))
	}
	return res, nil
}

// toBuildingResponse map อาคาร + ราคาโถง (ราย วัตถุประสงค์) เป็น response
func toBuildingResponse(b models.Buildings) dto.BuildingResponse {
	pricings := make([]dto.BuildingHallPricingResponse, 0, len(b.HallPricings))
	for _, hp := range b.HallPricings {
		pr := dto.BuildingHallPricingResponse{
			HallUsagePurposeID: hp.HallUsagePurposeID,
			Price:              hp.Price,
			IsActive:           hp.IsActive,
		}
		if hp.HallUsagePurpose != nil {
			pr.PurposeName = hp.HallUsagePurpose.Name
			pr.PricingModel = hp.HallUsagePurpose.PricingModel
		}
		pricings = append(pricings, pr)
	}
	return dto.BuildingResponse{
		ID:           b.ID,
		Name:         b.Name,
		HallPricings: pricings,
		CreatedAt:    b.CreatedAt,
		UpdatedAt:    b.UpdatedAt,
	}
}

func toHallPurposeResponse(p models.HallUsagePurposes) dto.HallUsagePurposeResponse {
	return dto.HallUsagePurposeResponse{
		ID:           p.ID,
		Name:         p.Name,
		Description:  p.Description,
		PricingModel: p.PricingModel,
		DefaultPrice: p.DefaultPrice,
		IsActive:     p.IsActive,
		SortOrder:    p.SortOrder,
	}
}

// GetHallUsagePurposes คืน master data วัตถุประสงค์การขอใช้พื้นที่โถง
// includeInactive=false → เฉพาะที่เปิดใช้งาน (ใช้ในหน้าตั้งราคา/หน้าจอง) ; true → ทั้งหมด (หน้าจัดการ)
func (s *LocationService) GetHallUsagePurposes(includeInactive bool) ([]dto.HallUsagePurposeResponse, error) {
	var purposes []models.HallUsagePurposes
	var err error
	if includeInactive {
		purposes, err = s.locationRepo.FindAllHallUsagePurposes()
	} else {
		purposes, err = s.locationRepo.FindActiveHallUsagePurposes()
	}
	if err != nil {
		return nil, err
	}
	res := make([]dto.HallUsagePurposeResponse, 0, len(purposes))
	for _, p := range purposes {
		res = append(res, toHallPurposeResponse(p))
	}
	return res, nil
}

// CreateHallUsagePurpose เพิ่มวัตถุประสงค์ใหม่ (pricing_model จำกัด 2 แบบเดิม เพื่อไม่กระทบ logic การคิดเงิน)
func (s *LocationService) CreateHallUsagePurpose(req dto.CreateHallUsagePurposeRequest) (*dto.HallUsagePurposeResponse, error) {
	if req.PricingModel != models.HallPricingPerSqm && req.PricingModel != models.HallPricingPerTypePerDay {
		return nil, errors.New("รูปแบบการคิดราคาไม่ถูกต้อง")
	}
	exists, err := s.locationRepo.HallUsagePurposeNameExists(req.Name, 0)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("มีชื่อวัตถุประสงค์นี้อยู่แล้ว")
	}

	sortOrder := 0
	if req.SortOrder != nil {
		sortOrder = *req.SortOrder
	} else {
		max, merr := s.locationRepo.MaxHallPurposeSortOrder()
		if merr != nil {
			return nil, merr
		}
		sortOrder = max + 1
	}

	p := &models.HallUsagePurposes{
		Name:         req.Name,
		Description:  req.Description,
		PricingModel: req.PricingModel,
		DefaultPrice: req.DefaultPrice,
		IsActive:     true,
		SortOrder:    sortOrder,
	}
	if err := s.locationRepo.CreateHallUsagePurpose(p); err != nil {
		return nil, err
	}
	res := toHallPurposeResponse(*p)
	return &res, nil
}

// UpdateHallUsagePurpose แก้วัตถุประสงค์ (แก้ pricing_model ไม่ได้)
func (s *LocationService) UpdateHallUsagePurpose(id uint, req dto.UpdateHallUsagePurposeRequest) (*dto.HallUsagePurposeResponse, error) {
	p, err := s.locationRepo.FindHallUsagePurposeByID(id)
	if err != nil {
		return nil, errors.New("ไม่พบวัตถุประสงค์")
	}
	if req.Name != nil {
		exists, eerr := s.locationRepo.HallUsagePurposeNameExists(*req.Name, id)
		if eerr != nil {
			return nil, eerr
		}
		if exists {
			return nil, errors.New("มีชื่อวัตถุประสงค์นี้อยู่แล้ว")
		}
		p.Name = *req.Name
	}
	if req.Description != nil {
		p.Description = *req.Description
	}
	if req.DefaultPrice != nil {
		p.DefaultPrice = *req.DefaultPrice
	}
	if req.IsActive != nil {
		p.IsActive = *req.IsActive
	}
	if req.SortOrder != nil {
		p.SortOrder = *req.SortOrder
	}
	if err := s.locationRepo.UpdateHallUsagePurpose(p); err != nil {
		return nil, err
	}
	res := toHallPurposeResponse(*p)
	return &res, nil
}

// UpdateBuildingHallPricings ตั้ง/แก้ราคาโถงของอาคารหนึ่ง (bulk upsert รายวัตถุประสงค์) แล้วคืนอาคารพร้อมราคาล่าสุด
func (s *LocationService) UpdateBuildingHallPricings(buildingID uint, req dto.UpdateBuildingHallPricingsRequest) (*dto.BuildingResponse, error) {
	if _, err := s.locationRepo.FindBuildingByID(buildingID); err != nil {
		return nil, errors.New("ไม่พบอาคาร")
	}

	// ตรวจว่า purpose id ที่ส่งมามีจริง (กัน FK พังเงียบ)
	purposes, err := s.locationRepo.FindActiveHallUsagePurposes()
	if err != nil {
		return nil, err
	}
	valid := make(map[uint]bool, len(purposes))
	for _, p := range purposes {
		valid[p.ID] = true
	}

	for _, in := range req.Pricings {
		if !valid[in.HallUsagePurposeID] {
			return nil, fmt.Errorf("ไม่พบวัตถุประสงค์การขอใช้พื้นที่ (id=%d)", in.HallUsagePurposeID)
		}
		if err := s.locationRepo.UpsertBuildingHallPricing(&models.BuildingHallPricings{
			BuildingID:         buildingID,
			HallUsagePurposeID: in.HallUsagePurposeID,
			Price:              in.Price,
			IsActive:           in.IsActive,
		}); err != nil {
			return nil, err
		}
	}

	building, err := s.locationRepo.FindBuildingByID(buildingID)
	if err != nil {
		return nil, err
	}
	res := toBuildingResponse(*building)
	return &res, nil
}

// hallPricingFloor = ขั้นต่ำ + สถานะเปิดใช้งานของวัตถุประสงค์หนึ่ง ตามที่อาคารตั้งไว้
type hallPricingFloor struct {
	Floor    int
	IsActive bool
}

// hallPricingFloors คืนวัตถุประสงค์ที่เปิดใช้งานทั้งหมด + ราคาขั้นต่ำของอาคารนั้นรายวัตถุประสงค์
// fallback เป็น DefaultPrice เมื่ออาคารยังไม่ตั้งราคา — ให้ตรงกับ BookingService.priceHallPurposes
func (s *LocationService) hallPricingFloors(buildingID *uint) ([]models.HallUsagePurposes, map[uint]hallPricingFloor, error) {
	purposes, err := s.locationRepo.FindActiveHallUsagePurposes()
	if err != nil {
		return nil, nil, err
	}
	floors := make(map[uint]hallPricingFloor, len(purposes))
	for _, p := range purposes {
		floors[p.ID] = hallPricingFloor{Floor: p.DefaultPrice, IsActive: true}
	}
	if buildingID != nil {
		building, berr := s.locationRepo.FindBuildingByID(*buildingID)
		if berr != nil {
			return nil, nil, berr
		}
		for _, hp := range building.HallPricings {
			floors[hp.HallUsagePurposeID] = hallPricingFloor{Floor: hp.Price, IsActive: hp.IsActive}
		}
	}
	return purposes, floors, nil
}

// GetLocationHallPricings คืนราคาของโถงหนึ่งครบทุกวัตถุประสงค์ — ราคาอาคาร (ขั้นต่ำ), ราคาเฉพาะโถง, และราคาที่ใช้จริง
func (s *LocationService) GetLocationHallPricings(locationID uint) ([]dto.LocationHallPricingResponse, error) {
	location, err := s.locationRepo.FindByID(locationID)
	if err != nil {
		return nil, errors.New("ไม่พบสถานที่")
	}
	purposes, floors, err := s.hallPricingFloors(location.BuildingID)
	if err != nil {
		return nil, err
	}
	overrides, err := s.locationRepo.FindLocationHallPricings(locationID)
	if err != nil {
		return nil, err
	}
	overrideByPurpose := make(map[uint]int, len(overrides))
	for _, o := range overrides {
		overrideByPurpose[o.HallUsagePurposeID] = o.Price
	}

	res := make([]dto.LocationHallPricingResponse, 0, len(purposes))
	for _, p := range purposes {
		f := floors[p.ID]
		row := dto.LocationHallPricingResponse{
			HallUsagePurposeID: p.ID,
			PurposeName:        p.Name,
			PricingModel:       p.PricingModel,
			BuildingPrice:      f.Floor,
			EffectivePrice:     f.Floor,
			IsActive:           f.IsActive,
		}
		if ov, ok := overrideByPurpose[p.ID]; ok {
			price := ov
			row.OverridePrice = &price
			row.EffectivePrice = resolveHallUnitPrice(f.Floor, &price)
		}
		res = append(res, row)
	}
	return res, nil
}

// UpdateLocationHallPricings ตั้ง/แก้ราคาเฉพาะโถง (ทำเลทอง) แล้วคืนราคาล่าสุดของโถงนั้น
// price = nil → ล้าง override กลับไปใช้ราคาอาคาร ; ตั้งต่ำกว่าราคาอาคารไม่ได้
func (s *LocationService) UpdateLocationHallPricings(locationID uint, req dto.UpdateLocationHallPricingsRequest) ([]dto.LocationHallPricingResponse, error) {
	location, err := s.locationRepo.FindByID(locationID)
	if err != nil {
		return nil, errors.New("ไม่พบสถานที่")
	}
	purposes, floors, err := s.hallPricingFloors(location.BuildingID)
	if err != nil {
		return nil, err
	}
	nameByID := make(map[uint]string, len(purposes))
	for _, p := range purposes {
		nameByID[p.ID] = p.Name
	}

	for _, in := range req.Pricings {
		f, ok := floors[in.HallUsagePurposeID]
		if !ok {
			return nil, fmt.Errorf("ไม่พบวัตถุประสงค์การขอใช้พื้นที่ (id=%d)", in.HallUsagePurposeID)
		}
		if in.Price == nil {
			if derr := s.locationRepo.DeleteLocationHallPricing(locationID, in.HallUsagePurposeID); derr != nil {
				return nil, derr
			}
			continue
		}
		if *in.Price < f.Floor {
			return nil, fmt.Errorf("ราคาของ %q ต้องไม่ต่ำกว่าราคาอาคาร (%d บาท)", nameByID[in.HallUsagePurposeID], f.Floor)
		}
		if uerr := s.locationRepo.UpsertLocationHallPricing(&models.LocationHallPricings{
			LocationID:         locationID,
			HallUsagePurposeID: in.HallUsagePurposeID,
			Price:              *in.Price,
		}); uerr != nil {
			return nil, uerr
		}
	}

	return s.GetLocationHallPricings(locationID)
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
		Description: req.Description,
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
	if req.Description != nil {
		location.Description = req.Description
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
	blocks, err := s.locationRepo.FindUnavailabilities(locationID)
	if err != nil {
		return nil, err
	}

	type dayData struct {
		hours   float64
		booked  [][2]int // booking-only [startMin, endMin) — basis for the "full" decision
		ranges  [][2]string
		blocked bool
	}
	days := make(map[string]*dayData)

	for _, slot := range slots {
		dateStr := slot.Date.Format("2006-01-02")
		if days[dateStr] == nil {
			days[dateStr] = &dayData{}
		}
		hours := slot.EndTime.Sub(slot.StartTime).Hours()
		days[dateStr].hours += hours
		if startMin, endMin := minutesOfDay(slot.StartTime), minutesOfDay(slot.EndTime); endMin > startMin {
			days[dateStr].booked = append(days[dateStr].booked, [2]int{startMin, endMin})
		}
		days[dateStr].ranges = append(days[dateStr].ranges, [2]string{
			slot.StartTime.Format("15:04"),
			slot.EndTime.Format("15:04"),
		})
	}

	// Staff-configured unavailability windows (maintenance, closures, etc.)
	// block the whole day in the calendar, same as a fully-booked day, so the
	// frontend's existing "full" handling hides it without any FE change.
	for _, b := range blocks {
		if int(b.Date.Year()) != year || b.Date.Month() != time.Month(month) {
			continue
		}
		dateStr := b.Date.Format("2006-01-02")
		if days[dateStr] == nil {
			days[dateStr] = &dayData{}
		}
		days[dateStr].blocked = true
		days[dateStr].ranges = append(days[dateStr].ranges, [2]string{
			b.StartTime.Format("15:04"),
			b.EndTime.Format("15:04"),
		})
	}

	result := make(dto.MonthlyAvailabilityResponse)
	for dateStr, d := range days {
		status := "partial"
		if d.blocked || freeMinutesInWindow(d.booked) < minBookableFreeMinutes {
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

// CheckAvailability batches an availability check across many locations and
// dates in one round trip (see dto.AvailabilitySearchQuery) — the room-search
// equivalent of GetMonthlyAvailability, which only ever handles one location
// at a time and would otherwise mean one request per room in a result page.
//
// A location is available only if every requested date passes:
//   - a staff-configured unavailability block on that date always fails it
//   - with an exact [startTime, endTime) window given: no booked timeslot on
//     that date may overlap it
//   - without one: the date must still have at least minBookableFreeMinutes
//     of free time in the bookable window — the same rule GetMonthlyAvailability
//     uses to decide a day is "full", reused here so the two never disagree.
func (s *LocationService) CheckAvailability(locationIDs []uint, dates []string, startTime, endTime string) (dto.AvailabilitySearchResponse, error) {
	slots, err := s.timeslotRepo.FindBookedSlotsByLocationsAndDates(locationIDs, dates)
	if err != nil {
		return nil, err
	}
	blocks, err := s.locationRepo.FindUnavailabilitiesByLocationsAndDates(locationIDs, dates)
	if err != nil {
		return nil, err
	}

	type dayKey struct {
		locationID uint
		date       string
	}
	booked := make(map[dayKey][][2]int)
	for _, slot := range slots {
		k := dayKey{slot.LocationID, slot.Date.Format("2006-01-02")}
		if startMin, endMin := minutesOfDay(slot.StartTime), minutesOfDay(slot.EndTime); endMin > startMin {
			booked[k] = append(booked[k], [2]int{startMin, endMin})
		}
	}
	blocked := make(map[dayKey]bool)
	for _, b := range blocks {
		blocked[dayKey{b.LocationID, b.Date.Format("2006-01-02")}] = true
	}

	hasWindow := startTime != "" && endTime != ""
	var reqStart, reqEnd int
	if hasWindow {
		reqStart, reqEnd = parseClockMinutes(startTime), parseClockMinutes(endTime)
	}

	result := make(dto.AvailabilitySearchResponse, len(locationIDs))
	for _, locID := range locationIDs {
		available := true
		for _, date := range dates {
			k := dayKey{locID, date}
			if blocked[k] {
				available = false
				break
			}
			ranges := booked[k]
			if hasWindow {
				for _, r := range ranges {
					if reqStart < r[1] && reqEnd > r[0] {
						available = false
						break
					}
				}
			} else if freeMinutesInWindow(ranges) < minBookableFreeMinutes {
				available = false
			}
			if !available {
				break
			}
		}
		result[locID] = available
	}
	return result, nil
}

// parseClockMinutes converts "HH:MM" to minutes since midnight. Malformed
// input parses as 0 (start of day) — callers only ever pass values the
// frontend's own fixed time-option <select> produced.
func parseClockMinutes(s string) int {
	h, m := 0, 0
	if parts := strings.SplitN(s, ":", 2); len(parts) == 2 {
		h, _ = strconv.Atoi(parts[0])
		m, _ = strconv.Atoi(parts[1])
	}
	return h*60 + m
}

// minBookableFreeMinutes: a day counts as "full" once less than this much
// genuinely free time is left in the bookable window (fullDayStartMinute..
// fullDayEndMinute, defined in booking.go) — matches the 30-minute step
// every time picker in the app uses, so a smaller leftover gap isn't
// practically bookable.
const minBookableFreeMinutes = 30

// freeMinutesInWindow merges booked [start,end) minute intervals (clipped to
// the bookable window) and returns how many minutes of the window remain
// free. Summing booked *hours* alone is the wrong signal for "full": four
// disjoint 2h meetings total 8h booked but still leave 6h genuinely free, and
// shouldn't lock out the whole day.
func freeMinutesInWindow(booked [][2]int) int {
	type interval struct{ start, end int }
	intervals := make([]interval, 0, len(booked))
	for _, b := range booked {
		start, end := b[0], b[1]
		if start < fullDayStartMinute {
			start = fullDayStartMinute
		}
		if end > fullDayEndMinute {
			end = fullDayEndMinute
		}
		if end > start {
			intervals = append(intervals, interval{start, end})
		}
	}
	sort.Slice(intervals, func(i, j int) bool { return intervals[i].start < intervals[j].start })

	covered, cursor := 0, fullDayStartMinute
	for _, iv := range intervals {
		if iv.start > cursor {
			cursor = iv.start
		}
		if iv.end > cursor {
			covered += iv.end - cursor
			cursor = iv.end
		}
	}
	return (fullDayEndMinute - fullDayStartMinute) - covered
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
		Description: l.Description,
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

// UploadFloorPlanImage อัปโหลดรูปผัง (top-view) ของโถงไปเก็บที่ path มาตรฐาน:
// "รูปภาพสถานที่/{ชื่ออาคาร}/โถงอาคาร/แผนผัง/{ชื่อโถง}{ext}"
// ชื่ออาคาร/ชื่อโถงดึงจาก DB (เชื่อถือได้ ไม่รับจาก client) แล้วคืน object_key + presigned URL
func (s *LocationService) UploadFloorPlanImage(ctx context.Context, locationID uint, fh *multipart.FileHeader, uploadedBy uint) (UploadResult, error) {
	loc, err := s.locationRepo.FindByID(locationID)
	if err != nil {
		return UploadResult{}, err
	}
	building := "ไม่ระบุอาคาร"
	if loc.Building != nil && loc.Building.Name != "" {
		building = loc.Building.Name
	}
	key := docpath.HallFloorPlanKey(building, loc.Name, fh.Filename)
	return s.storage.UploadWithKey(ctx, key, fh, uploadedBy)
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
