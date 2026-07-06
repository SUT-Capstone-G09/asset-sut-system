package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupEmailRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	email := rg.Group("/email")
	email.Use(middleware.AuthMiddleware(deps.Config.JWT.Secret), middleware.RequireRole("admin"))
	{
		email.POST("/send-email", deps.EmailController.SendEmail)

		templates := email.Group("/templates")
		templates.GET("", deps.EmailTemplateController.GetAll)
		templates.POST("", deps.EmailTemplateController.Create)
		templates.GET("/:id", deps.EmailTemplateController.GetByID)
		templates.PUT("/:id", deps.EmailTemplateController.Update)
		templates.DELETE("/:id", deps.EmailTemplateController.Delete)
		templates.POST("/image", deps.ImageController.Upload)

		broadcasts := email.Group("/broadcasts")
		broadcasts.POST("/preview", deps.EmailBroadcastController.Preview)
		broadcasts.POST("", deps.EmailBroadcastController.Create)
		broadcasts.GET("", deps.EmailBroadcastController.List)
		broadcasts.GET("/:id", deps.EmailBroadcastController.Get)
		broadcasts.GET("/:id/recipients", deps.EmailBroadcastController.Recipients)

		email.GET("/audiences/options", deps.EmailBroadcastController.Options)
		email.GET("/recipients/search", deps.EmailBroadcastController.SearchRecipients)
	}
}

// SetupImageRoutes registers the public image-serving endpoint (no auth) so that
// images embedded in emails can be loaded from any client.
func SetupImageRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	rg.GET("/images/*objectKey", deps.ImageController.Serve)
}
