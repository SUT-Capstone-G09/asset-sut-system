package routes

import (
	"github.com/gin-gonic/gin"
)

// SetupAuthRoutes registers the public authentication endpoints.
func SetupAuthRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	auth := rg.Group("/auth")
	{
		auth.POST("/login", deps.AuthController.Login)
		auth.POST("/register", deps.AuthController.Register)
		auth.POST("/refresh", deps.AuthController.Refresh)
		auth.POST("/logout", deps.AuthController.Logout)
	}
}
