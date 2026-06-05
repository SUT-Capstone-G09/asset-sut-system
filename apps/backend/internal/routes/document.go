package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupDocumentRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	auth := middleware.AuthMiddleware(deps.Config.JWT.Secret)

	// /bookings/:id/documents
	rg.Group("/bookings").Use(auth).GET("/:id/documents", deps.DocumentController.GetByBookingID)

	// /documents
	docs := rg.Group("/documents")
	docs.Use(auth)
	{
		docs.POST("", deps.DocumentController.Create)
		docs.GET("/:id", deps.DocumentController.GetByID)
		docs.DELETE("/:id", deps.DocumentController.Delete)
	}
}
