package repositories

import (
	"fmt"
	"time"

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

// DB exposes the underlying *gorm.DB so the service layer can open a
// transaction spanning multiple repositories (see BookingService.Create).
// Repository constructors already accept any *gorm.DB, including a *gorm.DB
// handed back from Transaction(), so tx-scoped repos are built the same way
// as the normal ones.
func (r *BookingRepository) DB() *gorm.DB {
	return r.db
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
		Preload("Purposes.HallUsagePurpose"). // วัตถุประสงค์โถง (+ เซลล์ที่เลือก) เพื่อแสดงในหน้า admin
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
		Preload("Purposes.HallUsagePurpose"). // วัตถุประสงค์โถง (+ เซลล์ที่เลือก) สำหรับ my-bookings
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
		Preload("Purposes.HallUsagePurpose").
		First(&booking, id).Error
	return &booking, err
}

func (r *BookingRepository) Create(booking *models.Bookings) error {
	return r.db.Create(booking).Error
}

// FindHallPurposesByIDs โหลด master data ของวัตถุประสงค์ตาม id ที่ผู้ขอเลือก
func (r *BookingRepository) FindHallPurposesByIDs(ids []uint) ([]models.HallUsagePurposes, error) {
	var purposes []models.HallUsagePurposes
	if len(ids) == 0 {
		return purposes, nil
	}
	err := r.db.Where("id IN ?", ids).Find(&purposes).Error
	return purposes, err
}

// FindBuildingHallPricings โหลดตารางราคาโถงของอาคารหนึ่ง (ทุกวัตถุประสงค์) เพื่อ resolve ราคาต่อหน่วยตอนคิดเงิน
func (r *BookingRepository) FindBuildingHallPricings(buildingID uint) ([]models.BuildingHallPricings, error) {
	var pricings []models.BuildingHallPricings
	err := r.db.Where("building_id = ?", buildingID).Find(&pricings).Error
	return pricings, err
}

// FindLocationHallPricings โหลดราคาเฉพาะโถง (ทำเลทอง) ของโถงหนึ่ง — override ราคาอาคารตอนคิดเงิน
// ไม่มีแถว = โถงนี้ใช้ราคาอาคารตามปกติ
func (r *BookingRepository) FindLocationHallPricings(locationID uint) ([]models.LocationHallPricings, error) {
	var pricings []models.LocationHallPricings
	err := r.db.Where("location_id = ?", locationID).Find(&pricings).Error
	return pricings, err
}

// FindBookedCells คืนเซลล์ (ผังบูธ) ที่ถูกจองแล้วในโถงหนึ่ง สำหรับชุดวันที่กำหนด (union ไม่ซ้ำ)
// นับเฉพาะ booking ที่ยัง active (สถานะไม่ใช่ cancelled/rejected) และวัตถุประสงค์แบบ per_sqm
// ใช้ทั้งฝั่งแสดงผัง (ผู้ขอเห็นเซลล์ที่ไม่ว่าง) และตอน validate ตอนสร้าง booking กันจองทับ
func (r *BookingRepository) FindBookedCells(locationID uint, dates []time.Time) ([][]int, error) {
	if len(dates) == 0 {
		return [][]int{}, nil
	}
	dateStrs := make([]string, len(dates))
	for i, d := range dates {
		dateStrs[i] = d.Format("2006-01-02")
	}

	// หา booking ที่มี timeslot ในโถงนี้ตรงวันที่ขอ และสถานะยัง active
	var bookingIDs []uint
	if err := r.db.Model(&models.Timeslots{}).
		Joins("JOIN bookings ON bookings.id = timeslots.booking_id").
		Joins("JOIN booking_statuses ON booking_statuses.id = bookings.status_id").
		Where("timeslots.location_id = ? AND timeslots.booking_id IS NOT NULL AND timeslots.date IN ?", locationID, dateStrs).
		Where("booking_statuses.status NOT IN ?", []string{"cancelled", "rejected"}).
		Where("bookings.deleted_at IS NULL").
		Distinct().
		Pluck("timeslots.booking_id", &bookingIDs).Error; err != nil {
		return nil, err
	}
	if len(bookingIDs) == 0 {
		return [][]int{}, nil
	}

	var purposes []models.BookingPurposes
	if err := r.db.Where("booking_id IN ? AND pricing_model = ?", bookingIDs, "per_sqm").
		Find(&purposes).Error; err != nil {
		return nil, err
	}

	seen := make(map[string]struct{})
	cells := make([][]int, 0)
	for _, p := range purposes {
		for _, c := range p.SelectedCells {
			if len(c) < 2 {
				continue
			}
			key := fmt.Sprintf("%d,%d", c[0], c[1])
			if _, ok := seen[key]; ok {
				continue
			}
			seen[key] = struct{}{}
			cells = append(cells, []int{c[0], c[1]})
		}
	}
	return cells, nil
}

// CreatePurposes บันทึกแถว BookingPurposes ที่คำนวณราคาแล้ว
func (r *BookingRepository) CreatePurposes(purposes []models.BookingPurposes) error {
	if len(purposes) == 0 {
		return nil
	}
	return r.db.Create(&purposes).Error
}

// DeletePurposesByBookingID soft-delete วัตถุประสงค์เดิมของ booking (ใช้ตอน revise; เก็บเป็นประวัติ)
func (r *BookingRepository) DeletePurposesByBookingID(bookingID uint) error {
	return r.db.Where("booking_id = ?", bookingID).Delete(&models.BookingPurposes{}).Error
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

func (r *BookingRepository) FindStatusByID(id uint) (*models.BookingStatuses, error) {
	var status models.BookingStatuses
	err := r.db.First(&status, id).Error
	return &status, err
}

func (r *BookingRepository) UpdateBookingExpenses(bookingID uint, addons []models.BookingTimeslotAddons, basePrice float64, addonPrice float64, totalPrice float64) error {
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
			"base_price":  basePrice,
			"addon_price": addonPrice,
			"total_price": totalPrice,
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
