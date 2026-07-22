package seeder

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

// ────────────────────────────────────────────────────────────────────────────
// seedHistoricalBookings creates randomised booking records spread over the
// past 12 months so that the dashboard usage chart displays realistic data.
// It picks random users, locations, statuses, time-windows and addons.
// ────────────────────────────────────────────────────────────────────────────

var historicalPurposes = []string{
	"ประชุมทีมพัฒนาซอฟต์แวร์",
	"อบรมเชิงปฏิบัติการ IoT",
	"สัมมนาวิชาการประจำภาค",
	"นำเสนอโครงงานปริญญาตรี",
	"ประชุมกรรมการบริหาร",
	"Workshop การเขียน Proposal",
	"จัดกิจกรรมรับน้องใหม่",
	"ซ้อมดนตรีวง SUT Band",
	"ประชุมผู้ปกครอง",
	"จัดนิทรรศการผลงานนักศึกษา",
	"อบรม First Aid เบื้องต้น",
	"ประชุมคณะกรรมการหลักสูตร",
	"สอบสัมภาษณ์รับบุคลากร",
	"จัดเลี้ยงงานเกษียณ",
	"ประชุมวิจัยร่วมกับภาคเอกชน",
	"อบรมทักษะภาษาอังกฤษ",
	"เตรียมงาน Open House",
	"ถ่ายทำสารคดีมหาวิทยาลัย",
	"ประชุมแผนยุทธศาสตร์",
	"จัดแข่งขัน Hackathon",
}

// requester emails that have been seeded (worawut + user@example.com)
var historicalEmails = []string{
	"worawut@gmail.com",
	"user@example.com",
}

