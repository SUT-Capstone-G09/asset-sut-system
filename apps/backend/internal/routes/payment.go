package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupPaymentRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	auth := middleware.AuthMiddleware(deps.Config.JWT.Secret)
	pc := deps.PaymentController
	dc := deps.DocumentController

	payments := rg.Group("/payments")
	payments.Use(auth)
	{
		payments.GET("", middleware.RequireRole("staff", "admin"), pc.GetAll)
		payments.POST("", middleware.RequireRole("requester"), pc.Create)
		payments.GET("/:id", pc.GetByID)
		payments.POST("/:id/verify", middleware.RequireRole("staff", "admin"), pc.Verify)
		payments.PUT("/:id/slip/:did", pc.AttachSlip)
	}

	invoices := rg.Group("/invoices")
	invoices.Use(auth)
	{
		invoices.GET("/:id/transactions", pc.GetByInvoiceID)
	}

	documents := rg.Group("/documents")
	documents.Use(auth)
	{
		documents.POST("", dc.Create)
		documents.GET("/:id", dc.GetByID)
		documents.DELETE("/:id", dc.Delete)
	}

	// Documents nested under bookings
	bookingDocs := rg.Group("/bookings")
	bookingDocs.Use(auth)
	{
		bookingDocs.GET("/:id/documents", dc.GetByBookingID)
	}
}
