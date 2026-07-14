//go:build integration

// Integration test for the race-condition fix in BookingService.Create
// (Locations row lock + locked overlap check inside a single transaction).
// A mocked/sqlite-backed test can't exercise real Postgres row locks or
// transaction isolation, so this hits an actual Postgres instance.
//
// Run with:
//
//	docker compose -f docker-compose.test.yml up -d --wait
//	go test -tags=integration ./internal/services/... -run TestBookingCreate_Concurrent -v
//	docker compose -f docker-compose.test.yml down -v
//
// Connection is configured via TEST_DB_HOST/PORT/USER/PASSWORD/NAME env vars,
// defaulting to match docker-compose.test.yml.
package services

import (
	"fmt"
	"os"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func getEnvOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// setupConcurrencyTestDB connects to the local test Postgres instance and
// resets it to a clean, empty schema before AutoMigrate-ing every model, so
// each test run is isolated and repeatable regardless of what a previous run
// left behind. The schema (and the connection) is torn down again via
// t.Cleanup once the test finishes.
func setupConcurrencyTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		getEnvOrDefault("TEST_DB_HOST", "localhost"),
		getEnvOrDefault("TEST_DB_PORT", "5433"),
		getEnvOrDefault("TEST_DB_USER", "testuser"),
		getEnvOrDefault("TEST_DB_PASSWORD", "testpass"),
		getEnvOrDefault("TEST_DB_NAME", "asset_sut_test"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		t.Fatalf("connect to test postgres (is `docker compose -f docker-compose.test.yml up -d --wait` running?): %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("get *sql.DB: %v", err)
	}
	sqlDB.SetMaxOpenConns(20) // comfortably above the concurrency level below

	// Clean slate: drop and recreate the schema instead of hand-listing
	// tables to truncate, so this stays correct as models evolve.
	if err := db.Exec("DROP SCHEMA public CASCADE").Error; err != nil {
		t.Fatalf("drop schema: %v", err)
	}
	if err := db.Exec("CREATE SCHEMA public").Error; err != nil {
		t.Fatalf("create schema: %v", err)
	}
	// Areas (and other UUIDBase models) default their PK to gen_random_uuid(),
	// which needs pgcrypto.
	if err := db.Exec(`CREATE EXTENSION IF NOT EXISTS pgcrypto`).Error; err != nil {
		t.Fatalf("create pgcrypto extension: %v", err)
	}

	if err := db.AutoMigrate(models.AllEntities...); err != nil {
		t.Fatalf("automigrate: %v", err)
	}

	t.Cleanup(func() {
		db.Exec("DROP SCHEMA public CASCADE")
		db.Exec("CREATE SCHEMA public")
		sqlDB.Close()
	})

	return db
}

type concurrencyFixture struct {
	locationID uint
	userIDs    []uint
}

// seedConcurrencyFixture creates exactly the lookup rows and one Location
// BookingService.Create needs, plus one distinct User per concurrent
// requester (so the race is over the room/slot, not over a shared user row).
// Pricing tiers are deliberately left unseeded: calculatePrice degrades to a
// price of 0 with no tiers configured, which is irrelevant to this test.
func seedConcurrencyFixture(t *testing.T, db *gorm.DB, userCount int) concurrencyFixture {
	t.Helper()

	locType := models.LocationTypes{Type: "concurrency-test-room-type"}
	if err := db.Create(&locType).Error; err != nil {
		t.Fatalf("seed location type: %v", err)
	}
	locStatus := models.LocationStatuses{Status: "available"}
	if err := db.Create(&locStatus).Error; err != nil {
		t.Fatalf("seed location status: %v", err)
	}
	if err := db.Create(&models.BookingStatuses{Status: "pending"}).Error; err != nil {
		t.Fatalf("seed booking status: %v", err)
	}
	if err := db.Create(&models.TimeslotStatuses{Status: "available"}).Error; err != nil {
		t.Fatalf("seed timeslot status: %v", err)
	}

	location := models.Locations{
		Name:     "Concurrency Test Room",
		TypeID:   locType.ID,
		StatusID: locStatus.ID,
		Capacity: 10,
	}
	if err := db.Create(&location).Error; err != nil {
		t.Fatalf("seed location: %v", err)
	}

	userIDs := make([]uint, userCount)
	for i := 0; i < userCount; i++ {
		u := models.Users{
			Email:        fmt.Sprintf("racer-%d@example.test", i),
			Password:     "irrelevant",
			AuthProvider: "local",
			ProviderID:   fmt.Sprintf("racer-%d", i),
			IsActive:     true,
		}
		if err := db.Create(&u).Error; err != nil {
			t.Fatalf("seed user %d: %v", i, err)
		}
		userIDs[i] = u.ID
	}

	return concurrencyFixture{locationID: location.ID, userIDs: userIDs}
}

func newConcurrencyBookingService(db *gorm.DB) *BookingService {
	return NewBookingService(
		repositories.NewBookingRepository(db),
		repositories.NewTimeslotRepository(db),
		repositories.NewLocationRepository(db),
		repositories.NewInvoiceRepository(db),
		repositories.NewRequesterRepository(db),
		nil, // storage service is only used for document presigned URLs; this
		// booking never attaches documents, so it's never dereferenced.
	)
}

// TestBookingCreate_ConcurrentOverlappingRequests_OnlyOneSucceeds fires N
// concurrent BookingService.Create calls at the exact same room and an
// identical (therefore maximally overlapping) time range, and asserts the
// Locations-row-lock + locked-overlap-check fix lets exactly one through.
func TestBookingCreate_ConcurrentOverlappingRequests_OnlyOneSucceeds(t *testing.T) {
	db := setupConcurrencyTestDB(t)

	const concurrency = 10
	fixture := seedConcurrencyFixture(t, db, concurrency)
	bookingService := newConcurrencyBookingService(db)

	bookingDate := time.Now().AddDate(0, 0, MinBookingLeadDays+3)
	bookingDate = time.Date(bookingDate.Year(), bookingDate.Month(), bookingDate.Day(), 0, 0, 0, 0, time.UTC)
	// StartTime/EndTime are stored in a Postgres TIME (no date) column — the
	// year/month/day here are discarded, only the clock time matters.
	slotStart := time.Date(2000, 1, 1, 10, 0, 0, 0, time.UTC)
	slotEnd := time.Date(2000, 1, 1, 12, 0, 0, 0, time.UTC)

	req := dto.CreateBookingRequest{
		Purpose: "concurrency race test",
		Timeslots: []dto.TimeslotInput{
			{
				LocationID: fixture.locationID,
				Date:       bookingDate,
				StartTime:  slotStart,
				EndTime:    slotEnd,
				IsFullDay:  false,
			},
		},
	}

	type result struct {
		userID uint
		res    *dto.BookingResponse
		err    error
	}

	ready := make(chan struct{}, concurrency)
	start := make(chan struct{})
	results := make(chan result, concurrency)
	var wg sync.WaitGroup

	for i := 0; i < concurrency; i++ {
		wg.Add(1)
		go func(userID uint) {
			defer wg.Done()
			ready <- struct{}{} // signal this goroutine is parked and ready
			<-start             // ...then block until every goroutine fires together
			res, err := bookingService.Create(userID, req)
			results <- result{userID: userID, res: res, err: err}
		}(fixture.userIDs[i])
	}

	for i := 0; i < concurrency; i++ {
		<-ready // wait for all goroutines to be parked at the gate
	}
	close(start) // release them all at once
	wg.Wait()
	close(results)

	var succeeded, failed int
	for r := range results {
		if r.err == nil {
			succeeded++
			if r.res == nil {
				t.Errorf("user %d: nil error but also nil response", r.userID)
			}
		} else {
			failed++
			if !strings.Contains(r.err.Error(), "already taken") {
				t.Errorf("user %d: expected an 'already taken' overlap error, got: %v", r.userID, r.err)
			}
		}
	}

	if succeeded != 1 {
		t.Errorf("expected exactly 1 successful booking, got %d", succeeded)
	}
	if failed != concurrency-1 {
		t.Errorf("expected %d failed bookings, got %d", concurrency-1, failed)
	}

	// Double-check against the database directly, not just the returned
	// errors — this would catch a broken lock that let two goroutines each
	// believe they succeeded and both commit.
	var bookingCount int64
	if err := db.Model(&models.Bookings{}).Count(&bookingCount).Error; err != nil {
		t.Fatalf("count bookings: %v", err)
	}
	if bookingCount != 1 {
		t.Errorf("expected exactly 1 row in bookings, got %d", bookingCount)
	}

	var timeslotCount int64
	if err := db.Model(&models.Timeslots{}).
		Where("location_id = ? AND booking_id IS NOT NULL", fixture.locationID).
		Count(&timeslotCount).Error; err != nil {
		t.Fatalf("count timeslots: %v", err)
	}
	if timeslotCount != 1 {
		t.Errorf("expected exactly 1 booked timeslot row for the location, got %d", timeslotCount)
	}
}
