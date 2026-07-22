package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupDocumentRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	auth := middleware.AuthMiddleware(deps.Config.JWT.Secret)
	dc := deps.DocumentController

	// Public lookup — lets the frontend resolve a document_type_id by name
	// instead of hardcoding it. Registered as its own top-level path (not
	// under /documents/:id) so it can never collide with that param route.
	rg.GET("/document-types", dc.GetTypes)

	// GET /bookings/:id/documents — list documents for a booking
	bookings := rg.Group("/bookings")
	bookings.Use(auth)
	{
		bookings.GET("/:id/documents", dc.GetByBookingID)
	}

	// Document CRUD (direct)
	docs := rg.Group("/documents")
	docs.Use(auth)
	{
		docs.GET("/:id", dc.GetByID)
		docs.POST("", dc.Create)
		docs.DELETE("/:id", dc.Delete)
	}
}
