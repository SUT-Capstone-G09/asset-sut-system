package services

import (
	"context"
	"errors"
	"fmt"
	"math"
	"sort"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
	"gorm.io/gorm"
)

const MinBookingLeadDays = 7

type BookingService struct {
	bookingRepo    *repositories.BookingRepository
	timeslotRepo   *repositories.TimeslotRepository
	locationRepo   *repositories.LocationRepository
	invoiceRepo    *repositories.InvoiceRepository
	requesterRepo  *repositories.RequesterRepository
	storageService *StorageService
}

// The fields above are for read-only/pre-transaction use only (hall-purpose
// pricing quotes, cell-availability checks, etc.) — Create() still builds its
// own transaction-bound repos inside the tx closure for every write, so a
// concurrent request can never observe a half-committed booking via s.xxxRepo.
func NewBookingService(
	bookingRepo *repositories.BookingRepository,
	timeslotRepo *repositories.TimeslotRepository,
	locationRepo *repositories.LocationRepository,
	invoiceRepo *repositories.InvoiceRepository,
	requesterRepo *repositories.RequesterRepository,
	storageService *StorageService,
) *BookingService {
	return &BookingService{
		bookingRepo:    bookingRepo,
		timeslotRepo:   timeslotRepo,
		locationRepo:   locationRepo,
		invoiceRepo:    invoiceRepo,
		requesterRepo:  requesterRepo,
		storageService: storageService,
	}
}

func (s *BookingService) GetAll() ([]dto.BookingResponse, error) {
	bookings, err := s.bookingRepo.FindAll()
	if err != nil {
		return nil, err
	}
	var result []dto.BookingResponse
	for _, b := range bookings {
		result = append(result, s.toBookingResponse(b))
	}
	return result, nil
}

func (s *BookingService) GetByUserID(userID uint) ([]dto.BookingResponse, error) {
	bookings, err := s.bookingRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}
	var result []dto.BookingResponse
	for _, b := range bookings {
		result = append(result, s.toBookingResponse(b))
	}
	return result, nil
}

func (s *BookingService) GetByID(id uint) (*dto.BookingResponse, error) {
	booking, err := s.bookingRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	res := s.toBookingResponse(*booking)
	return &res, nil
}

// GetBookedCells คืนเซลล์บูธที่ถูกจองแล้วในโถงหนึ่ง สำหรับชุดวันที่กำหนด (ใช้แสดงผังฝั่งผู้ขอ)
func (s *BookingService) GetBookedCells(locationID uint, dates []time.Time) ([][]int, error) {
	return s.bookingRepo.FindBookedCells(locationID, dates)
}

// QuoteHallPurposes คำนวณราคาที่ระบบคิด (preview) โดยไม่สร้าง booking และไม่ตรวจ ProposedPrice
// ใช้ให้ frontend แสดงราคาระบบ + validate ราคาที่ผู้ขอเสนอ (ต้องไม่ต่ำกว่า ComputedPrice)
func (s *BookingService) QuoteHallPurposes(locationID uint, days int, purposeInputs []dto.BookingPurposeInput) (*dto.HallPriceQuoteResponse, error) {
	if days < 1 {
		days = 1
	}
	// ตัดราคาที่เสนอออก เพื่อให้ได้ ComputedPrice ล้วน (priceHallPurposes จะ reject ถ้า proposed < computed)
	clean := make([]dto.BookingPurposeInput, len(purposeInputs))
	for i, p := range purposeInputs {
		clean[i] = p
		clean[i].ProposedPrice = nil
	}
	lines, _, _, err := s.priceHallPurposes(locationID, days, clean)
	if err != nil {
		return nil, err
	}
	res := &dto.HallPriceQuoteResponse{Days: days}
	for _, l := range lines {
		res.Purposes = append(res.Purposes, dto.HallPurposeQuote{
			HallUsagePurposeID: l.HallUsagePurposeID,
			PricingModel:       l.PricingModel,
			AreaSqm:            l.AreaSqm,
			ProductTypeCount:   l.ProductTypeCount,
			UnitPrice:          l.UnitPriceSnapshot,
			ComputedPrice:      l.ComputedPrice,
		})
		res.TotalComputed += l.ComputedPrice
	}
	return res, nil
}

