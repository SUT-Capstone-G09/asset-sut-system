package models

var AllEntities = []any{
	// User management
	&Users{},
	&Profiles{},
	&RequesterTypes{},
	&Profiles{},
	&Roles{},
	&Permissions{},
	&RefreshTokens{},
	&UserSignatures{},

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
	&HallFloorPlans{},
	&HallUsagePurposes{},

	// Commercial Leasing / Area
	&BuildingTypes{},
	&Buildings{},
	&BuildingHallPricings{}, // ราคาโถงราย อาคาร × วัตถุประสงค์ (อ้าง Buildings + HallUsagePurposes)
	&LocationHallPricings{}, // ราคาเฉพาะโถง (ทำเลทอง) ราย โถง × วัตถุประสงค์ — override ราคาอาคาร
	&RentalSpaces{},
	&RentalSpaceImages{},
	&RentalSpaceTags{},
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
	&BookingPurposes{},

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

	// Requests
	&Requests{},
	&ActionHistories{},
	&RequestTypes{},
	&ChatMessage{},
	&RequestStatus{},
	// Tenant
	&TenantProfiles{},
	&TenantContacts{},
	&TenantKYC{},

	// Contract
	&BusinessTypes{},
	&Contracts{},
	&ContractHistory{},
	&ContractInvoices{},
	&ContractRenewalRequests{},
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
