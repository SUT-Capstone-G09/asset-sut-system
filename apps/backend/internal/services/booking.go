package services

import (
	"errors"
	"fmt"
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
			la, err := s.locationRepo.FindAddonByID(addonID)
			if err == nil && la.IsActive && (la.LocationID == nil || *la.LocationID == location.ID) {
				bta := &models.BookingTimeslotAddons{
					LocationAddonID: &la.ID,
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
	} else {
		return nil, errors.New("either status or status_id is required")
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

	// Update invoice status if it was a virtual payment status or if approved/rejected/cancelled
	invoice, err := s.invoiceRepo.FindByBookingID(booking.ID)
	if err == nil && invoice != nil {
		var invoiceStatusName string
		if isVirtualStatus {
			if originalVirtualStatus == "pending_payment" {
				invoiceStatusName = "pending"
			}
		} else if req.Status == "approved" {
			invoiceStatusName = "paid"
		} else if req.Status == "rejected" || req.Status == "cancelled" {
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
	firstTimeslotID := booking.Timeslots[0].ID

	var newTimeslotAddons []models.BookingTimeslotAddons
	var addonPrice int = 0
	for _, item := range req.Expenses {
		total := item.AppliedPrice * item.Quantity
		addonPrice += total
		newTimeslotAddons = append(newTimeslotAddons, models.BookingTimeslotAddons{
			TimeslotID:   firstTimeslotID,
			Name:         item.AddonName,
			AppliedPrice: item.AppliedPrice,
			Quantity:     item.Quantity,
			TotalPrice:   total,
		})
	}

	totalPrice := booking.BasePrice + addonPrice

	if err := s.bookingRepo.UpdateBookingExpenses(id, newTimeslotAddons, addonPrice, totalPrice); err != nil {
		return nil, err
	}

	return s.GetByID(id)
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
		currentStatus := b.Status.Status
		if currentStatus == "approved" {
			if b.Invoice == nil || b.Invoice.TotalAmount == 0 {
				res.Status = "approved"
			} else {
				invoiceStatus := ""
				if b.Invoice.Status != nil {
					invoiceStatus = b.Invoice.Status.Status
				}
				if invoiceStatus == "paid" {
					res.Status = "approved"
				} else if invoiceStatus == "pending" {
					hasPendingPayment := false
					for _, tx := range b.Invoice.Transactions {
						if tx.Status != nil && tx.Status.Status == "pending" {
							hasPendingPayment = true
							break
						}
					}
					if hasPendingPayment {
						res.Status = "verifying_payment"
					} else {
						res.Status = "pending_payment"
					}
				} else if invoiceStatus == "cancelled" {
					res.Status = "cancelled"
				} else {
					res.Status = "approved"
				}
			}
		} else {
			res.Status = currentStatus
		}
	}
	if b.User != nil {
		res.UserName = b.User.Email
		res.ContactEmail = b.User.Email

		if b.User.Admin != nil {
			res.RequesterName = b.User.Admin.FirstName + " " + b.User.Admin.LastName
			res.ContactPhone = b.User.Admin.Phone
			res.RequesterType = "admin"
			res.RequesterID = fmt.Sprintf("A-%d", b.User.Admin.ID)
		} else if b.User.Staff != nil {
			res.RequesterName = b.User.Staff.FirstName + " " + b.User.Staff.LastName
			res.ContactPhone = b.User.Staff.Phone
			res.RequesterType = "staff"
			res.RequesterID = fmt.Sprintf("S-%d", b.User.Staff.ID)
		} else if b.User.Requester != nil {
			res.RequesterName = b.User.Requester.FirstName + " " + b.User.Requester.LastName
			res.ContactPhone = b.User.Requester.Phone
			res.RequesterID = fmt.Sprintf("R-%d", b.User.Requester.ID)
			if b.User.Requester.RequesterType.Type != "" {
				res.RequesterType = b.User.Requester.RequesterType.Type
			} else {
				res.RequesterType = "student"
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
	return res
}
