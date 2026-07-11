package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupSignatureRoutes registers the saved-signature endpoints (save/get/delete),
// scoped to the authenticated user's own signature.
func SetupSignatureRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	sig := rg.Group("/me/signature")
	sig.Use(middleware.AuthMiddleware(deps.Config.JWT.Secret))
	{
		sig.POST("", deps.SignatureController.Save)
		sig.GET("", deps.SignatureController.Get)
		sig.DELETE("", deps.SignatureController.Delete)
	}
}
