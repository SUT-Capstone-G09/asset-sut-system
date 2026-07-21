package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupLocationRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	auth := middleware.AuthMiddleware(deps.Config.JWT.Secret)
	optAuth := middleware.OptionalAuthMiddleware(deps.Config.JWT.Secret)
	lc := deps.LocationController

	rg.GET("/buildings", lc.GetBuildings)
	rg.GET("/location-types", lc.GetTypes)
	rg.GET("/hall-usage-purposes", lc.GetHallUsagePurposes)

	// ตั้ง/แก้ราคาโถงราย อาคาร (staff/admin) — เป็นเรทกลาง/ขั้นต่ำของทุกโถงในอาคาร
	// โถงทำเลทองตั้งราคาสูงกว่าได้รายตัวที่ PUT /locations/:id/hall-pricings
	buildingsMgmt := rg.Group("/buildings")
	buildingsMgmt.Use(auth, middleware.RequireRole("staff", "admin"))
	{
		buildingsMgmt.PUT("/:id/hall-pricings", middleware.RequirePermission("location_mgmt", "update"), lc.UpdateBuildingHallPricings)
	}

	// จัดการวัตถุประสงค์การขอใช้พื้นที่โถง (เพิ่ม/แก้/เปิด-ปิด) — staff/admin
	purposesMgmt := rg.Group("/hall-usage-purposes")
	purposesMgmt.Use(auth, middleware.RequireRole("staff", "admin"))
	{
		purposesMgmt.POST("", middleware.RequirePermission("location_mgmt", "update"), lc.CreateHallUsagePurpose)
		purposesMgmt.PUT("/:id", middleware.RequirePermission("location_mgmt", "update"), lc.UpdateHallUsagePurpose)
	}

	// รายการ location_id ที่มีผังพื้นที่แล้ว (แยก path ออกจาก /locations/:id กันชนกับ param route)
	rg.GET("/hall-floor-plans", auth, middleware.RequireRole("staff", "admin"), lc.GetFloorPlanIDs)

	locations := rg.Group("/locations")
	{
		// Optional auth: staff gets filtered list, others get all
		locations.GET("", optAuth, lc.GetAll)
		locations.GET("/:id", optAuth, lc.GetByID)
		locations.GET("/:id/monthly-availability", lc.GetMonthlyAvailability)

		// Public (หน้าจองของผู้ใช้): ผังโถง + เซลล์ที่ถูกจองแล้วตามวันที่ (เลือกบูธ) + ราคาที่ระบบคำนวณ
		locations.GET("/:id/public-floor-plan", lc.GetPublicFloorPlan)
		locations.GET("/:id/booked-cells", deps.BookingController.GetBookedCells)
		locations.POST("/:id/hall-price-quote", deps.BookingController.QuoteHallPrice)

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

			// ราคาเฉพาะโถง (ทำเลทอง) — override ราคาอาคาร ใช้เมื่อสูงกว่าเท่านั้น
			mgmt.GET("/:id/hall-pricings", middleware.RequirePermission("location_mgmt", "read"), lc.GetLocationHallPricings)
			mgmt.PUT("/:id/hall-pricings", middleware.RequirePermission("location_mgmt", "update"), lc.UpdateLocationHallPricings)

			// ผังพื้นที่โถง (top-view + สเกล + กรอบ + ช่องห้ามจอง)
			mgmt.GET("/:id/floor-plan", middleware.RequirePermission("location_mgmt", "read"), lc.GetFloorPlan)
			mgmt.PUT("/:id/floor-plan", middleware.RequirePermission("location_mgmt", "update"), lc.UpsertFloorPlan)
			// อัปโหลดรูปผัง → เก็บที่ path "รูปภาพสถานที่/{อาคาร}/โถงอาคาร/แผนผัง/{ชื่อโถง}"
			mgmt.POST("/:id/floor-plan/image", middleware.RequirePermission("location_mgmt", "update"), lc.UploadFloorPlanImage)
		}

		// Admin-only: delete location, manage staff assignments per location
		adminOnly := locations.Group("")
		adminOnly.Use(auth, middleware.RequireRole("admin"))
		{
			adminOnly.DELETE("/:id", middleware.RequirePermission("location_mgmt", "delete"), lc.Delete)
			adminOnly.GET("/:id/staff", middleware.RequirePermission("location_mgmt", "read"), lc.GetLocationStaff)
			adminOnly.POST("/:id/staff", middleware.RequirePermission("location_mgmt", "update"), lc.AssignStaffBuilding)
			adminOnly.DELETE("/:id/staff/:uid", middleware.RequirePermission("location_mgmt", "update"), lc.UnassignStaffBuilding)
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
