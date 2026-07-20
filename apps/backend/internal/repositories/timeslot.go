package repositories

import (
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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

// rejectedOrCancelledBookingIDs is a subquery selecting the IDs of bookings
// that no longer actually occupy their timeslots. Once a booking is rejected
// or cancelled, nothing else in this codebase clears its timeslots'
// booking_id — so every slot-availability query must exclude these statuses
// explicitly, or a rejected/cancelled booking permanently squats on its slot.
func (r *TimeslotRepository) rejectedOrCancelledBookingIDs() *gorm.DB {
	return r.db.Table("bookings").
		Select("bookings.id").
		Joins("JOIN booking_statuses ON booking_statuses.id = bookings.status_id").
		Where("booking_statuses.status IN ?", []string{"rejected", "cancelled"})
}

// LockOverlapping returns (and row-locks) any existing, booked timeslots for
// locationID on date that overlap [startTime, endTime). Intended for use
// inside a transaction that already holds the parent location's FOR UPDATE
// lock (see LocationRepository.LockByID) — that lock is what actually closes
// the race; this lock is defense-in-depth and satisfies "SELECT ... FOR
// UPDATE during the overlap check" directly.
//
// start_time/end_time are stored as `type:time` (clock-time only, no date
// component), so the date column must be filtered explicitly here — without
// it, two bookings on entirely different dates whose clock-times happen to
// overlap would be reported as conflicting.
func (r *TimeslotRepository) LockOverlapping(locationID uint, date, startTime, endTime time.Time) ([]models.Timeslots, error) {
	var slots []models.Timeslots
	err := r.db.
		Clauses(clause.Locking{Strength: "UPDATE"}).
		Where(`location_id = ? AND date = ? AND booking_id IS NOT NULL AND start_time < ? AND end_time > ? AND booking_id NOT IN (?)`,
			locationID, date.Format("2006-01-02"), endTime, startTime, r.rejectedOrCancelledBookingIDs()).
		Find(&slots).Error
	return slots, err
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

// FindBookedSlotsByMonth returns all booked timeslots for a location within a given month.
// Filters on the `date` column (not start_time) to match FindByLocationAndDate/
// LockOverlapping in this file — date is what actually determines which
// calendar cell a booking belongs to, and doesn't depend on start_time's date
// component staying in sync with it.
func (r *TimeslotRepository) FindBookedSlotsByMonth(locationID uint, year, month int) ([]models.Timeslots, error) {
	bkk, _ := time.LoadLocation("Asia/Bangkok")
	start := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, bkk)
	end := start.AddDate(0, 1, 0)
	var slots []models.Timeslots
	err := r.db.
		Where("location_id = ? AND date >= ? AND date < ? AND booking_id IS NOT NULL AND booking_id NOT IN (?)",
			locationID, start.Format("2006-01-02"), end.Format("2006-01-02"), r.rejectedOrCancelledBookingIDs()).
		Find(&slots).Error
	return slots, err
}