func (s *BookingService) Create(userID uint, req dto.CreateBookingRequest) (*dto.BookingResponse, error) {
	now := time.Now()
	startOfToday := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	minBookableDate := startOfToday.AddDate(0, 0, MinBookingLeadDays)
	for _, ts := range req.Timeslots {
		if ts.Date.Before(minBookableDate) {
			return nil, fmt.Errorf("ต้องจองล่วงหน้าอย่างน้อย %d วัน", MinBookingLeadDays)
		}
		// Reject degenerate slots up front so pricing never has to guess at a
		// zero/negative duration (full-day slots still carry real start<end times).
		if !ts.EndTime.After(ts.StartTime) {
			return nil, errors.New("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม")
		}
	}
	if len(req.Timeslots) == 0 {
		return nil, errors.New("at least one timeslot is required")
	}

	// การจองโถง (มีวัตถุประสงค์) แชร์วันเดียวกันหลายบูธได้ จึงไม่ใช้ slot-lock แบบห้อง
	// แต่ไปตรวจการทับเซลล์แทน ; ห้อง/สนาม/อาคารเรียนยังกันเวลาซ้ำด้วย lock-based overlap เหมือนเดิม
	isHall := len(req.Purposes) > 0

	// Hall booking: คำนวณ+ตรวจราคาวัตถุประสงค์ก่อนสร้างอะไร (เสนอราคาต่ำกว่าเกณฑ์จะถูก reject ตรงนี้ ไม่มี booking ค้าง)
	// ทำก่อนเปิด transaction เพราะ priceHallPurposes/validateHallCellAvailability เป็นแค่การอ่าน+validate
	var hallLines []models.BookingPurposes
	var purposeBase, purposeAddon float64
	if isHall {
		// 1 booking = 1 สถานที่
		locationID := req.Timeslots[0].LocationID
		for _, ts := range req.Timeslots {
			if ts.LocationID != locationID {
				return nil, errors.New("การจองพื้นที่โถงต้องเป็นสถานที่เดียวต่อการจอง")
			}
		}
		// กันจองบูธทับช่องห้ามจอง / เซลล์ที่ผู้อื่นจองไว้แล้วในวันเดียวกัน
		if err := s.validateHallCellAvailability(locationID, req.Timeslots, req.Purposes); err != nil {
			return nil, err
		}
		var err error
		hallLines, purposeBase, purposeAddon, err = s.priceHallPurposes(locationID, distinctDateCount(req.Timeslots), req.Purposes)
		if err != nil {
			return nil, err
		}
		// แจกใบปลิว/ตัวอย่างสินค้า ต้องระบุชื่อสินค้าที่จะแจกให้ครบทุกประเภท
		if err := validateHallProductNames(hallLines); err != nil {
			return nil, err
		}
	}

	var bookingID uint

	err := s.bookingRepo.DB().Transaction(func(tx *gorm.DB) error {
		bookingRepo := repositories.NewBookingRepository(tx)
		timeslotRepo := repositories.NewTimeslotRepository(tx)
		locationRepo := repositories.NewLocationRepository(tx)
		invoiceRepo := repositories.NewInvoiceRepository(tx)
		requesterRepo := repositories.NewRequesterRepository(tx)

		pendingStatus, err := bookingRepo.FindStatusByName("pending")
		if err != nil {
			return errors.New("booking status not configured")
		}
		availableStatus, err := timeslotRepo.FindStatusByName("available")
		if err != nil {
			return errors.New("timeslot status not configured")
		}

		// Lock every distinct location touched by this request, in a fixed
		// (ascending ID) order, before checking or creating any timeslot for
		// it. See LocationRepository.LockByID for why this — not the
		// per-timeslot lock below — is what actually prevents concurrent
		// double-booking. The fixed order prevents deadlocks between two
		// transactions that both touch the same two locations.
		locationIDs := make([]uint, 0, len(req.Timeslots))
		seen := make(map[uint]bool, len(req.Timeslots))
		for _, ts := range req.Timeslots {
			if !seen[ts.LocationID] {
				seen[ts.LocationID] = true
				locationIDs = append(locationIDs, ts.LocationID)
			}
		}
		sort.Slice(locationIDs, func(i, j int) bool { return locationIDs[i] < locationIDs[j] })

		locations := make(map[uint]*models.Locations, len(locationIDs))
		for _, id := range locationIDs {
			loc, err := locationRepo.LockByID(id)
			if err != nil {
				return fmt.Errorf("location %d: %w", id, err)
			}
			locations[id] = loc
		}

		// Range-overlap check — race-free now because we hold each
		// location's lock, so any concurrent booking attempt on the same
		// location is either fully committed (and visible here) or blocked
		// waiting for us to finish.
		// โถง (isHall) แชร์วันเดียวกันหลายบูธได้ ข้ามการเช็คทับช่วงเวลานี้ไป — การกันชน
		// ของโถงทำผ่าน validateHallCellAvailability (เช็คทับเซลล์) ไปแล้วก่อนเข้า transaction
		if !isHall {
			for i, ts := range req.Timeslots {
				overlapping, err := timeslotRepo.LockOverlapping(ts.LocationID, ts.Date, ts.StartTime, ts.EndTime)
				if err != nil {
					return err
				}
				if len(overlapping) > 0 {
					return errors.New("one or more timeslots are already taken")
				}

				// None of this request's own timeslots exist in the DB yet, so
				// the query above can't catch two overlapping slots submitted
				// together in the same request — check those pairwise here.
				for j := i + 1; j < len(req.Timeslots); j++ {
					other := req.Timeslots[j]
					if ts.LocationID == other.LocationID && sameDate(ts.Date, other.Date) &&
						ts.StartTime.Before(other.EndTime) && other.StartTime.Before(ts.EndTime) {
						return errors.New("one or more timeslots in this request overlap each other")
					}
				}
			}
		}

		// Reject slots that fall inside a staff-configured unavailability
		// window (maintenance, closures, etc.) for this location/date —
		// applies to room and hall bookings alike.
		for _, ts := range req.Timeslots {
			blocks, err := locationRepo.FindUnavailabilitiesByDate(ts.LocationID, ts.Date)
			if err != nil {
				return err
			}
			tsStart, tsEnd := minutesOfDay(ts.StartTime), minutesOfDay(ts.EndTime)
			for _, b := range blocks {
				bStart, bEnd := minutesOfDay(b.StartTime), minutesOfDay(b.EndTime)
				if tsStart < bEnd && bStart < tsEnd {
					return errors.New("สถานที่ไม่พร้อมให้บริการในช่วงเวลานี้")
				}
			}
		}

		booking := &models.Bookings{
			UserID:   userID,
			Purpose:  req.Purpose,
			StatusID: pendingStatus.ID,
		}
		if err := bookingRepo.Create(booking); err != nil {
			return err
		}

		if err := bookingRepo.CreateStatusLog(&models.BookingStatusLogs{
			BookingID:  booking.ID,
			ToStatusID: pendingStatus.ID,
			ChangedBy:  userID,
			ChangedAt:  time.Now(),
		}); err != nil {
			return err
		}

		// Determine requester type for pricing
		var requesterTypeID uint
		if requester, err := requesterRepo.FindByUserID(userID); err == nil && requester.RequesterTypeID != nil {
			requesterTypeID = *requester.RequesterTypeID
		}

		var basePrice, addonPrice float64

		for _, tsInput := range req.Timeslots {
			location := locations[tsInput.LocationID]

			// การจองโถงคิดราคาจากวัตถุประสงค์ (base/addon) ไม่ใช่ pricing tier รายชั่วโมง/วัน → snapshot = 0
			priceSnapshot := 0
			if !isHall {
				priceSnapshot = calculatePrice(location, tsInput, requesterTypeID)
			}

			ts := &models.Timeslots{
				LocationID:    tsInput.LocationID,
				BookingID:     &booking.ID,
				Date:          tsInput.Date,
				StartTime:     tsInput.StartTime,
				EndTime:       tsInput.EndTime,
				IsFullDay:     tsInput.IsFullDay,
				IsShared:      isHall, // โถง = แชร์วันได้ ยกเว้นจาก partial unique index idx_timeslot_slot
				PriceSnapshot: float64(priceSnapshot),
				StatusID:      availableStatus.ID,
			}
			if err := timeslotRepo.Create(ts); err != nil {
				return err
			}
			basePrice += float64(priceSnapshot)

			for _, addonID := range tsInput.AddonIDs {
				la, err := locationRepo.FindAddonByID(addonID)
				if err == nil && la.IsActive && (la.LocationID == nil || *la.LocationID == location.ID) {
					bta := &models.BookingTimeslotAddons{
						LocationAddonID: &la.ID,
						TimeslotID:      ts.ID,
						Name:            la.Name,
						AppliedPrice:    float64(la.DefaultPrice),
						Quantity:        1,
						TotalPrice:      float64(la.DefaultPrice),
					}
					if err := timeslotRepo.CreateAddon(bta); err != nil {
						return err
					}
					addonPrice += float64(la.DefaultPrice)
				}
			}
		}

		// Hall booking: บันทึกวัตถุประสงค์ (ผูก BookingID) แล้วม้วนราคาเข้า base/addon
		if isHall {
			for i := range hallLines {
				hallLines[i].BookingID = booking.ID
			}
			if err := bookingRepo.CreatePurposes(hallLines); err != nil {
				return err
			}
			basePrice += purposeBase
			addonPrice += purposeAddon
		}

		booking.BasePrice = basePrice
		booking.AddonPrice = addonPrice
		booking.TotalPrice = basePrice + addonPrice
		if err := bookingRepo.Update(booking); err != nil {
			return err
		}

		// Create invoice
		invoicePendingStatus, err := invoiceRepo.FindStatusByName("pending")
		if err == nil {
			invoice := &models.Invoices{
				BookingID:   booking.ID,
				StatusID:    invoicePendingStatus.ID,
				TotalAmount: booking.TotalPrice,
			}
			if err := invoiceRepo.Create(invoice); err != nil {
				return err
			}
		}

		bookingID = booking.ID
		return nil
	})
	if err != nil {
		return nil, err
	}

	return s.GetByID(bookingID)
}

