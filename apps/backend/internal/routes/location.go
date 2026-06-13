package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupLocationRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	auth := middleware.AuthMiddleware(deps.Config.JWT.Secret)
	lc := deps.LocationController

	rg.GET("/location-types", lc.GetTypes)

	locations := rg.Group("/locations")
	{
		locations.GET("", lc.GetAll)
		locations.GET("/:id", lc.GetByID)
		locations.GET("/:id/monthly-availability", lc.GetMonthlyAvailability)

		// Staff/Admin only mutations
		mgmt := locations.Group("")
		mgmt.Use(auth, middleware.RequireRole("staff", "admin"))
		{
			mgmt.POST("", lc.Create)
			mgmt.PUT("/:id", lc.Update)
			mgmt.DELETE("/:id", lc.Delete)

			mgmt.GET("/:id/unavailabilities", lc.GetUnavailabilities)
			mgmt.POST("/:id/unavailabilities", lc.CreateUnavailability)
			mgmt.DELETE("/:id/unavailabilities/:uid", lc.DeleteUnavailability)

			mgmt.POST("/:id/equipments", lc.AddEquipment)
			mgmt.DELETE("/:id/equipments/:eid", lc.RemoveEquipment)

			mgmt.POST("/:id/addons", lc.CreateAddon)
			mgmt.PUT("/:id/addons/:aid", lc.UpdateAddon)
			mgmt.DELETE("/:id/addons/:aid", lc.DeleteAddon)

			mgmt.POST("/:id/pricing-tiers", lc.CreatePricingTier)
			mgmt.DELETE("/:id/pricing-tiers/:tid", lc.DeletePricingTier)
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
