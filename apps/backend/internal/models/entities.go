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

	// Tenant
	&TenantProfiles{},
	&TenantContacts{},
	&TenantKYC{},

	// Contract
	&BusinessTypes{},
	&Contracts{},
	&ContractHistory{},
	&ContractInvoices{},
}
