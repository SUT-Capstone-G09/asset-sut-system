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
		payments.POST("/qr", deps.PaymentController.GenerateQR)
		payments.POST("/verify-slip", deps.PaymentController.VerifySlip)
		payments.POST("", deps.PaymentController.Create)
		payments.GET("", deps.PaymentController.GetAll)
		payments.POST("/:id/verify", deps.PaymentController.Verify)
		payments.PUT("/:id/slip/:docId", deps.PaymentController.AttachSlip)
	}
}
