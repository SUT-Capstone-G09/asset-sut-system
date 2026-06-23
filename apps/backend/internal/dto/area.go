package dto

import (
	"time"

	"github.com/google/uuid"
)

// area DTOs

type CreateAreaRequest struct {
	BuildingID	*uint			`json:"building_id"`
	Name				string		`json:"name" binding:"required"`
	Description	*string		`json:"description"`
	Category		string		`json:"category" binding:"required"`
	Lat					float64		`json:"lat" binding:"required,min=-90,max=90"`
	Lng					float64		`json:"lng" binding:"required,min=-180,max=180"`
	Address			string		`json:"address" binding:"required"`
	Size        *string  	`json:"size"`
	AreaCode    *string  	`json:"area_code"`
	BasePrice   *float64 	`json:"base_price" binding:"omitempty,min=0"`
	Status      string   	`json:"status" binding:"omitempty,oneof=active vacant inactive"`
}

type UpdateAreaRequest struct {
	BuildingID		*uint			`json:"building_id"`
	Name					*string		`json:"name"`
	Description  	*string  	`json:"description"`
	Category     	*string  	`json:"category"`
	Lat         	*float64 	`json:"lat" binding:"omitempty,min=-90,max=90"`
	Lng          	*float64 	`json:"lng" binding:"omitempty,min=-180,max=180"`
	Address      	*string  	`json:"address"`
	Size         	*string  	`json:"size"`
	AreaCode     	*string  	`json:"area_code"`
	BasePrice    	*float64 	`json:"base_price" binding:"omitempty,min=0"`
	Status       	*string  	`json:"status" binding:"omitempty,oneof=active vacant inactive"`
	HasFloorPlan 	*bool    	`json:"has_floor_plan"`
}

type AreaResponse struct {
	ID           	uuid.UUID            `json:"id"`
	BuildingID   	*uint                `json:"building_id"`
	BuildingName 	*string              `json:"building_name,omitempty"`
	Name         	string               `json:"name"`
	Description  	*string              `json:"description"`
	// รวมพิกัดส่งออกเป็น Array [lat, lng]
	Coordinates  	[2]float64           `json:"coordinates"`

	Address      	string               `json:"address"`
	Size         	*string              `json:"size"`
	AreaCode     	*string              `json:"area_code"`
	BasePrice    	*float64             `json:"base_price"`
	Status       	string               `json:"status"`
	HasFloorPlan 	bool                 `json:"has_floor_plan"`
	Images       	[]AreaImageResponse  `json:"images,omitempty"`
	Tags         	[]string             `json:"tags,omitempty"`
	CreatedAt    	time.Time            `json:"created_at"`
	UpdatedAt    	time.Time            `json:"updated_at"`
}

type AreaImageResponse struct {
	ID        uuid.UUID `json:"id"`
	URL       string    `json:"url"`
	AltText   *string   `json:"alt_text"`
	IsPrimary bool      `json:"is_primary"`
	SortOrder int       `json:"sort_order"`
}

// Floor Plan & Canvas DTOs

type CreateFloorPlanRequest struct {
	Name   string `json:"name" binding:"required"`
	Width  int    `json:"width" binding:"required,min=1"`
	Height int    `json:"height" binding:"required,min=1"`
}


type FloorPlanResponse struct {
	ID        uuid.UUID           `json:"id"`
	AreaID    uuid.UUID           `json:"area_id"`
	Name      string              `json:"name"`
	Width     int                 `json:"width"`
	Height    int                 `json:"height"`
	Layers    []MapLayerResponse  `json:"layers,omitempty"`
	UpdatedAt time.Time           `json:"updated_at"`
}

type CreateMapLayerRequest struct {
	Name    string `json:"name" binding:"required"`
	Visible bool   `json:"visible"`
	Locked  bool   `json:"locked"`
	Color   string `json:"color" binding:"required,len=7"` 
}

type MapLayerResponse struct {
	ID        uuid.UUID            `json:"id"`
	Name      string               `json:"name"`
	Visible   bool                 `json:"visible"`
	Locked    bool                 `json:"locked"`
	Color     string               `json:"color"`
	Elements  []MapElementResponse `json:"elements,omitempty"`
}

type CreateMapElementRequest struct {
	CanvasElementID 	string 		`json:"canvas_element_id" binding:"required"`
	
	Name 							string 		`json:"name" binding:"required,min=1,max=100"`
	Type 							string 		`json:"type" binding:"required,oneof=area wall"`
	Status 						*string 	`json:"status" binding:"omitempty,oneof=open reserved occupied maintenance unavailable"`
	
	AreaType 					*string 	`json:"area_type" binding:"omitempty,oneof=shop toilet seating other"`
	CustomAreaType 		*string 	`json:"custom_area_type"`
	
	X 								float64 	`json:"x" binding:"required"`
	Y 								float64 	`json:"y" binding:"required"`
	Width 						float64 	`json:"width" binding:"required,gt=0"`
	Height 						float64 	`json:"height" binding:"required,gt=0"`
	Rotation 					*float64	`json:"rotation"`
	
	Zone 							*string 	`json:"zone"`
	Tenant 						*string 	`json:"tenant"`
	Description 			*string 	`json:"description"`
	
	Tags 							[]string 	`json:"tags"`
}

type MapElementResponse struct {
	ID              uuid.UUID `json:"id"`
	CanvasElementID string    `json:"canvas_element_id"`

	Name   					string 		`json:"name"`
	Type   					string 		`json:"type"`
	Status 					string 		`json:"status"`

	AreaType       	*string 	`json:"area_type,omitempty"`
	CustomAreaType 	*string 	`json:"custom_area_type,omitempty"`

	X        				float64 	`json:"x"`
	Y        				float64 	`json:"y"`
	Width    				float64 	`json:"width"`
	Height   				float64 	`json:"height"`
	Rotation 				float64 	`json:"rotation"`

	Zone        		*string 	`json:"zone,omitempty"`
	Tenant      		*string 	`json:"tenant,omitempty"`
	Description 		*string 	`json:"description,omitempty"`

	Tags 						[]string 	`json:"tags"`

	CreatedAt 			time.Time `json:"created_at"`
	UpdatedAt 			time.Time `json:"updated_at"`
}