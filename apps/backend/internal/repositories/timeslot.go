package repositories

import (
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type TimeslotRepository struct {
	db *gorm.DB
}

func NewTimeslotRepository(db *gorm.DB) *TimeslotRepository {
	return &TimeslotRepository{db: db}
}

func (r *TimeslotRepository) FindByID(id uint) (*models.Timeslots, error) {
	var ts models.Timeslots
	err := r.db.Preload("Location").Preload("Status").Preload("Addons").First(&ts, id).Error
	return &ts, err
}

func (r *TimeslotRepository) FindByLocationAndDate(locationID uint, date time.Time) ([]models.Timeslots, error) {
	var slots []models.Timeslots
	err := r.db.
		Where("location_id = ? AND date = ?", locationID, date.Format("2006-01-02")).
		Preload("Status").
		Find(&slots).Error
	return slots, err
}

// IsSlotTaken returns true if the (location, date, start_time) already has a booking.
func (r *TimeslotRepository) IsSlotTaken(locationID uint, date, startTime time.Time) (bool, error) {
	var count int64
	err := r.db.Model(&models.Timeslots{}).
		Where("location_id = ? AND date = ? AND start_time = ? AND booking_id IS NOT NULL",
			locationID, date.Format("2006-01-02"), startTime).
		Count(&count).Error
	return count > 0, err
}

func (r *TimeslotRepository) Create(ts *models.Timeslots) error {
	return r.db.Create(ts).Error
}

func (r *TimeslotRepository) Update(ts *models.Timeslots) error {
	return r.db.Save(ts).Error
}

func (r *TimeslotRepository) CreateAddon(addon *models.BookingTimeslotAddons) error {
	return r.db.Create(addon).Error
}

func (r *TimeslotRepository) FindStatusByName(name string) (*models.TimeslotStatuses, error) {
	var status models.TimeslotStatuses
	err := r.db.Where("status = ?", name).First(&status).Error
	return &status, err
}
