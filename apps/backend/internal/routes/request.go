package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRequestRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	protected := rg.Group("/")
	protected.Use(middleware.AuthMiddleware(deps.Config.JWT.Secret))
	{
		protected.POST("/requests", deps.RequestController.Create)
		protected.GET("/requests", deps.RequestController.GetMyRequests)
		protected.GET("/requests/all", middleware.RequireRole("admin", "staff"), deps.RequestController.GetAllRequests)
		protected.GET("/requests/:refcode", deps.RequestController.GetRequestDetail)
		protected.PUT("/requests/:refcode", deps.RequestController.UpdateRequestStatusAndStaff)
		protected.GET("/request-types", deps.RequestController.GetRequestTypes)
	}
}
