package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupProtectedRoutes registers endpoints available to any authenticated user.
func SetupProtectedRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	protected := rg.Group("/")
	protected.Use(middleware.AuthMiddleware(deps.Config.JWT.Secret))
	{
		protected.GET("/me", deps.AuthController.GetMe)
		protected.PUT("/me/password", deps.AuthController.ChangePassword)
		protected.POST("/me/verify-password", deps.AuthController.VerifyPassword)

		protected.GET("/me/admin", middleware.RequireRole("admin"), deps.AdminController.GetMyProfile)
		protected.GET("/me/staff", middleware.RequireRole("staff"), deps.StaffController.GetMyProfile)
		protected.GET("/me/requester", middleware.RequireRole("requester", "user"), deps.RequesterController.GetMyProfile)

		protected.GET("/staffs/:id/locations", middleware.RequireRole("admin", "staff"), deps.LocationController.GetStaffLocations)
	}
}
