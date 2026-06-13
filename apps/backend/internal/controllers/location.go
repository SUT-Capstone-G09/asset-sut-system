package controllers

import (
	"strconv"

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
	locations, err := c.locationService.GetAll()
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
	location, err := c.locationService.GetByID(id)
	if err != nil {
		response.NotFound(ctx, "location not found")
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
	location, err := c.locationService.Create(req)
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
	location, err := c.locationService.Update(id, req)
	if err != nil {
		response.NotFound(ctx, err.Error())
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
	addon, err := c.locationService.CreateAddon(&id, req)
	if err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.Created(ctx, addon)
}

func (c *LocationController) UpdateAddon(ctx *gin.Context) {
	id, err := parseAddonID(ctx)
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
	id, err := parseAddonID(ctx)
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

// ── Global Addon Handlers ───────────────────────────────────────────────────

func (c *LocationController) GetGlobalAddons(ctx *gin.Context) {
	items, err := c.locationService.GetGlobalAddons()
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, items)
}

func (c *LocationController) GetAddonByID(ctx *gin.Context) {
	id, err := parseAddonID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	item, err := c.locationService.GetAddonByID(id)
	if err != nil {
		response.NotFound(ctx, "addon not found")
		return
	}
	response.OK(ctx, item)
}

func (c *LocationController) CreateGlobalAddon(ctx *gin.Context) {
	var req dto.CreateAddonRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	item, err := c.locationService.CreateAddon(nil, req)
	if err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.Created(ctx, item)
}

func parseAddonID(ctx *gin.Context) (uint, error) {
	if aid := ctx.Param("aid"); aid != "" {
		id, err := strconv.ParseUint(aid, 10, 64)
		return uint(id), err
	}
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	return uint(id), err
}


