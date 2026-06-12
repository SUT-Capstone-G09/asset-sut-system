package models

var AllEntities = []any{
	&Users{},
	&Admins{},
	&Staffs{},
	&RequesterTypes{},
	&Requesters{},
	&Roles{},
	&Permissions{},

	&RefreshTokens{},

	// Payment QR feature. Invoice before Payment so the invoices table exists
	// first. Only these two payment-domain models have GORM-valid FK columns;
	// the rest (booking, document, ...) are not migrated yet.
	&Invoice{},
	&Payment{},

	// Admin-managed email templates (no FK columns; safe to migrate on its own).
	&EmailTemplate{},

	// Bulk email: a broadcast (campaign) and its durable per-recipient outbox.
	// BroadcastID is a plain uint, not a GORM-managed FK, so these migrate alone.
	&EmailBroadcast{},
	&EmailOutbox{},
}
