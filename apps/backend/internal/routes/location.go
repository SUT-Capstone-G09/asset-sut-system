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
			mgmt.POST("", lc.Create)
			mgmt.PUT("/:id", lc.Update)

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

		// Admin-only: delete location, manage staff assignments per location
		adminOnly := locations.Group("")
		adminOnly.Use(auth, middleware.RequireRole("admin"))
		{
			adminOnly.DELETE("/:id", lc.Delete)
			adminOnly.GET("/:id/staff", lc.GetLocationStaff)
			adminOnly.POST("/:id/staff", lc.AssignStaff)
			adminOnly.DELETE("/:id/staff/:uid", lc.UnassignStaff)
		}
	}
}
