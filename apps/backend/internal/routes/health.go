package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// SetupHealthRoutes registers the public health-check endpoint on the root.
func SetupHealthRoutes(router *gin.Engine) {
	router.GET("/health", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
}
