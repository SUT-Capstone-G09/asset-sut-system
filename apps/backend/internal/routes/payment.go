package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupPaymentRoutes registers payment endpoints for authenticated users.
func SetupPaymentRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	auth := middleware.AuthMiddleware(deps.Config.JWT.Secret)
	pc := deps.PaymentController

	payments := rg.Group("/payments")
	payments.Use(auth)
	{
		payments.POST("/qr", pc.GenerateQR)
		payments.POST("/verify-slip", pc.VerifySlip)
		payments.POST("", pc.Create)
		payments.GET("", middleware.RequireRole("staff", "admin"), pc.GetAll)
		payments.GET("/statuses", middleware.RequireRole("staff", "admin"), pc.GetAllStatuses)
		payments.POST("/:id/verify", middleware.RequireRole("staff", "admin"), pc.Verify)
		payments.PUT("/:id/slip/:docId", pc.AttachSlip)
	}
}
