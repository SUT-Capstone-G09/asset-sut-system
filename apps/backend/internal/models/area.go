package models

import (
	"github.com/google/uuid"
)

type Areas struct {
	Base
	BuildingID   *uint        
	Building     *Buildings   `gorm:"foreignKey:BuildingID"`
	Name         string       `gorm:"not null"`
	Description  *string      
	Category     string       `gorm:"not null"`
	Lat          float64      `gorm:"type:decimal(10,7);not null"`
	Lng          float64      `gorm:"type:decimal(10,7);not null"`
	Address      string       `gorm:"not null"`
	Size         *string      
	AreaCode     *string      `gorm:"unique"`
	BasePrice    *float64     `gorm:"type:decimal(12,2)"`
	Status       string       `gorm:"not null;default:'vacant'"`
	HasFloorPlan bool         `gorm:"not null;default:false"`
	Images       []AreaImages `gorm:"foreignKey:AreaID"`
	Tags         []AreaTags   `gorm:"foreignKey:AreaID"`
	FloorPlan    *FloorPlans  `gorm:"foreignKey:AreaID"`
}

type AreaImages struct {
	Base
	AreaID    uint    `gorm:"not null"`
	Area      *Areas  `gorm:"foreignKey:AreaID"`
	URL       string  `gorm:"not null"`
	AltText   *string 
	IsPrimary bool    `gorm:"not null;default:false"`
	SortOrder int     `gorm:"not null;default:0"`
}

type AreaTags struct {
	AreaID uint   `gorm:"primaryKey"`
	Tag    string `gorm:"primaryKey"`
}

type FloorPlans struct {
	UUIDBase
	AreaID    uint        `gorm:"unique;not null"`
	Area      *Areas      `gorm:"foreignKey:AreaID"`
	Name      string      `gorm:"not null"`
	Width     int         `gorm:"not null"`
	Height    int         `gorm:"not null"`
	MapLayers []MapLayers `gorm:"foreignKey:FloorPlanID"`
}

type MapLayers struct {
	UUIDBase
	FloorPlanID uuid.UUID     `gorm:"type:uuid;not null"`
	FloorPlan   *FloorPlans   `gorm:"foreignKey:FloorPlanID"`
	Name        string        `gorm:"not null"`
	Visible     bool          `gorm:"not null;default:true"`
	Locked      bool          `gorm:"not null;default:false"`
	Color       string        `gorm:"not null"`
	MapElements []MapElements `gorm:"foreignKey:LayerID"`
}

type MapElements struct {
	UUIDBase
	LayerID 				uuid.UUID 	`gorm:"type:uuid;not null;index"`
	Layer   				*MapLayers 	`gorm:"foreignKey:LayerID"`
	CanvasElementID string 			`gorm:"not null"`
	Name 						string 			`gorm:"type:varchar(100);not null"`
	Type 						string 			`gorm:"type:varchar(20);not null"`
	AreaType       	*string
	CustomAreaType 	*string
	Status 					string 			`gorm:"type:varchar(20);not null;default:'open'"`
	X 							float64 		`gorm:"not null"`
	Y 							float64 		`gorm:"not null"`
	Width  					float64 		`gorm:"not null"`
	Height 					float64 		`gorm:"not null"`
	Rotation 				float64 		`gorm:"not null;default:0"`
	Zone        		*string
	Tenant      		*string
	Description 		*string
	Tags 						[]string 		`gorm:"serializer:json"`
}
