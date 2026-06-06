package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupUploadRoutes registers the generic file-upload endpoint for authenticated
// users. Other modules can also inject StorageService directly instead of going
// through HTTP.
func SetupUploadRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	uploads := rg.Group("/uploads")
	uploads.Use(middleware.AuthMiddleware(deps.Config.JWT.Secret))
	{
		uploads.POST("", deps.UploadController.Upload)
	}
}
