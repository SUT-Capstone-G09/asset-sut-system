package repositories

import (
	"fmt"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type BookingRepository struct {
	db *gorm.DB
}

func NewBookingRepository(db *gorm.DB) *BookingRepository {
	return &BookingRepository{db: db}
}

func (r *BookingRepository) FindAll() ([]models.Bookings, error) {
	var bookings []models.Bookings
	err := r.db.
		Preload("User.Profiles.RequesterType").
		Preload("User.Roles").
		Preload("Status").
		Preload("Timeslots.Location").
		Preload("Timeslots.Status").
		Preload("Timeslots.Addons").
		Preload("Invoice.Status").
		Preload("Invoice.Transactions.Status").
		Preload("Documents").
		Find(&bookings).Error
	return bookings, err
}

func (r *BookingRepository) FindByUserID(userID uint) ([]models.Bookings, error) {
	var bookings []models.Bookings
	err := r.db.
		Where("user_id = ?", userID).
		Preload("User.Profiles.RequesterType").
		Preload("User.Roles").
		Preload("Status").
		Preload("Timeslots.Location").
		Preload("Timeslots.Status").
		Preload("Timeslots.Addons").
		Preload("Invoice.Status").
		Preload("Invoice.Transactions.Status").
		Preload("Documents").
		Find(&bookings).Error
	return bookings, err
}

func (r *BookingRepository) FindByID(id uint) (*models.Bookings, error) {
	var booking models.Bookings
	err := r.db.
		Preload("User.Profiles.RequesterType").
		Preload("User.Roles").
		Preload("Status").
		Preload("Timeslots.Location").
		Preload("Timeslots.Status").
		Preload("Timeslots.Addons.LocationAddon").
		Preload("StatusLogs.FromStatus").
		Preload("StatusLogs.ToStatus").
		Preload("StatusLogs.ChangedByUser").
		Preload("Invoice.Status").
		Preload("Invoice.Transactions.Status").
		Preload("Documents").
		First(&booking, id).Error
	return &booking, err
}

func (r *BookingRepository) Create(booking *models.Bookings) error {
	return r.db.Create(booking).Error
}

func (r *BookingRepository) Update(booking *models.Bookings) error {
	booking.Status = nil
	return r.db.Omit(clause.Associations).Save(booking).Error
}

func (r *BookingRepository) CreateStatusLog(log *models.BookingStatusLogs) error {
	return r.db.Create(log).Error
}

func (r *BookingRepository) FindStatusByName(name string) (*models.BookingStatuses, error) {
	var status models.BookingStatuses
	err := r.db.Where("status = ?", name).First(&status).Error
	return &status, err
}

func (r *BookingRepository) UpdateBookingExpenses(bookingID uint, addons []models.BookingTimeslotAddons, basePrice int, addonPrice int, discountPrice int, totalPrice int) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// 1. Get timeslot IDs for this booking
		var timeslotIDs []uint
		if err := tx.Model(&models.Timeslots{}).Where("booking_id = ?", bookingID).Pluck("id", &timeslotIDs).Error; err != nil {
			return err
		}

		if len(timeslotIDs) > 0 {
			// Get existing addons
			var existingAddons []models.BookingTimeslotAddons
			if err := tx.Where("timeslot_id IN ?", timeslotIDs).Find(&existingAddons).Error; err != nil {
				return err
			}

			existingMap := make(map[string]models.BookingTimeslotAddons)
			for _, ea := range existingAddons {
				key := fmt.Sprintf("%d-%s", ea.TimeslotID, ea.Name)
				existingMap[key] = ea
			}

			keptMap := make(map[string]bool)

			for _, a := range addons {
				key := fmt.Sprintf("%d-%s", a.TimeslotID, a.Name)
				if ea, exists := existingMap[key]; exists {
					// Update existing
					ea.AppliedPrice = a.AppliedPrice
					ea.Quantity = a.Quantity
					ea.TotalPrice = a.TotalPrice
					if err := tx.Save(&ea).Error; err != nil {
						return err
					}
					keptMap[key] = true
				} else {
					// Create new
					if err := tx.Create(&a).Error; err != nil {
						return err
					}
					keptMap[key] = true
				}
			}

			// Delete removed addons
			for _, ea := range existingAddons {
				key := fmt.Sprintf("%d-%s", ea.TimeslotID, ea.Name)
				if !keptMap[key] {
					if err := tx.Delete(&ea).Error; err != nil {
						return err
					}
				}
			}
		}

		// 4. Update the booking prices
		if err := tx.Model(&models.Bookings{}).Where("id = ?", bookingID).Updates(map[string]interface{}{
			"base_price":     basePrice,
			"addon_price":    addonPrice,
			"discount_price": discountPrice,
			"total_price":    totalPrice,
		}).Error; err != nil {
			return err
		}

		// 5. Update the invoice amount if invoice exists
		var invoice models.Invoices
		if err := tx.Where("booking_id = ?", bookingID).First(&invoice).Error; err == nil {
			if err := tx.Model(&invoice).Update("total_amount", totalPrice).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
