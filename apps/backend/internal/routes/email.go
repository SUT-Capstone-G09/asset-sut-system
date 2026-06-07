package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupEmailRoutes registers email-related endpoints. For now this is just an
// admin-only test-send used to verify SMTP and template rendering.
func SetupEmailRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	email := rg.Group("/email")
	email.Use(middleware.AuthMiddleware(deps.Config.JWT.Secret))
	{
		email.POST("/test",
			middleware.RequireRole("admin"),
			deps.EmailController.SendTest,
		)
	}
}
