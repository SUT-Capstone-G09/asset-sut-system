package services

import (
	"testing"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
)

const (
	testRequesterTypeID = uint(1)
	officeRatePrice     = 200
	offPeakRatePrice    = 300
)

func clockTime(hour, minute int) time.Time {
	return time.Date(2026, 7, 13, hour, minute, 0, 0, time.UTC)
}

func testLocation(withOffPeak bool) *models.Locations {
	hourly := &models.RateTypes{Type: "hourly"}
	daily := &models.RateTypes{Type: "daily"}
	tiers := []models.LocationPricingTiers{
		{RequesterTypeID: testRequesterTypeID, RateType: hourly, Price: officeRatePrice},
		{RequesterTypeID: testRequesterTypeID, RateType: daily, Price: 1200},
	}
	if withOffPeak {
		offpeak := &models.RateTypes{Type: "hourly_offpeak"}
		tiers = append(tiers, models.LocationPricingTiers{
			RequesterTypeID: testRequesterTypeID, RateType: offpeak, Price: offPeakRatePrice,
		})
	}
	return &models.Locations{PricingTiers: tiers}
}

func TestCalculatePrice_FullyInsideOfficeHours(t *testing.T) {
	loc := testLocation(true)
	ts := dto.TimeslotInput{StartTime: clockTime(9, 0), EndTime: clockTime(11, 0)}
	got := calculatePrice(loc, ts, testRequesterTypeID)
	want := 2 * officeRatePrice
	if got != want {
		t.Errorf("got %d, want %d", got, want)
	}
}

func TestCalculatePrice_FullyOutsideOfficeHours(t *testing.T) {
	loc := testLocation(true)
	ts := dto.TimeslotInput{StartTime: clockTime(17, 0), EndTime: clockTime(19, 0)}
	got := calculatePrice(loc, ts, testRequesterTypeID)
	want := 2 * offPeakRatePrice
	if got != want {
		t.Errorf("got %d, want %d", got, want)
	}
}

func TestCalculatePrice_StraddlesBoundary_Prorated(t *testing.T) {
	loc := testLocation(true)
	// 15:00-19:00: 1.5h office (15:00-16:30) + 2.5h off-peak (16:30-19:00)
	ts := dto.TimeslotInput{StartTime: clockTime(15, 0), EndTime: clockTime(19, 0)}
	got := calculatePrice(loc, ts, testRequesterTypeID)
	want := int(1.5*officeRatePrice + 2.5*offPeakRatePrice)
	if got != want {
		t.Errorf("got %d, want %d", got, want)
	}
}

func TestCalculatePrice_FractionalHours_NotTruncated(t *testing.T) {
	loc := testLocation(true)
	// 9:00-11:30 = 2.5h, fully inside office hours.
	ts := dto.TimeslotInput{StartTime: clockTime(9, 0), EndTime: clockTime(11, 30)}
	got := calculatePrice(loc, ts, testRequesterTypeID)
	want := int(2.5 * officeRatePrice)
	if got != want {
		t.Errorf("got %d, want %d (must not truncate to 2h)", got, want)
	}
}

func TestCalculatePrice_NoOffPeakTierConfigured_FallsBackToOfficeRate(t *testing.T) {
	loc := testLocation(false)
	ts := dto.TimeslotInput{StartTime: clockTime(17, 0), EndTime: clockTime(19, 0)}
	got := calculatePrice(loc, ts, testRequesterTypeID)
	want := 2 * officeRatePrice
	if got != want {
		t.Errorf("got %d, want %d", got, want)
	}
}

func TestCalculatePrice_OverFourHours_UsesDailyFlatRegardlessOfTimeOfDay(t *testing.T) {
	loc := testLocation(true)
	// 14:00-19:00 = 5h, straddles the boundary but should use the flat daily rate.
	ts := dto.TimeslotInput{StartTime: clockTime(14, 0), EndTime: clockTime(19, 0)}
	got := calculatePrice(loc, ts, testRequesterTypeID)
	if got != 1200 {
		t.Errorf("got %d, want 1200 (daily flat rate)", got)
	}
}

func TestCalculatePrice_IsFullDayFlagIgnored_ShortSlotNotBilledDailyRate(t *testing.T) {
	loc := testLocation(true)
	// Client claims IsFullDay on a 1-hour slot — must be billed as a normal
	// 1h office-hours booking, not the 1200 daily flat rate.
	ts := dto.TimeslotInput{StartTime: clockTime(9, 0), EndTime: clockTime(10, 0), IsFullDay: true}
	got := calculatePrice(loc, ts, testRequesterTypeID)
	want := officeRatePrice
	if got != want {
		t.Errorf("got %d, want %d (IsFullDay flag must not override actual duration)", got, want)
	}
}

func TestCalculatePrice_ActualFullDayWindow_UsesDailyRateEvenIfFlagFalse(t *testing.T) {
	loc := testLocation(true)
	// Times span exactly 07:00-21:00 but the client didn't set IsFullDay —
	// full-day pricing must still be derived from the actual time span.
	ts := dto.TimeslotInput{StartTime: clockTime(7, 0), EndTime: clockTime(21, 0), IsFullDay: false}
	got := calculatePrice(loc, ts, testRequesterTypeID)
	if got != 1200 {
		t.Errorf("got %d, want 1200 (daily flat rate derived from time span)", got)
	}
}

func TestCalculatePrice_NoHourlyTierConfigured_ReturnsZeroNotArbitraryTier(t *testing.T) {
	daily := &models.RateTypes{Type: "daily"}
	loc := &models.Locations{PricingTiers: []models.LocationPricingTiers{
		{RequesterTypeID: testRequesterTypeID, RateType: daily, Price: 1200},
	}}
	// 2h booking, but the location only has a "daily" tier — no "hourly" tier
	// to prorate against. Must not silently bill the daily price as if it
	// were an hourly rate.
	ts := dto.TimeslotInput{StartTime: clockTime(9, 0), EndTime: clockTime(11, 0)}
	got := calculatePrice(loc, ts, testRequesterTypeID)
	if got != 0 {
		t.Errorf("got %d, want 0 (no hourly tier configured)", got)
	}
}
