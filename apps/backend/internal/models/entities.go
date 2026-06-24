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

	// Area
	&Buildings{},
	&Areas{},
	&AreaImages{},
	&AreaTags{},
	&FloorPlans{},
	&MapLayers{},
	&MapElements{},

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
	// Evaluation
	&GradeSettings{},
	&EvaluationCriteria{},
	&Evaluations{},
	&EvaluationsDetail{},

	// News
	&NewsCategories{},
	&NewsAnnouncements{},
	&NewsLeaseOffers{},
	&NewsLogs{},
	&NewsViews{},
}
