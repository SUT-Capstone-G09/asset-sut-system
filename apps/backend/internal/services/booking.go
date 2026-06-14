package services

import (
	"errors"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
)

type BookingService struct {
	bookingRepo    *repositories.BookingRepository
	timeslotRepo   *repositories.TimeslotRepository
	locationRepo   *repositories.LocationRepository
	invoiceRepo    *repositories.InvoiceRepository
	requesterRepo  *repositories.RequesterRepository
}

func NewBookingService(
	bookingRepo *repositories.BookingRepository,
	timeslotRepo *repositories.TimeslotRepository,
	locationRepo *repositories.LocationRepository,
	invoiceRepo *repositories.InvoiceRepository,
	requesterRepo *repositories.RequesterRepository,
) *BookingService {
	return &BookingService{
		bookingRepo:   bookingRepo,
		timeslotRepo:  timeslotRepo,
		locationRepo:  locationRepo,
		invoiceRepo:   invoiceRepo,
		requesterRepo: requesterRepo,
	}
}

func (s *BookingService) GetAll() ([]dto.BookingResponse, error) {
	bookings, err := s.bookingRepo.FindAll()
	if err != nil {
		return nil, err
	}
	var result []dto.BookingResponse
	for _, b := range bookings {
		result = append(result, toBookingResponse(b))
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
		result = append(result, toBookingResponse(b))
	}
	return result, nil
}

func (s *BookingService) GetByID(id uint) (*dto.BookingResponse, error) {
	booking, err := s.bookingRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	res := toBookingResponse(*booking)
	return &res, nil
}

func (s *BookingService) Create(userID uint, req dto.CreateBookingRequest) (*dto.BookingResponse, error) {
	pendingStatus, err := s.bookingRepo.FindStatusByName("pending")
	if err != nil {
		return nil, errors.New("booking status not configured")
	}
	availableStatus, err := s.timeslotRepo.FindStatusByName("available")
	if err != nil {
		return nil, errors.New("timeslot status not configured")
	}

	// Check all slots are free before creating anything
	for _, ts := range req.Timeslots {
		taken, err := s.timeslotRepo.IsSlotTaken(ts.LocationID, ts.StartTime, ts.EndTime)
		if err != nil {
			return nil, err
		}
		if taken {
			return nil, errors.New("one or more timeslots are already taken")
		}
	}

	booking := &models.Bookings{
		UserID:   userID,
		Purpose:  req.Purpose,
		StatusID: pendingStatus.ID,
	}
	if err := s.bookingRepo.Create(booking); err != nil {
		return nil, err
	}

	// Log initial status
	_ = s.bookingRepo.CreateStatusLog(&models.BookingStatusLogs{
		BookingID:  booking.ID,
		ToStatusID: pendingStatus.ID,
		ChangedBy:  userID,
		ChangedAt:  time.Now(),
	})

	// Determine requester type for pricing
	var requesterTypeID uint
	if requester, err := s.requesterRepo.FindByUserID(userID); err == nil {
		requesterTypeID = requester.RequesterTypeID
	}

	var basePrice, addonPrice int

	for _, tsInput := range req.Timeslots {
		location, err := s.locationRepo.FindByID(tsInput.LocationID)
		if err != nil {
			return nil, err
		}

		priceSnapshot := calculatePrice(location, tsInput, requesterTypeID)

		ts := &models.Timeslots{
			LocationID:    tsInput.LocationID,
			BookingID:     &booking.ID,
			Date:          tsInput.Date,
			StartTime:     tsInput.StartTime,
			EndTime:       tsInput.EndTime,
			PriceSnapshot: priceSnapshot,
			StatusID:      availableStatus.ID,
		}
		if err := s.timeslotRepo.Create(ts); err != nil {
			return nil, err
		}
		basePrice += priceSnapshot

		for _, addonID := range tsInput.AddonIDs {
			for _, la := range location.Addons {
				if la.ID == addonID && la.IsActive {
					bta := &models.BookingTimeslotAddons{
						LocationAddonID: la.ID,
						TimeslotID:      ts.ID,
						Name:            la.Name,
						AppliedPrice:    la.DefaultPrice,
						Quantity:        1,
						TotalPrice:      la.DefaultPrice,
					}
					_ = s.timeslotRepo.CreateAddon(bta)
					addonPrice += la.DefaultPrice
				}
			}
		}
	}

	booking.BasePrice = basePrice
	booking.AddonPrice = addonPrice
	booking.TotalPrice = basePrice + addonPrice
	_ = s.bookingRepo.Update(booking)

	// Create invoice
	invoicePendingStatus, err := s.invoiceRepo.FindStatusByName("pending")
	if err == nil {
		invoice := &models.Invoices{
			BookingID:   booking.ID,
			StatusID:    invoicePendingStatus.ID,
			TotalAmount: booking.TotalPrice,
		}
		_ = s.invoiceRepo.Create(invoice)
	}

	return s.GetByID(booking.ID)
}

func (s *BookingService) UpdateStatus(id, changedBy uint, req dto.UpdateBookingStatusRequest) (*dto.BookingResponse, error) {
	booking, err := s.bookingRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	oldStatusID := booking.StatusID
	booking.StatusID = req.StatusID
	if err := s.bookingRepo.Update(booking); err != nil {
		return nil, err
	}
	_ = s.bookingRepo.CreateStatusLog(&models.BookingStatusLogs{
		BookingID:    booking.ID,
		FromStatusID: &oldStatusID,
		ToStatusID:   req.StatusID,
		ChangedBy:    changedBy,
		ChangedAt:    time.Now(),
		Note:         req.Note,
	})
	return s.GetByID(booking.ID)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

func calculatePrice(location *models.Locations, ts dto.TimeslotInput, requesterTypeID uint) int {
	if len(location.PricingTiers) == 0 {
		return 0
	}

	hours := ts.EndTime.Sub(ts.StartTime).Hours()
	if hours <= 0 {
		hours = 1
	}

	// Find hourly tier matching user's requester type
	for _, tier := range location.PricingTiers {
		if tier.RequesterTypeID == requesterTypeID &&
			tier.RateType != nil && tier.RateType.Type == "hourly" {
			return int(hours) * tier.Price
		}
	}

	// Fallback to first tier
	return int(hours) * location.PricingTiers[0].Price
}

func toBookingResponse(b models.Bookings) dto.BookingResponse {
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
	}
	for _, ts := range b.Timeslots {
		tsRes := dto.TimeslotResponse{
			ID:            ts.ID,
			LocationID:    ts.LocationID,
			Date:          ts.Date,
			StartTime:     ts.StartTime,
			EndTime:       ts.EndTime,
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
	return res
}
