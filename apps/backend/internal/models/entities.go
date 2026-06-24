package models

var AllEntities = []any{
	// User management
	&Users{},
	&RequesterTypes{},
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

	// Email
	&EmailTemplate{},
	&EmailBroadcast{},
	&EmailOutbox{},

	//Envelope
	&DocumentEnvelopes{},
	&EnvelopeOrders{},
	&EnvelopePayments{},
	&OrderDeliveries{},
	&Receipts{},
}