// validBookingTransitions enumerates which status changes UpdateStatus allows.
// rejected/cancelled/completed are terminal — once a booking reaches one of
// those, this endpoint can't move it anywhere else. "completed" is normally
// reached via PaymentService.Verify (payment confirmed), not through here,
// but staff can still force it from "approved" for edge cases (e.g. cash
// paid in person and reconciled manually).
var validBookingTransitions = map[string][]string{
	"pending":   {"approved", "rejected", "cancelled"},
	"approved":  {"cancelled", "completed"},
	"rejected":  {},
	"cancelled": {},
	"completed": {},
}

func isValidBookingTransition(from, to string) bool {
	if from == "" || from == to {
		return false
	}
	for _, s := range validBookingTransitions[from] {
		if s == to {
			return true
		}
	}
	return false
}

// Revise ให้เจ้าของ booking แก้ไขวัตถุประสงค์แล้วส่งใหม่ ทำได้เฉพาะสถานะ needs_revision
// คำนวณราคาใหม่ (validate ราคาเสนอซ้ำ), แทนที่ purposes เดิม, อัปเดตยอด+invoice, กลับเป็น pending
func (s *BookingService) Revise(bookingID, userID uint, req dto.ReviseBookingRequest) (*dto.BookingResponse, error) {
	booking, err := s.bookingRepo.FindByID(bookingID)
	if err != nil {
		return nil, err
	}
	if booking.UserID != userID {
		return nil, errors.New("ไม่มีสิทธิ์แก้ไขการจองนี้")
	}
	if booking.Status == nil || booking.Status.Status != "needs_revision" {
		return nil, errors.New("แก้ไขได้เฉพาะรายการที่ถูกตีกลับให้แก้ไข (needs_revision) เท่านั้น")
	}
	if len(booking.Timeslots) == 0 {
		return nil, errors.New("การจองนี้ไม่มีวันที่จอง")
	}

	// location + จำนวนวัน มาจาก timeslots เดิม (v1: วันไม่เปลี่ยน)
	locationID := booking.Timeslots[0].LocationID
	days := distinctDateCountModel(booking.Timeslots)

	lines, base, addon, err := s.priceHallPurposes(locationID, days, req.Purposes)
	if err != nil {
		return nil, err
	}
	// แจกใบปลิว/ตัวอย่างสินค้า ต้องระบุชื่อสินค้าที่จะแจกให้ครบทุกประเภท
	if err := validateHallProductNames(lines); err != nil {
		return nil, err
	}

	// แทนที่ purposes เดิมด้วยชุดใหม่
	if err := s.bookingRepo.DeletePurposesByBookingID(booking.ID); err != nil {
		return nil, err
	}
	for i := range lines {
		lines[i].BookingID = booking.ID
	}
	if err := s.bookingRepo.CreatePurposes(lines); err != nil {
		return nil, err
	}

	if req.Purpose != nil && *req.Purpose != "" {
		booking.Purpose = *req.Purpose
	}

	// ยอดของการจองโถงมาจากวัตถุประสงค์ล้วน (timeslot snapshot = 0)
	booking.BasePrice = base
	booking.AddonPrice = addon
	booking.TotalPrice = base + addon

	pending, err := s.bookingRepo.FindStatusByName("pending")
	if err != nil {
		return nil, errors.New("booking status not configured")
	}
	fromStatusID := booking.StatusID
	booking.StatusID = pending.ID
	if err := s.bookingRepo.Update(booking); err != nil {
		return nil, err
	}

	_ = s.bookingRepo.CreateStatusLog(&models.BookingStatusLogs{
		BookingID:    booking.ID,
		FromStatusID: &fromStatusID,
		ToStatusID:   pending.ID,
		ChangedBy:    userID,
		ChangedAt:    time.Now(),
		Note:         "ผู้ขอแก้ไขและส่งใหม่",
	})

	// อัปเดตยอดในใบแจ้งหนี้ให้ตรง
	if invoice, ierr := s.invoiceRepo.FindByBookingID(booking.ID); ierr == nil && invoice != nil {
		invoice.TotalAmount = booking.TotalPrice
		_ = s.invoiceRepo.Update(invoice)
	}

	return s.GetByID(booking.ID)
}

