package models

import "gorm.io/gorm"

// EmailTemplate is an admin-managed email template stored in the database. When an
// active row exists for a given Key, EmailService prefers it over the code-defined
// template of the same key, letting admins edit emails without a deploy.
//
// ProjectData holds the raw GrapesJS editor JSON (so the template can be reopened
// and edited); CompiledHTML is the rendered HTML actually used when sending. Both
// support {{.var}} placeholders that are interpolated at send time.
type EmailTemplate struct {
	gorm.Model
	Key          string `gorm:"uniqueIndex;not null" json:"key"`
	Name         string `gorm:"not null" json:"name"`
	Subject      string `gorm:"not null" json:"subject"`
	ProjectData  string `gorm:"type:text" json:"project_data"`
	CompiledHTML string `gorm:"type:text" json:"compiled_html"`
	IsActive     bool   `gorm:"not null;default:true" json:"is_active"`
}
