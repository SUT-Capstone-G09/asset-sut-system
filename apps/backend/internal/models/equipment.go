package models

import ()

type Equipments struct {
	Base
	Name string `json:"name" gorm:"type:varchar(255);not null"`
	LocationEquipments []LocationEquipments `gorm:"foreignKey:EquipmentID" json:"location_equipments"` // ความสัมพันธ์เเบบ 1[Equipment] --- N[LocationEquipment]
}

type LocationEquipments struct {
	Base
	LocationID uint `json:"location_id"`
	EquipmentID uint `json:"equipment_id"`
	Quantity int `json:"quantity"`
}