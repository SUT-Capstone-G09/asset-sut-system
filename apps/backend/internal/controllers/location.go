package controllers

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

type LocationController struct {
	locationService *services.LocationService
}

func NewLocationController(locationService *services.LocationService) *LocationController {
	return &LocationController{locationService: locationService}
}

func (c *LocationController) GetTypes(ctx *gin.Context) {
	types, err := c.locationService.GetTypes()
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, types)
}

func (c *LocationController) GetAll(ctx *gin.Context) {
	role := ctx.GetString("role")
	userID := ctx.GetUint("user_id")
	locations, err := c.locationService.GetAll(role, userID)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, locations)
}

func (c *LocationController) GetByID(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	role := ctx.GetString("role")
	userID := ctx.GetUint("user_id")
	location, err := c.locationService.GetByID(id, role, userID)
	if err != nil {
		if err.Error() == "forbidden" {
			response.Forbidden(ctx, "access denied")
		} else {
			response.NotFound(ctx, "location not found")
		}
		return
	}
	response.OK(ctx, location)
}

func (c *LocationController) Create(ctx *gin.Context) {
	var req dto.CreateLocationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	role := ctx.GetString("role")
	userID := ctx.GetUint("user_id")
	location, err := c.locationService.Create(req, role, userID)
	if err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.Created(ctx, location)
}

func (c *LocationController) Update(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	var req dto.UpdateLocationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	role := ctx.GetString("role")
	userID := ctx.GetUint("user_id")
	location, err := c.locationService.Update(id, req, role, userID)
	if err != nil {
		if err.Error() == "forbidden" {
			response.Forbidden(ctx, "access denied")
		} else {
			response.NotFound(ctx, err.Error())
		}
		return
	}
	response.OK(ctx, location)
}

func (c *LocationController) Delete(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	if err := c.locationService.Delete(id); err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "deleted"})
}

// ── Staff Location Assignment ─────────────────────────────────────────────────

func (c *LocationController) GetLocationStaff(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	staff, err := c.locationService.GetLocationStaff(id)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, staff)
}

func (c *LocationController) AssignStaff(ctx *gin.Context) {
	locationID, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	var req dto.AssignStaffRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	if err := c.locationService.AssignStaff(locationID, req.UserID); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "staff assigned"})
}

func (c *LocationController) UnassignStaff(ctx *gin.Context) {
	locationID, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	staffUserID, err := parseSubID(ctx, "uid")
	if err != nil {
		response.BadRequest(ctx, "invalid staff user id")
		return
	}
	if err := c.locationService.UnassignStaff(locationID, staffUserID); err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "staff unassigned"})
}

func (c *LocationController) GetStaffLocations(ctx *gin.Context) {
	staffUserID, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	locations, err := c.locationService.GetStaffLocations(staffUserID)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, locations)
}

func (c *LocationController) SetStaffLocations(ctx *gin.Context) {
	staffUserID, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	var req dto.AssignStaffLocationsRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	if err := c.locationService.SetStaffLocations(staffUserID, req.LocationIDs); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "locations updated"})
}

// ── Unavailabilities ──────────────────────────────────────────────────────────

func (c *LocationController) GetUnavailabilities(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	items, err := c.locationService.GetUnavailabilities(id)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, items)
}

func (c *LocationController) CreateUnavailability(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	var req dto.CreateUnavailabilityRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	item, err := c.locationService.CreateUnavailability(id, req)
	if err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.Created(ctx, item)
}

func (c *LocationController) DeleteUnavailability(ctx *gin.Context) {
	id, err := parseSubID(ctx, "uid")
	if err != nil {
		response.BadRequest(ctx, "invalid unavailability id")
		return
	}
	if err := c.locationService.DeleteUnavailability(id); err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "deleted"})
}

// ── Monthly Availability ──────────────────────────────────────────────────────

func (c *LocationController) GetMonthlyAvailability(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	var q dto.MonthlyAvailabilityQuery
	if err := ctx.ShouldBindQuery(&q); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	result, err := c.locationService.GetMonthlyAvailability(id, q.Year, q.Month)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, result)
}

// ── Equipments ────────────────────────────────────────────────────────────────

func (c *LocationController) AddEquipment(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	var req dto.AddEquipmentRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	if err := c.locationService.AddEquipment(id, req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.Created(ctx, gin.H{"message": "equipment added"})
}

func (c *LocationController) RemoveEquipment(ctx *gin.Context) {
	locationID, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	equipmentID, err := parseSubID(ctx, "eid")
	if err != nil {
		response.BadRequest(ctx, "invalid equipment id")
		return
	}
	if err := c.locationService.RemoveEquipment(locationID, equipmentID); err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "equipment removed"})
}

// ── Addons ────────────────────────────────────────────────────────────────────

func (c *LocationController) CreateAddon(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	var req dto.CreateAddonRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	addon, err := c.locationService.CreateAddon(id, req)
	if err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.Created(ctx, addon)
}

func (c *LocationController) UpdateAddon(ctx *gin.Context) {
	id, err := parseSubID(ctx, "aid")
	if err != nil {
		response.BadRequest(ctx, "invalid addon id")
		return
	}
	var req dto.CreateAddonRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	addon, err := c.locationService.UpdateAddon(id, req)
	if err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, addon)
}

func (c *LocationController) DeleteAddon(ctx *gin.Context) {
	id, err := parseSubID(ctx, "aid")
	if err != nil {
		response.BadRequest(ctx, "invalid addon id")
		return
	}
	if err := c.locationService.DeleteAddon(id); err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "deleted"})
}

// ── Pricing Tiers ─────────────────────────────────────────────────────────────

func (c *LocationController) CreatePricingTier(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	var req dto.CreatePricingTierRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	tier, err := c.locationService.CreatePricingTier(id, req)
	if err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.Created(ctx, tier)
}

func (c *LocationController) DeletePricingTier(ctx *gin.Context) {
	id, err := parseSubID(ctx, "tid")
	if err != nil {
		response.BadRequest(ctx, "invalid tier id")
		return
	}
	if err := c.locationService.DeletePricingTier(id); err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "deleted"})
}

// ── Hall Floor Plan ──────────────────────────────────────────────────────────

// GetFloorPlan คืนผังของโถง; ถ้ายังไม่มีผังจะคืน 200 พร้อม data: null (frontend สร้างผังว่างเอง)
func (c *LocationController) GetFloorPlan(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	fp, err := c.locationService.GetFloorPlan(id)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, fp) // fp เป็น nil ได้ → data: null
}

func (c *LocationController) UpsertFloorPlan(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	var req dto.UpsertHallFloorPlanRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	fp, err := c.locationService.UpsertFloorPlan(id, req)
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, fp)
}

// GetFloorPlanIDs คืน location_id ทั้งหมดที่มีผังแล้ว (ใช้โชว์ป้าย "มีผัง" บนการ์ด)
func (c *LocationController) GetFloorPlanIDs(ctx *gin.Context) {
	ids, err := c.locationService.GetFloorPlanLocationIDs()
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, ids)
}
