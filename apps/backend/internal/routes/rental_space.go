package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupRentalSpaceRoutes registers HTTP endpoints for Rental Spaces, Floor Plans, Map Layers, and Map Elements.
// โน๊ตไว้ก่อน: เชื่อมต่อตัวดักเช็กสิทธิ์ middleware.RequirePermission("location_mgmt", "action") หลังจากทำการทดสอบระบบทุกอย่างเรียบร้อยแล้ว
func SetupRentalSpaceRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	auth := middleware.AuthMiddleware(deps.Config.JWT.Secret)

	rsc := deps.RentalSpaceController
	fpc := deps.FloorPlanController
	mlc := deps.MapLayerController

	// Rental Spaces Routes
	rentalSpaces := rg.Group("/rental-spaces")
	{
		rentalSpaces.GET("", rsc.FindAll)
		rentalSpaces.GET("/:id", rsc.FindByID)

		// Protected - staff and admin
		mgmt := rentalSpaces.Group("")
		mgmt.Use(auth, middleware.RequireRole("staff", "admin"))
		{
			mgmt.POST("", rsc.Create)
			mgmt.PUT("/:id", rsc.Update)
		}

		// Delete - admin
		adminOnly := rentalSpaces.Group("")
		adminOnly.Use(auth, middleware.RequireRole("admin"))
		{
			adminOnly.DELETE("/:id", rsc.Delete)
		}
	}

	// Floor Plans Routes
	floorPlans := rg.Group("")
	{
		rg.GET("/buildings/:buildingId/floor-plans", fpc.FindAll)
		rg.GET("/floor-plans/:id", fpc.FindByID)

		// Protected - staff and admin
		mgmt := floorPlans.Group("")
		mgmt.Use(auth, middleware.RequireRole("staff", "admin"))
		{
			mgmt.POST("/buildings/:buildingId/floor-plans", fpc.Create)
			mgmt.PUT("/floor-plans/:id", fpc.Update)
		}

		// Delete - admin 
		adminOnly := floorPlans.Group("")
		adminOnly.Use(auth, middleware.RequireRole("admin"))
		{
			adminOnly.DELETE("/floor-plans/:id", fpc.Delete)
		}
	}

	// Map Layers & Elements Routes
	mapLayers := rg.Group("")
	{
		mgmt := mapLayers.Group("")
		mgmt.Use(auth, middleware.RequireRole("staff", "admin"))
		{
			// Map Layers
			mgmt.POST("/floor-plans/:floorPlanId/layers", mlc.Create)
			mgmt.PUT("/layers/:id", mlc.Update)
			mgmt.DELETE("/layers/:id", mlc.Delete)

			// Map Elements
			mgmt.POST("/layers/:layerId/elements", mlc.CreateMapElement)
			mgmt.PUT("/elements/:id", mlc.UpdateMapElement)
			mgmt.DELETE("/elements/:id", mlc.DeleteMapElement)
		}
	}
}
