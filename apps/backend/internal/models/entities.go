package models

var AllEntities = []any {
	&Users{},

	&Admins{},
	&Staffs{},
	&RequesterTypes{},
	&Requesters{},

	&Roles{},
	&Permissions{},

	&LocationTypes{},
	&LocationStatuses{},
	&Locations{},

	&StaffLocations{},

	&RateTypes{},
	&LocationPricingTier{},

	&LocationUavailabilities{},
	&ChargeTypes{},
	&LocationAddons{},

	&BookingStatuses{},
	&Bookings{},

	&TimeSlotStatuses{},
	&TimeSlots{},

	&BookingTimeslotAddons{},

	&Equipments{},
	&LocationEquipments{},

	&DocumentTypes{},
	&DocumentMethods{},
	&Documents{},

	&InvoiceStatuses{},
	&Invoices{},
	&PaymentStatuses{},
	&PaymentMethods{},
	&PaymentTransactions{},
}