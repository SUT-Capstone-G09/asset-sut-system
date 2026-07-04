package models

import "time"

type Evaluations struct {
	StringBase
	UserID string `gorm:"type:varchar(255);not null" json:"user_id"`
	GradeSettingID uint `gorm:"not null" json:"grade_setting_id"`
	TotalScore     int       `gorm:"not null;default:0" json:"total_score"`
	AdditionalNote  string    `gorm:"type:text" json:"additional_note"`
	InspectionDate time.Time `gorm:"type:date" json:"inspection_date"`
	EvaluationDetails []EvaluationsDetail `gorm:"foreignKey:EvaluationID"`
}

type EvaluationsDetail struct {
	Base
	EvaluationCriteriaID uint `gorm:"not null" json:"criteria_id"`
	EvaluationID string `gorm:"type:varchar(255);not null" json:"evaluation_id"`
	Score *int `gorm:"default:null" json:"score"`
}

type EvaluationCriteria struct {
	Base
	CriteriaName string `gorm:"type:varchar(255);not null" json:"criteria_name"`
	MaxScore int `gorm:"not null" json:"max_score"`
	Category     string `gorm:"type:varchar(100);not null;index" json:"category"`
}

type GradeSettings struct {
	Base
	GradeName string `gorm:"type:varchar(255);not null" json:"grade_name"`
	MinScore int `gorm:"not null" json:"min_score"`
	MaxScore int `gorm:"not null" json:"max_score"`

	Evaluations []Evaluations `gorm:"foreignKey:GradeSettingID"`
}