func (s *BookingService) UpdateStatus(id, changedBy uint, req dto.UpdateBookingStatusRequest) (*dto.BookingResponse, error) {
	booking, err := s.bookingRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	var targetStatusName string = req.Status
	isVirtualStatus := false
	originalVirtualStatus := req.Status

	if targetStatusName == "pending_payment" || targetStatusName == "verifying_payment" {
		targetStatusName = "approved"
		isVirtualStatus = true
	}

	var targetStatusID uint
	if req.Status != "" {
		st, err := s.bookingRepo.FindStatusByName(targetStatusName)
		if err != nil {
			return nil, errors.New("invalid status name: " + req.Status)
		}
		targetStatusID = st.ID
	} else if req.StatusID != 0 {
		targetStatusID = req.StatusID
		st, err := s.bookingRepo.FindStatusByID(targetStatusID)
		if err != nil {
			return nil, errors.New("invalid status_id")
		}
		targetStatusName = st.Status
	} else {
		return nil, errors.New("either status or status_id is required")
	}

	currentStatusName := ""
	if booking.Status != nil {
		currentStatusName = booking.Status.Status
	}
	// Virtual statuses are just "approved" wearing a different name for the
	// payment UI, so validate against the real target name they resolve to.
	if !isValidBookingTransition(currentStatusName, targetStatusName) {
		return nil, fmt.Errorf("cannot change booking status from %q to %q", currentStatusName, targetStatusName)
	}

	oldStatusID := booking.StatusID
	booking.StatusID = targetStatusID
	if err := s.bookingRepo.Update(booking); err != nil {
		return nil, err
	}
	_ = s.bookingRepo.CreateStatusLog(&models.BookingStatusLogs{
		BookingID:    booking.ID,
		FromStatusID: &oldStatusID,
		ToStatusID:   targetStatusID,
		ChangedBy:    changedBy,
		ChangedAt:    time.Now(),
		Note:         req.Note,
	})

	// Update invoice status to match. Approving a booking only means it's
	// awaiting payment — it must NOT mark the invoice paid; that only ever
	// happens when a real payment is confirmed (see PaymentService.Verify).
	invoice, err := s.invoiceRepo.FindByBookingID(booking.ID)
	if err == nil && invoice != nil {
		var invoiceStatusName string
		if isVirtualStatus {
			if originalVirtualStatus == "pending_payment" {
				invoiceStatusName = "pending"
			}
		} else if targetStatusName == "rejected" || targetStatusName == "cancelled" {
			invoiceStatusName = "cancelled"
		}

		if invoiceStatusName != "" {
			invStatus, err := s.invoiceRepo.FindStatusByName(invoiceStatusName)
			if err == nil && invStatus != nil {
				invoice.StatusID = invStatus.ID
				_ = s.invoiceRepo.Update(invoice)
			}
		}
	}

	return s.GetByID(booking.ID)
}

