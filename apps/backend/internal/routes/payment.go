package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupPaymentRoutes registers payment endpoints for authenticated users.
func SetupPaymentRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	payments := rg.Group("/payments")
	payments.Use(middleware.AuthMiddleware(deps.Config.JWT.Secret))
	{
		payments.POST("/qr", deps.PaymentController.GenerateQR)
		payments.POST("", deps.PaymentController.Create)
		payments.GET("", deps.PaymentController.GetAll)
		payments.POST("/:id/verify", deps.PaymentController.Verify)
		payments.PUT("/:id/slip/:docId", deps.PaymentController.AttachSlip)
	}
}