func seedHistoricalBookings(db *gorm.DB, cfg *config.Config) error {
	// ── lookup statuses ────────────────────────────────────────
	statusNames := []string{"pending", "approved", "rejected", "cancelled", "completed"}
	statusMap := make(map[string]uint)
	for _, name := range statusNames {
		var s models.BookingStatuses
		if err := db.Where("status = ?", name).First(&s).Error; err != nil {
			return fmt.Errorf("booking status %q not found: %w", name, err)
		}
		statusMap[name] = s.ID
	}

	var tsAvailable models.TimeslotStatuses
	if err := db.Where("status = ?", "booked").First(&tsAvailable).Error; err != nil {
		return fmt.Errorf("timeslot status 'booked' not found: %w", err)
	}

	// ── lookup users ───────────────────────────────────────────
	var users []models.Users
	for _, email := range historicalEmails {
		var u models.Users
		if err := db.Where("email = ?", email).First(&u).Error; err != nil {
			log.Printf("User %s not found, skipping for historical bookings", email)
			continue
		}
		users = append(users, u)
	}
	if len(users) == 0 {
		log.Println("No users found for historical bookings, skipping.")
		return nil
	}

	// ── lookup locations ───────────────────────────────────────
	var locations []models.Locations
	if err := db.Find(&locations).Error; err != nil {
		return err
	}
	if len(locations) == 0 {
		log.Println("No locations found, skipping historical bookings.")
		return nil
	}

	// ── lookup addons (master addons with location_id IS NULL) ─
	var masterAddons []models.LocationAddons
	if err := db.Where("location_id IS NULL").Find(&masterAddons).Error; err != nil {
		return err
	}

	// ── lookup invoice status ──────────────────────────────────
	var invoicePending models.InvoiceStatuses
	if err := db.Where("status = ?", "pending").First(&invoicePending).Error; err != nil {
		return err
	}
	var invoicePaid models.InvoiceStatuses
	if err := db.Where("status = ?", "paid").First(&invoicePaid).Error; err != nil {
		return err
	}

	// ── lookup hourly rate type ────────────────────────────────
	var hourlyRate models.RateTypes
	if err := db.Where("type = ?", "hourly").First(&hourlyRate).Error; err != nil {
		return err
	}


	// ── deterministic seed so re-runs are idempotent ───────────
	rng := rand.New(rand.NewSource(42))

	now := time.Now()

	// Status weights: more completed/approved in the past, more pending recently
	weightedStatuses := []string{
		"completed", "completed", "completed", "completed",
		"approved", "approved", "approved",
		"pending", "pending",
		"rejected",
		"cancelled",
	}

	// Typical time windows (start hour, end hour)
	timeWindows := [][2]int{
		{8, 10}, {9, 12}, {10, 12},
		{13, 15}, {13, 16}, {14, 17},
		{16, 19}, {18, 20},
	}

	totalToSeed := 80

	for i := 0; i < totalToSeed; i++ {
		// Random date in the past 12 months
		daysAgo := rng.Intn(365) + 1
		bookingDate := now.AddDate(0, 0, -daysAgo)
		dateOnly := time.Date(bookingDate.Year(), bookingDate.Month(), bookingDate.Day(), 0, 0, 0, 0, time.UTC)

		// Pick random user, location, purpose, status
		user := users[rng.Intn(len(users))]
		loc := locations[rng.Intn(len(locations))]
		purpose := historicalPurposes[rng.Intn(len(historicalPurposes))]
		status := weightedStatuses[rng.Intn(len(weightedStatuses))]
		statusID := statusMap[status]
		tw := timeWindows[rng.Intn(len(timeWindows))]

		startTime := time.Date(dateOnly.Year(), dateOnly.Month(), dateOnly.Day(), tw[0], 0, 0, 0, time.UTC)
		endTime := time.Date(dateOnly.Year(), dateOnly.Month(), dateOnly.Day(), tw[1], 0, 0, 0, time.UTC)

		// ── calculate pricing ──────────────────────────────────
		durationHours := endTime.Sub(startTime).Hours()
		var pricingTier models.LocationPricingTiers
		var basePrice float64 = 0
		if err := db.Where("location_id = ? AND rate_type_id = ?", loc.ID, hourlyRate.ID).First(&pricingTier).Error; err == nil {
			basePrice = float64(pricingTier.Price) * durationHours
		}

		// Pick 0-3 random addons
		addonCount := rng.Intn(4)
		var selectedAddons []models.LocationAddons
		if addonCount > 0 && len(masterAddons) > 0 {
			perm := rng.Perm(len(masterAddons))
			for j := 0; j < addonCount && j < len(perm); j++ {
				selectedAddons = append(selectedAddons, masterAddons[perm[j]])
			}
		}

		var addonTotal float64 = 0
		for _, a := range selectedAddons {
			addonTotal += float64(a.DefaultPrice * a.Quantity)
		}

		totalPrice := basePrice + addonTotal

		// ── idempotency: check if we already created this one ──
		// Use a unique purpose+date combo as the dedup key.
		dedupPurpose := fmt.Sprintf("[HIST-%03d] %s", i+1, purpose)

		var existing models.Bookings
		if err := db.Where("purpose = ?", dedupPurpose).First(&existing).Error; err == nil {
			continue // already seeded
		}

		// ── create booking ────────────────────────────────────
		booking := models.Bookings{
			UserID:     user.ID,
			Purpose:    dedupPurpose,
			BasePrice:  basePrice,
			AddonPrice: addonTotal,
			TotalPrice: totalPrice,
			StatusID:   statusID,
		}
		if err := db.Create(&booking).Error; err != nil {
			return fmt.Errorf("create booking %d: %w", i, err)
		}

		// Back-date created_at so charts show historical distribution
		createdAt := dateOnly.Add(time.Duration(rng.Intn(12)+8) * time.Hour) // random hour 08-19
		if err := db.Model(&booking).UpdateColumn("created_at", createdAt).Error; err != nil {
			return fmt.Errorf("backdate booking %d: %w", i, err)
		}

		// ── create timeslot ───────────────────────────────────
		ts := models.Timeslots{
			LocationID:    loc.ID,
			BookingID:     &booking.ID,
			Date:          dateOnly,
			StartTime:     startTime,
			EndTime:       endTime,
			PriceSnapshot: basePrice,
			StatusID:      tsAvailable.ID,
		}
		if err := db.Create(&ts).Error; err != nil {
			return fmt.Errorf("create timeslot %d: %w", i, err)
		}

		// Back-date timeslot created_at as well
		if err := db.Model(&ts).UpdateColumn("created_at", createdAt).Error; err != nil {
			return fmt.Errorf("backdate timeslot %d: %w", i, err)
		}

		// ── create addons for the timeslot ─────────────────────
		for _, addon := range selectedAddons {
			addonID := addon.ID
			bta := models.BookingTimeslotAddons{
				LocationAddonID: &addonID,
				TimeslotID:      ts.ID,
				Name:            addon.Name,
				AppliedPrice:    float64(addon.DefaultPrice),
				Quantity:        addon.Quantity,
				TotalPrice:      float64(addon.DefaultPrice * addon.Quantity),
			}
			if err := db.Create(&bta).Error; err != nil {
				return fmt.Errorf("create addon for booking %d: %w", i, err)
			}
		}

		// ── create booking status log ──────────────────────────
		statusLog := models.BookingStatusLogs{
			BookingID: booking.ID,
			ToStatusID:  statusID,
			ChangedBy:   user.ID,
			ChangedAt:   createdAt,
			Note:        "สร้างการจอง (seed data)",
		}
		if err := db.Create(&statusLog).Error; err != nil {
			return fmt.Errorf("create status log for booking %d: %w", i, err)
		}

		// ── create invoice (for approved/completed bookings) ───
		if status == "approved" || status == "completed" {
			invStatusID := invoicePending.ID
			if status == "completed" {
				invStatusID = invoicePaid.ID
			}
			inv := models.Invoices{
				BookingID:   booking.ID,
				StatusID:    invStatusID,
				TotalAmount: totalPrice,
			}
			if err := db.Create(&inv).Error; err != nil {
				return fmt.Errorf("create invoice for booking %d: %w", i, err)
			}
		}
	}

	log.Printf("Historical bookings seeded: %d records across the past 12 months.", totalToSeed)
	return nil
}
