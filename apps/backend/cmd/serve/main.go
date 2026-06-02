package main

import (
	"log"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/controllers"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/initializers/database"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/routes"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	db, err := database.Connect(cfg.Database)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	// ----------------------------------------
	// Repositories
	// ----------------------------------------
	userRepo := repositories.NewUserRepository(db)
	adminRepo := repositories.NewAdminRepository(db)
	staffRepo := repositories.NewStaffRepository(db)
	requesterRepo := repositories.NewRequesterRepository(db)
	roleRepo := repositories.NewRoleRepository(db)
	permissionRepo := repositories.NewPermissionRepository(db)
	refreshTokenRepo := repositories.NewRefreshTokenRepository(db)

	locationRepo := repositories.NewLocationRepository(db)
	bookingRepo := repositories.NewBookingRepository(db)
	timeslotRepo := repositories.NewTimeslotRepository(db)
	invoiceRepo := repositories.NewInvoiceRepository(db)
	paymentRepo := repositories.NewPaymentRepository(db)
	documentRepo := repositories.NewDocumentRepository(db)

	// ----------------------------------------
	// Services
	// ----------------------------------------
	authService := services.NewAuthService(userRepo, adminRepo, staffRepo, requesterRepo, roleRepo, refreshTokenRepo, cfg.JWT.Secret)
	adminService := services.NewAdminService(userRepo, adminRepo, roleRepo)
	staffService := services.NewStaffService(userRepo, staffRepo, roleRepo, permissionRepo)
	requesterService := services.NewRequesterService(userRepo, requesterRepo)
	roleService := services.NewRoleService(roleRepo, permissionRepo)

	locationService := services.NewLocationService(locationRepo)
	invoiceService := services.NewInvoiceService(invoiceRepo)
	bookingService := services.NewBookingService(bookingRepo, timeslotRepo, locationRepo, invoiceRepo)
	paymentService := services.NewPaymentService(paymentRepo, invoiceRepo)
	documentService := services.NewDocumentService(documentRepo)

	// ----------------------------------------
	// Controllers
	// ----------------------------------------
	authCtrl := controllers.NewAuthController(authService, cfg.Cookie.Secure)
	adminCtrl := controllers.NewAdminController(adminService)
	staffCtrl := controllers.NewStaffController(staffService)
	requesterCtrl := controllers.NewRequesterController(requesterService)
	roleCtrl := controllers.NewRoleController(roleService)

	locationCtrl := controllers.NewLocationController(locationService)
	bookingCtrl := controllers.NewBookingController(bookingService, invoiceService)
	paymentCtrl := controllers.NewPaymentController(paymentService)
	documentCtrl := controllers.NewDocumentController(documentService)

	// ----------------------------------------
	// Router
	// ----------------------------------------
	r := gin.Default()

	routes.SetupRoutes(r, &routes.Dependencies{
		Config:              cfg,
		AuthController:      authCtrl,
		AdminController:     adminCtrl,
		StaffController:     staffCtrl,
		RequesterController: requesterCtrl,
		RoleController:      roleCtrl,
		LocationController:  locationCtrl,
		BookingController:   bookingCtrl,
		PaymentController:   paymentCtrl,
		DocumentController:  documentCtrl,
		PermissionChecker:   permissionRepo,
	})

	addr := ":" + cfg.Server.Port
	log.Printf("server running on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
