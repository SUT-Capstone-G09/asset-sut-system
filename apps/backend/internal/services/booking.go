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
	invoiceRepo    *repositories.InvoiceRepository
	storageService *StorageService
}

// NewBookingService only keeps the repos BookingService actually uses through
// s.*; Create() builds its own transaction-bound repos (timeslot/location/
// requester) inside the tx closure, so holding non-tx copies as fields would
// only invite silent out-of-transaction access via s.xxxRepo.
func NewBookingService(
	bookingRepo *repositories.BookingRepository,
	invoiceRepo *repositories.InvoiceRepository,
	storageService *StorageService,
) *BookingService {
	return &BookingService{
		bookingRepo:    bookingRepo,
		invoiceRepo:    invoiceRepo,
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

			// Reject slots that fall inside a staff-configured unavailability
			// window (maintenance, closures, etc.) for this location/date.
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

		var basePrice, addonPrice int

		for _, tsInput := range req.Timeslots {
			location := locations[tsInput.LocationID]
			priceSnapshot := calculatePrice(location, tsInput, requesterTypeID)

			ts := &models.Timeslots{
				LocationID:    tsInput.LocationID,
				BookingID:     &booking.ID,
				Date:          tsInput.Date,
				StartTime:     tsInput.StartTime,
				EndTime:       tsInput.EndTime,
				IsFullDay:     tsInput.IsFullDay,
				PriceSnapshot: priceSnapshot,
				StatusID:      availableStatus.ID,
			}
			if err := timeslotRepo.Create(ts); err != nil {
				return err
			}
			basePrice += priceSnapshot

			for _, addonID := range tsInput.AddonIDs {
				la, err := locationRepo.FindAddonByID(addonID)
				if err == nil && la.IsActive && (la.LocationID == nil || *la.LocationID == location.ID) {
					bta := &models.BookingTimeslotAddons{
						LocationAddonID: &la.ID,
						TimeslotID:      ts.ID,
						Name:            la.Name,
						AppliedPrice:    la.DefaultPrice,
						Quantity:        1,
						TotalPrice:      la.DefaultPrice,
					}
					if err := timeslotRepo.CreateAddon(bta); err != nil {
						return err
					}
					addonPrice += la.DefaultPrice
				}
			}
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

	var newTimeslotAddons []models.BookingTimeslotAddons
	var addonPrice int = 0

	for _, tsInput := range req.Timeslots {
		for _, item := range tsInput.Expenses {
			total := item.AppliedPrice * item.Quantity
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

func (s *BookingService) toBookingResponse(b models.Bookings) dto.BookingResponse {
	res := dto.BookingResponse{
		ID:         b.ID,
		UserID:     b.UserID,
		Purpose:    b.Purpose,
		BasePrice:     b.BasePrice,
		AddonPrice:    b.AddonPrice,
		TotalPrice:    b.TotalPrice,
		StatusID:      b.StatusID,
		CreatedAt:     b.CreatedAt,
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
