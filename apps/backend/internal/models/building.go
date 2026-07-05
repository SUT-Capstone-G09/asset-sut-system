package models

type Buildings struct {
	Base
	Name  string  `gorm:"not null;unique"`
	Code      *string     `gorm:"size:50"`
	Areas     []Areas     `gorm:"foreignKey:BuildingID"`
	Locations []Locations `gorm:"foreignKey:BuildingID"`
}