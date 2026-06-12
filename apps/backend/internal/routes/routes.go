package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/controllers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// Dependencies holds everything the route handlers need. It is populated in
// cmd/serve/main.go (config, controllers) and passed down to each domain's
// route registration function.
type Dependencies struct {
	Config              *config.Config
	AuthController      *controllers.AuthController
	AdminController     *controllers.AdminController
	StaffController     *controllers.StaffController
	RequesterController *controllers.RequesterController
	RoleController      *controllers.RoleController
	LocationController  *controllers.LocationController
	BookingController   *controllers.BookingController
	PaymentController   *controllers.PaymentController
	DocumentController  *controllers.DocumentController
	UploadController    *controllers.UploadController
	EmailController          *controllers.EmailController
	EmailTemplateController  *controllers.EmailTemplateController
	EmailBroadcastController *controllers.EmailBroadcastController
	ImageController          *controllers.ImageController
}

// SetupRoutes wires global middleware and registers every domain's routes onto
// the engine. It groups the API under /api/v1, mirroring the existing layout.
func SetupRoutes(router *gin.Engine, deps *Dependencies) {
	router.Use(cors.New(cors.Config{
		AllowOrigins:     deps.Config.CORS.AllowOrigins,
		AllowMethods:     deps.Config.CORS.AllowMethods,
		AllowHeaders:     deps.Config.CORS.AllowHeaders,
		AllowCredentials: deps.Config.CORS.AllowCredentials,
		MaxAge:           deps.Config.CORS.MaxAge,
	}))

	SetupHealthRoutes(router)

	v1 := router.Group("/api/v1")
	{
		SetupAuthRoutes(v1, deps)
		SetupProtectedRoutes(v1, deps)
		SetupAdminRoutes(v1, deps)
		SetupPaymentRoutes(v1, deps)
		SetupUploadRoutes(v1, deps)
		SetupEmailRoutes(v1, deps)
		SetupImageRoutes(v1, deps)
		SetupDemoRoutes(v1, deps)
		SetupLocationRoutes(v1, deps)
		SetupBookingRoutes(v1, deps)
		SetupDocumentRoutes(v1, deps)
	}
}
