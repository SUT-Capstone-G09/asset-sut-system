package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/gin-gonic/gin"
)

func SetupDemoRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	demo := rg.Group("/demo")
	demo.Use(middleware.AuthMiddleware(deps.Config.JWT.Secret))
	{
		demo.GET("/booking",
			middleware.RequireRole("staff", "admin"),
			middleware.RequirePermission(deps.PermissionChecker, "booking", "read"),
			func(ctx *gin.Context) {
				response.OK(ctx, gin.H{
					"message": "access granted: you may read bookings",
					"user_id": ctx.GetUint("user_id"),
					"role":    ctx.GetString("role"),
				})
			},
		)
	}
}
