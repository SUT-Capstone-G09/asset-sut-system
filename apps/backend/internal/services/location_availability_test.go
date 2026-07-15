package services

import "testing"

func TestFreeMinutesInWindow_NoBookings_WholeWindowFree(t *testing.T) {
	got := freeMinutesInWindow(nil)
	want := fullDayEndMinute - fullDayStartMinute // 14h = 840min
	if got != want {
		t.Errorf("got %d, want %d", got, want)
	}
}

func TestFreeMinutesInWindow_FourDisjointTwoHourMeetings_StillHasSixHoursFree(t *testing.T) {
	// The exact regression this guards against: 4 x 2h meetings sum to 8
	// booked hours (>= the old flat 8h "full" threshold) but leave 6h
	// genuinely free — must NOT be reported as full.
	booked := [][2]int{
		{7*60 + 0, 9 * 60},   // 07:00-09:00
		{10*60 + 0, 12 * 60}, // 10:00-12:00
		{13*60 + 0, 15 * 60}, // 13:00-15:00
		{16*60 + 0, 18 * 60}, // 16:00-18:00
	}
	got := freeMinutesInWindow(booked)
	want := 6 * 60 // 6h free (21:00-18:00 plus the three 1h gaps between meetings)
	if got != want {
		t.Errorf("got %d minutes free, want %d", got, want)
	}
	if got < minBookableFreeMinutes {
		t.Error("6h free must clear the minBookableFreeMinutes threshold — day must not be marked full")
	}
}

func TestFreeMinutesInWindow_OverlappingBookings_NotDoubleCounted(t *testing.T) {
	// Two overlapping ranges covering 07:00-11:00 total must count as 4h
	// booked, not 4h+3h=7h if summed naively instead of merged.
	booked := [][2]int{
		{7 * 60, 11 * 60}, // 07:00-11:00
		{9 * 60, 12 * 60}, // 09:00-12:00 (overlaps the first)
	}
	got := freeMinutesInWindow(booked)
	want := (fullDayEndMinute - fullDayStartMinute) - (12*60 - 7*60) // window minus merged 07:00-12:00
	if got != want {
		t.Errorf("got %d, want %d (overlap must be merged, not double-counted)", got, want)
	}
}

func TestFreeMinutesInWindow_FullyBooked_ZeroFree(t *testing.T) {
	booked := [][2]int{{fullDayStartMinute, fullDayEndMinute}}
	if got := freeMinutesInWindow(booked); got != 0 {
		t.Errorf("got %d, want 0", got)
	}
}

func TestFreeMinutesInWindow_RangeOutsideWindow_Clipped(t *testing.T) {
	// A booking that spills outside 07:00-21:00 (e.g. the odd overnight data
	// seen in practice) must be clipped to the window, not counted in full.
	booked := [][2]int{{0, 6 * 60}, {21*60 + 30, 23 * 60}}
	got := freeMinutesInWindow(booked)
	want := fullDayEndMinute - fullDayStartMinute // both ranges fall entirely outside the window
	if got != want {
		t.Errorf("got %d, want %d (out-of-window ranges shouldn't consume any window time)", got, want)
	}
}

func TestFreeMinutesInWindow_SmallGapBelowThreshold_CountsAsFull(t *testing.T) {
	// Only a 15-minute gap remains — below minBookableFreeMinutes, so the
	// caller should treat this day as full even though it's not literally 0.
	booked := [][2]int{{fullDayStartMinute, fullDayEndMinute - 15}}
	got := freeMinutesInWindow(booked)
	if got != 15 {
		t.Errorf("got %d, want 15", got)
	}
	if got >= minBookableFreeMinutes {
		t.Error("15 minutes must be below minBookableFreeMinutes")
	}
}
