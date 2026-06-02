package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupLocationRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	auth := middleware.AuthMiddleware(deps.Config.JWT.Secret)
	lc := deps.LocationController

	locations := rg.Group("/locations")
	{
		locations.GET("", lc.GetAll)
		locations.GET("/:id", lc.GetByID)

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
}