func (s *BookingService) UpdateExpenses(id uint, req dto.UpdateBookingExpensesRequest) (*dto.BookingResponse, error) {
	booking, err := s.bookingRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if len(booking.Timeslots) == 0 {
		return nil, errors.New("booking has no timeslots to attach expenses to")
	}

	// ── Build a lookup of master addon default prices (by name) ────────
	masterAddonPrices := make(map[string]float64)
	var masterAddons []models.LocationAddons
	if err := s.bookingRepo.DB().Where("location_id IS NULL").Find(&masterAddons).Error; err == nil {
		for _, ma := range masterAddons {
			masterAddonPrices[ma.Name] = float64(ma.DefaultPrice)
		}
	}

	var newTimeslotAddons []models.BookingTimeslotAddons
	var addonPrice float64 = 0

	for _, tsInput := range req.Timeslots {
		for _, item := range tsInput.Expenses {
			// ── Validate: applied_price must not be lower than the addon's default price ──
			if minPrice, found := masterAddonPrices[item.AddonName]; found {
				if item.AppliedPrice < minPrice {
					return nil, fmt.Errorf("ราคา %.2f ของ \"%s\" ต่ำกว่าราคาขั้นต่ำ %.2f บาท", item.AppliedPrice, item.AddonName, minPrice)
				}
			}

			total := item.AppliedPrice * float64(item.Quantity)
			addonPrice += total

			newTimeslotAddons = append(newTimeslotAddons, models.BookingTimeslotAddons{
				TimeslotID:   tsInput.TimeslotID,
				Name:         item.AddonName,
				AppliedPrice: item.AppliedPrice,
				Quantity:     item.Quantity,
				TotalPrice:   total,
			})
		}
	}

	// Recalculate base price in case it was 0
	basePrice := booking.BasePrice
	if basePrice == 0 && len(booking.Timeslots) > 0 {
		for _, ts := range booking.Timeslots {
			basePrice += ts.PriceSnapshot
		}
	}

	totalPrice := basePrice + addonPrice
	if req.IsWaived {
		totalPrice = 0
	}

	if err := s.bookingRepo.UpdateBookingExpenses(id, newTimeslotAddons, basePrice, addonPrice, totalPrice); err != nil {
		return nil, err
	}

	return s.GetByID(id)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// sameDate reports whether a and b fall on the same calendar day.
func sameDate(a, b time.Time) bool {
	ay, am, ad := a.Date()
	by, bm, bd := b.Date()
	return ay == by && am == bm && ad == bd
}

// Office hours: 08:30–16:30. Time inside this window bills at the "hourly" tier;
// time outside it (earlier or later, including bookings that straddle the boundary)
// bills at the "hourly_offpeak" tier, prorated by the exact minutes on each side.
const (
	officeStartMinute = 8*60 + 30
	officeEndMinute   = 16*60 + 30
)

// findTierPrice returns the price of the first tier matching rateType, preferring
// an exact requesterTypeID match and falling back to any tier of that rate type.
func findTierPrice(tiers []models.LocationPricingTiers, requesterTypeID uint, rateType string) (int, bool) {
	if requesterTypeID != 0 {
		for _, tier := range tiers {
			if tier.RequesterTypeID == requesterTypeID &&
				tier.RateType != nil && tier.RateType.Type == rateType {
				return tier.Price, true
			}
		}
	}
	for _, tier := range tiers {
		if tier.RateType != nil && tier.RateType.Type == rateType {
			return tier.Price, true
		}
	}
	return 0, false
}

// minutesOfDay converts a time.Time's clock component to minutes since midnight.
func minutesOfDay(t time.Time) int {
	return t.Hour()*60 + t.Minute()
}

// Full-day booking window, mirrors FULL_DAY_START/FULL_DAY_END in the frontend
// (useBookingCalendar.ts / BookingConfirmView.tsx).
const (
	fullDayStartMinute = 7 * 60
	fullDayEndMinute   = 21 * 60
)

// isFullDaySlot reports whether ts actually spans the full bookable window,
// derived from its own clock times rather than the client-supplied IsFullDay
// flag — a request can't get the daily flat rate just by setting that flag on
// a short slot.
func isFullDaySlot(ts dto.TimeslotInput) bool {
	return minutesOfDay(ts.StartTime) == fullDayStartMinute && minutesOfDay(ts.EndTime) == fullDayEndMinute
}

// overlapMinutes returns how many minutes of [aStart, aEnd) fall inside [bStart, bEnd).
func overlapMinutes(aStart, aEnd, bStart, bEnd int) int {
	start := aStart
	if bStart > start {
		start = bStart
	}
	end := aEnd
	if bEnd < end {
		end = bEnd
	}
	if end <= start {
		return 0
	}
	return end - start
}

func calculatePrice(location *models.Locations, ts dto.TimeslotInput, requesterTypeID uint) int {
	if len(location.PricingTiers) == 0 {
		return 0
	}

	// Full-day booking: use the flat daily tier if the location has one configured.
	if isFullDaySlot(ts) {
		if price, ok := findTierPrice(location.PricingTiers, requesterTypeID, "daily"); ok {
			return price
		}
	}

	hours := ts.EndTime.Sub(ts.StartTime).Hours()
	if hours <= 0 {
		hours = 1
	}

	// Bookings longer than 4 hours use the flat daily rate regardless of time of day.
	if hours > 4 {
		if price, ok := findTierPrice(location.PricingTiers, requesterTypeID, "daily"); ok {
			return price
		}
	}

	officeRate, hasOffice := findTierPrice(location.PricingTiers, requesterTypeID, "hourly")
	if !hasOffice {
		// No "hourly" tier configured for this location/requester at all — picking
		// an arbitrary tier (e.g. a "daily" price) here would silently produce a
		// wrong-but-plausible-looking price. 0 is visibly wrong instead, same
		// rationale as treating a missing off-peak tier as "no charge" upstream.
		return 0
	}
	offPeakRate, hasOffPeak := findTierPrice(location.PricingTiers, requesterTypeID, "hourly_offpeak")
	if !hasOffPeak {
		// No off-peak tier configured for this location yet — bill all minutes at the office rate.
		offPeakRate = officeRate
	}

	startMin := minutesOfDay(ts.StartTime)
	endMin := minutesOfDay(ts.EndTime)
	if endMin <= startMin {
		// EndTime's clock component didn't advance past StartTime's (e.g. differing
		// date components on otherwise same-day time-only values) — fall back to duration.
		endMin = startMin + int(math.Round(hours*60))
	}

	officeMinutes := overlapMinutes(startMin, endMin, officeStartMinute, officeEndMinute)
	offPeakMinutes := (endMin - startMin) - officeMinutes

	price := float64(officeMinutes)/60*float64(officeRate) + float64(offPeakMinutes)/60*float64(offPeakRate)
	return int(math.Round(price))
}

// priceHallPurposes คำนวณ+ตรวจราคาวัตถุประสงค์ของการจองพื้นที่โถง สำหรับ location + จำนวนวันที่กำหนด
// เรทมาจากอาคารของ location โดยมีราคาเฉพาะโถง (ทำเลทอง) override ทับได้ถ้าสูงกว่า,
// ขนาดเซลล์มาจากผังของโถง ; ใช้ได้ทั้งตอน Create และ Revise
func (s *BookingService) priceHallPurposes(locationID uint, days int, purposeInputs []dto.BookingPurposeInput) ([]models.BookingPurposes, float64, float64, error) {
	location, err := s.locationRepo.FindByID(locationID)
	if err != nil {
		return nil, 0, 0, err
	}

	// ราคาโถงของอาคารนี้ (ราย วัตถุประสงค์) — single source of truth แทน Building.RatePerSqm เดิม
	pricingByPurpose := make(map[uint]*models.BuildingHallPricings)
	if location.Building != nil {
		pricings, perr := s.bookingRepo.FindBuildingHallPricings(location.Building.ID)
		if perr != nil {
			return nil, 0, 0, perr
		}
		for i := range pricings {
			pricingByPurpose[pricings[i].HallUsagePurposeID] = &pricings[i]
		}
	}

	// ราคาเฉพาะโถงนี้ (ทำเลทอง) — override ราคาอาคาร ใช้เมื่อสูงกว่าเท่านั้น (ดู resolveHallUnitPrice)
	overrideByPurpose := make(map[uint]*models.LocationHallPricings)
	locationPricings, lerr := s.bookingRepo.FindLocationHallPricings(locationID)
	if lerr != nil {
		return nil, 0, 0, lerr
	}
	for i := range locationPricings {
		overrideByPurpose[locationPricings[i].HallUsagePurposeID] = &locationPricings[i]
	}

	// ขนาดเซลล์จากผังของโถง (ถ้ายังไม่มีผัง cellSize = 0 → วัตถุประสงค์แบบตั้งบูธจะ error ตอนคำนวณ)
	var cellSize float64
	if fp, ferr := s.locationRepo.FindFloorPlanByLocationID(locationID); ferr == nil && fp != nil {
		cellSize = fp.CellSizeM
	}

	// โหลด master data ของวัตถุประสงค์ที่เลือก
	ids := make([]uint, 0, len(purposeInputs))
	for _, p := range purposeInputs {
		ids = append(ids, p.HallUsagePurposeID)
	}
	purposes, err := s.bookingRepo.FindHallPurposesByIDs(ids)
	if err != nil {
		return nil, 0, 0, err
	}
	byID := make(map[uint]*models.HallUsagePurposes, len(purposes))
	for i := range purposes {
		byID[purposes[i].ID] = &purposes[i]
	}

	inputs := make([]HallPurposeInput, 0, len(purposeInputs))
	for _, p := range purposeInputs {
		purpose := byID[p.HallUsagePurposeID]
		if purpose == nil {
			return nil, 0, 0, fmt.Errorf("ไม่พบวัตถุประสงค์การขอใช้พื้นที่ (id=%d)", p.HallUsagePurposeID)
		}
		// ราคาต่อหน่วย: ใช้ราคาของอาคารถ้าตั้งไว้ ; ไม่งั้น fallback เป็น DefaultPrice ของ purpose
		// ถ้าอาคารปิดวัตถุประสงค์นี้ (IsActive=false) → ปฏิเสธทันที
		unitPrice := float64(purpose.DefaultPrice)
		if pr := pricingByPurpose[purpose.ID]; pr != nil {
			if !pr.IsActive {
				return nil, 0, 0, fmt.Errorf("อาคารนี้ไม่เปิดให้ขอใช้พื้นที่เพื่อ %q", purpose.Name)
			}
			unitPrice = float64(pr.Price)
		}
		// โถงทำเลทองคิดแพงกว่าเรทกลางของอาคารได้ แต่ราคาอาคารเป็นขั้นต่ำเสมอ
		if ov := overrideByPurpose[purpose.ID]; ov != nil {
			ovPrice := float64(ov.Price)
			unitPrice = resolveHallUnitPrice(unitPrice, &ovPrice)
		}
		inputs = append(inputs, HallPurposeInput{
			Purpose:          purpose,
			UnitPrice:        unitPrice,
			SelectedCells:    p.SelectedCells,
			CellSizeM:        cellSize,
			ProductTypeCount: p.ProductTypeCount,
			ProductNames:     p.ProductNames,
			ProposedPrice:    p.ProposedPrice,
		})
	}

	return CalculateHallPurposes(inputs, days)
}

// validateHallCellAvailability ตรวจว่าเซลล์บูธ (per_sqm) ที่ผู้ขอเลือก ไม่ทับช่องห้ามจองบนผัง
// และไม่ทับเซลล์ที่ booking อื่น (active) จองไว้แล้วในวันเดียวกัน — กันหลายบูธจองที่เดียวกัน
func (s *BookingService) validateHallCellAvailability(locationID uint, slots []dto.TimeslotInput, purposes []dto.BookingPurposeInput) error {
	// รวมเซลล์ที่ผู้ขอเลือก (per_sqm)
	var requested [][]int
	for _, p := range purposes {
		requested = append(requested, p.SelectedCells...)
	}
	if len(requested) == 0 {
		return nil // ไม่มีบูธ ไม่ต้องตรวจเซลล์
	}

	// ช่องห้ามจองจากผังของโถง
	blocked := make(map[string]struct{})
	if fp, err := s.locationRepo.FindFloorPlanByLocationID(locationID); err == nil && fp != nil {
		for _, c := range fp.BlockedCells {
			if len(c) >= 2 {
				blocked[cellKey(c[0], c[1])] = struct{}{}
			}
		}
	}

	// เซลล์ที่ถูกจองแล้วในวันที่ขอ
	bookedCells, err := s.bookingRepo.FindBookedCells(locationID, distinctDates(slots))
	if err != nil {
		return err
	}
	booked := make(map[string]struct{})
	for _, c := range bookedCells {
		if len(c) >= 2 {
			booked[cellKey(c[0], c[1])] = struct{}{}
		}
	}

	for _, c := range requested {
		if len(c) < 2 {
			continue
		}
		k := cellKey(c[0], c[1])
		if _, ok := blocked[k]; ok {
			return errors.New("พื้นที่ที่เลือกมีช่องที่ห้ามจอง กรุณาเลือกพื้นที่ใหม่")
		}
		if _, ok := booked[k]; ok {
			return errors.New("พื้นที่ที่เลือกถูกจองแล้วในวันดังกล่าว กรุณาเลือกพื้นที่อื่น")
		}
	}
	return nil
}

func cellKey(r, c int) string { return fmt.Sprintf("%d,%d", r, c) }

// distinctDates คืนวันไม่ซ้ำ (time.Time) จากช่วงเวลาที่ผู้ขอส่งมา
func distinctDates(slots []dto.TimeslotInput) []time.Time {
	seen := make(map[string]struct{}, len(slots))
	var out []time.Time
	for _, ts := range slots {
		y, m, d := ts.Date.Date()
		key := fmt.Sprintf("%04d-%02d-%02d", y, m, d)
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		out = append(out, ts.Date)
	}
	return out
}

// distinctDateCount นับจำนวนวันไม่ซ้ำจากช่วงเวลาที่ผู้ขอส่งมา
func distinctDateCount(slots []dto.TimeslotInput) int {
	seen := make(map[string]struct{}, len(slots))
	for _, ts := range slots {
		y, m, d := ts.Date.Date()
		seen[fmt.Sprintf("%04d-%02d-%02d", y, m, d)] = struct{}{}
	}
	return len(seen)
}

// distinctDateCountModel นับจำนวนวันไม่ซ้ำจาก timeslots ที่บันทึกไว้แล้ว (ใช้ตอน revise)
func distinctDateCountModel(slots []models.Timeslots) int {
	seen := make(map[string]struct{}, len(slots))
	for _, ts := range slots {
		y, m, d := ts.Date.Date()
		seen[fmt.Sprintf("%04d-%02d-%02d", y, m, d)] = struct{}{}
	}
	return len(seen)
}

func (s *BookingService) toBookingResponse(b models.Bookings) dto.BookingResponse {
	res := dto.BookingResponse{
		ID:         b.ID,
		UserID:     b.UserID,
		Purpose:    b.Purpose,
		BasePrice:  b.BasePrice,
		AddonPrice: b.AddonPrice,
		TotalPrice: b.TotalPrice,
		StatusID:   b.StatusID,
		CreatedAt:  b.CreatedAt,
	}
	if b.Status != nil {
		res.Status = b.Status.Status
	}
	if b.User != nil {
		res.UserName = b.User.Email
		res.ContactEmail = b.User.Email

		if b.User.Profiles != nil {
			res.RequesterName = b.User.Profiles.FirstName + " " + b.User.Profiles.LastName
			res.ContactPhone = b.User.Profiles.Phone

			isAdmin := false
			isStaff := false
			for _, role := range b.User.Roles {
				if role.Name == "admin" {
					isAdmin = true
				} else if role.Name == "staff" {
					isStaff = true
				}
			}

			if isAdmin {
				res.RequesterType = "admin"
				res.RequesterID = fmt.Sprintf("A-%d", b.User.Profiles.ID)
			} else if isStaff {
				res.RequesterType = "staff"
				res.RequesterID = fmt.Sprintf("S-%d", b.User.Profiles.ID)
			} else {
				res.RequesterID = fmt.Sprintf("R-%d", b.User.Profiles.ID)
				if b.User.Profiles.RequesterType != nil && b.User.Profiles.RequesterType.Type != "" {
					res.RequesterType = b.User.Profiles.RequesterType.Type
				} else {
					res.RequesterType = "student"
				}
			}
		} else {
			res.RequesterName = b.User.Email
			res.RequesterID = fmt.Sprintf("U-%d", b.UserID)
			res.RequesterType = "external"
		}
	}
	for _, ts := range b.Timeslots {
		tsRes := dto.TimeslotResponse{
			ID:            ts.ID,
			LocationID:    ts.LocationID,
			Date:          ts.Date,
			StartTime:     ts.StartTime,
			EndTime:       ts.EndTime,
			IsFullDay:     ts.IsFullDay,
			PriceSnapshot: ts.PriceSnapshot,
		}
		if ts.Location != nil {
			tsRes.LocationName = ts.Location.Name
			tsRes.LocationImage = ts.Location.ImageURL
		}
		if ts.Status != nil {
			tsRes.Status = ts.Status.Status
		}
		for _, a := range ts.Addons {
			tsRes.Addons = append(tsRes.Addons, dto.BookingAddonResponse{
				ID:           a.ID,
				AddonName:    a.Name,
				AppliedPrice: a.AppliedPrice,
				Quantity:     a.Quantity,
				TotalPrice:   a.TotalPrice,
			})
		}
		res.Timeslots = append(res.Timeslots, tsRes)
	}
	for _, log := range b.StatusLogs {
		logRes := dto.StatusLogResponse{
			ID:        log.ID,
			ChangedBy: log.ChangedBy,
			ChangedAt: log.ChangedAt,
			Note:      log.Note,
		}
		if log.FromStatus != nil {
			logRes.FromStatus = log.FromStatus.Status
		}
		if log.ToStatus != nil {
			logRes.ToStatus = log.ToStatus.Status
		}
		if log.ChangedByUser != nil {
			logRes.ChangedByName = log.ChangedByUser.Email
		}
		res.StatusLogs = append(res.StatusLogs, logRes)
	}
	res.BookingAddons = make([]dto.BookingAddonResponse, 0)
	for _, ts := range b.Timeslots {
		for _, bta := range ts.Addons {
			res.BookingAddons = append(res.BookingAddons, dto.BookingAddonResponse{
				ID:           bta.ID,
				AddonName:    bta.Name,
				AppliedPrice: bta.AppliedPrice,
				Quantity:     bta.Quantity,
				TotalPrice:   bta.TotalPrice,
			})
		}
	}
	res.Purposes = make([]dto.BookingPurposeResponse, 0, len(b.Purposes))
	for _, p := range b.Purposes {
		pr := dto.BookingPurposeResponse{
			ID:                 p.ID,
			HallUsagePurposeID: p.HallUsagePurposeID,
			PricingModel:       p.PricingModel,
			SelectedCells:      p.SelectedCells,
			AreaSqm:            p.AreaSqm,
			ProductTypeCount:   p.ProductTypeCount,
			ProductNames:       p.ProductNames,
			UnitPriceSnapshot:  p.UnitPriceSnapshot,
			ComputedPrice:      p.ComputedPrice,
			ProposedPrice:      p.ProposedPrice,
			TotalPrice:         p.TotalPrice,
		}
		if p.HallUsagePurpose != nil {
			pr.PurposeName = p.HallUsagePurpose.Name
		}
		res.Purposes = append(res.Purposes, pr)
	}

	res.Documents = make([]dto.DocumentResponse, 0)
	for _, doc := range b.Documents {
		docRes := dto.DocumentResponse{
			ID:             doc.ID,
			BookingID:      doc.BookingID,
			DocumentTypeID: doc.DocumentTypeID,
			FileName:       doc.FileName,
			FileURL:        doc.FileURL,
			ContentType:    doc.ContentType,
			CreatedAt:      doc.CreatedAt,
		}

		// Generate fresh presigned URL
		if freshURL, err := s.storageService.PresignedURL(context.Background(), doc.ObjectKey); err == nil {
			docRes.FileURL = freshURL
		}

		if doc.DocumentType != nil {
			docRes.DocumentType = doc.DocumentType.Type
		}
		if doc.Method != nil {
			docRes.Method = doc.Method.Method
		}
		res.Documents = append(res.Documents, docRes)
	}
	return res
}
