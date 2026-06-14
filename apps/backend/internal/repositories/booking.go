package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
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
		Preload("User").
		Preload("Status").
		Preload("Timeslots.Location").
		Preload("Timeslots.Status").
		Preload("Timeslots.Addons").
		Find(&bookings).Error
	return bookings, err
}

func (r *BookingRepository) FindByUserID(userID uint) ([]models.Bookings, error) {
	var bookings []models.Bookings
	err := r.db.
		Where("user_id = ?", userID).
		Preload("Status").
		Preload("Timeslots.Location").
		Preload("Timeslots.Status").
		Preload("Timeslots.Addons").
		Find(&bookings).Error
	return bookings, err
}

func (r *BookingRepository) FindByID(id uint) (*models.Bookings, error) {
	var booking models.Bookings
	err := r.db.
		Preload("User").
		Preload("Status").
		Preload("Timeslots.Location").
		Preload("Timeslots.Status").
		Preload("Timeslots.Addons.LocationAddon").
		Preload("StatusLogs.FromStatus").
		Preload("StatusLogs.ToStatus").
		Preload("StatusLogs.ChangedByUser").
		First(&booking, id).Error
	return &booking, err
}

func (r *BookingRepository) Create(booking *models.Bookings) error {
	return r.db.Create(booking).Error
}

func (r *BookingRepository) Update(booking *models.Bookings) error {
	return r.db.Model(booking).Select("status_id", "base_price", "addon_price", "total_price").Updates(booking).Error
}

func (r *BookingRepository) CreateStatusLog(log *models.BookingStatusLogs) error {
	return r.db.Create(log).Error
}

func (r *BookingRepository) FindStatusByName(name string) (*models.BookingStatuses, error) {
	var status models.BookingStatuses
	err := r.db.Where("status = ?", name).First(&status).Error
	return &status, err
}
