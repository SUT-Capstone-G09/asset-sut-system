package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupBookingRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	auth := middleware.AuthMiddleware(deps.Config.JWT.Secret)
	bc := deps.BookingController

	bookings := rg.Group("/bookings")
	bookings.Use(auth)
	{
		// Requester
		bookings.POST("", middleware.RequireRole("requester"), bc.Create)
		bookings.GET("/my", bc.GetMyBookings)

		// Staff / Admin
		bookings.GET("", middleware.RequireRole("staff", "admin"), bc.GetAll)
		bookings.PUT("/:id/status", middleware.RequireRole("staff", "admin"), bc.UpdateStatus)

		// Any authenticated user (ownership checked in service if needed)
		bookings.GET("/:id", bc.GetByID)
		bookings.GET("/:id/invoice", bc.GetInvoice)
	}
}
