package models

var AllEntities = []any{
	// User management
	&Users{},
	&Admins{},
	&Staffs{},
	&RequesterTypes{},
	&Requesters{},
	&Roles{},
	&Permissions{},
	&RefreshTokens{},

	// Location
	&LocationTypes{},
	&LocationStatuses{},
	&Locations{},
	&StaffLocations{},
	&LocationUnavailabilities{},
	&Equipments{},
	&LocationEquipments{},
	&ChargeTypes{},
	&LocationAddons{},
	&RateTypes{},
	&LocationPricingTiers{},

	// Booking
	&BookingStatuses{},
	&Bookings{},
	&BookingStatusLogs{},
	&TimeslotStatuses{},
	&Timeslots{},
	&BookingTimeslotAddons{},

	// Payment
	&InvoiceStatuses{},
	&Invoices{},
	&PaymentMethods{},
	&PaymentStatuses{},
	&PaymentTransactions{},

	// Document
	&DocumentTypes{},
	&Methods{},
	&Documents{},
	// Payment QR feature. Invoice before Payment so the invoices table exists
	// first. Only these two payment-domain models have GORM-valid FK columns;
	// the rest (booking, document, ...) are not migrated yet.

	// Admin-managed email templates (no FK columns; safe to migrate on its own).
	&EmailTemplate{},

	// Bulk email: a broadcast (campaign) and its durable per-recipient outbox.
	// BroadcastID is a plain uint, not a GORM-managed FK, so these migrate alone.
	&EmailBroadcast{},
	&EmailOutbox{},
}
