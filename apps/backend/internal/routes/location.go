package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupLocationRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	auth := middleware.AuthMiddleware(deps.Config.JWT.Secret)
	optAuth := middleware.OptionalAuthMiddleware(deps.Config.JWT.Secret)
	lc := deps.LocationController

	rg.GET("/location-types", lc.GetTypes)

	locations := rg.Group("/locations")
	{
		// Optional auth: staff gets filtered list, others get all
		locations.GET("", optAuth, lc.GetAll)
		locations.GET("/:id", optAuth, lc.GetByID)
		locations.GET("/:id/monthly-availability", lc.GetMonthlyAvailability)

		// Staff/Admin mutations (ownership enforced in service for staff)
		mgmt := locations.Group("")
		mgmt.Use(auth, middleware.RequireRole("staff", "admin"))
		{
			mgmt.POST("", middleware.RequirePermission("location_mgmt", "create"), lc.Create)
			mgmt.PUT("/:id", middleware.RequirePermission("location_mgmt", "update"), lc.Update)

			mgmt.GET("/:id/unavailabilities", middleware.RequirePermission("location_mgmt", "read"), lc.GetUnavailabilities)
			mgmt.POST("/:id/unavailabilities", middleware.RequirePermission("location_mgmt", "update"), lc.CreateUnavailability)
			mgmt.DELETE("/:id/unavailabilities/:uid", middleware.RequirePermission("location_mgmt", "update"), lc.DeleteUnavailability)

			mgmt.POST("/:id/equipments", middleware.RequirePermission("location_mgmt", "update"), lc.AddEquipment)
			mgmt.DELETE("/:id/equipments/:eid", middleware.RequirePermission("location_mgmt", "update"), lc.RemoveEquipment)

			mgmt.POST("/:id/addons", middleware.RequirePermission("location_mgmt", "update"), lc.CreateAddon)
			mgmt.PUT("/:id/addons/:aid", middleware.RequirePermission("location_mgmt", "update"), lc.UpdateAddon)
			mgmt.DELETE("/:id/addons/:aid", middleware.RequirePermission("location_mgmt", "update"), lc.DeleteAddon)

			mgmt.POST("/:id/pricing-tiers", middleware.RequirePermission("location_mgmt", "update"), lc.CreatePricingTier)
			mgmt.DELETE("/:id/pricing-tiers/:tid", middleware.RequirePermission("location_mgmt", "update"), lc.DeletePricingTier)
		}

		// Admin-only: delete location, manage staff assignments per location
		adminOnly := locations.Group("")
		adminOnly.Use(auth, middleware.RequireRole("admin"))
		{
			adminOnly.DELETE("/:id", middleware.RequirePermission("location_mgmt", "delete"), lc.Delete)
			adminOnly.GET("/:id/staff", middleware.RequirePermission("location_mgmt", "read"), lc.GetLocationStaff)
			adminOnly.POST("/:id/staff", middleware.RequirePermission("location_mgmt", "update"), lc.AssignStaff)
			adminOnly.DELETE("/:id/staff/:uid", middleware.RequirePermission("location_mgmt", "update"), lc.UnassignStaff)
		}
	}

	addons := rg.Group("/addons")
	addons.Use(auth)
	{
		addons.GET("", lc.GetGlobalAddons)
		addons.GET("/:id", lc.GetAddonByID)

		adminOnly := addons.Group("")
		adminOnly.Use(middleware.RequireRole("admin"))
		{
			adminOnly.POST("", lc.CreateGlobalAddon)
			adminOnly.PUT("/:id", lc.UpdateAddon)
			adminOnly.DELETE("/:id", lc.DeleteAddon)
		}
	}
}
