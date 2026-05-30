package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupAdminRoutes registers the admin-only management endpoints.
func SetupAdminRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	adminOnly := rg.Group("/")
	adminOnly.Use(middleware.AuthMiddleware(deps.Config.JWT.Secret), middleware.RequireRole("admin"))
	{
		admins := adminOnly.Group("/admins")
		admins.GET("", deps.AdminController.GetAll)
		admins.POST("", deps.AdminController.Create)
		admins.GET("/:id", deps.AdminController.GetByID)
		admins.PUT("/:id", deps.AdminController.Update)
		admins.DELETE("/:id", deps.AdminController.Delete)

		staffs := adminOnly.Group("/staffs")
		staffs.GET("", deps.StaffController.GetAll)
		staffs.POST("", middleware.RequirePermission(deps.PermissionChecker, "user_mgmt", "create"), deps.StaffController.Create)
		staffs.GET("/:id", deps.StaffController.GetByID)
		staffs.PUT("/:id", deps.StaffController.Update)
		staffs.DELETE("/:id", deps.StaffController.Delete)
		staffs.GET("/:id/permissions", deps.StaffController.GetPermissions)
		staffs.PUT("/:id/permissions", deps.StaffController.AssignPermissions)

		requesters := adminOnly.Group("/requesters")
		requesters.GET("", deps.RequesterController.GetAll)
		requesters.GET("/:id", deps.RequesterController.GetByID)
		requesters.PUT("/:id", deps.RequesterController.Update)
		requesters.DELETE("/:id", deps.RequesterController.Delete)

		roles := adminOnly.Group("/roles")
		roles.GET("", deps.RoleController.GetAll)
		roles.POST("", deps.RoleController.Create)
		roles.GET("/:id", deps.RoleController.GetByID)
		roles.PUT("/:id", deps.RoleController.Update)
		roles.DELETE("/:id", deps.RoleController.Delete)

		adminOnly.GET("/permissions", deps.RoleController.GetAllPermissions)
	}
}
