package main

import (
	"log"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/controllers"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/initializers/database"
	minioinit "github.com/SUT-Capstone-G09/asset-sut-system/internal/initializers/minio"
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

	minioClient, err := minioinit.Connect(cfg.Minio)
	if err != nil {
		log.Fatalf("failed to connect to minio: %v", err)
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
	invoiceRepo := repositories.NewInvoiceRepository(db)
	paymentRepo := repositories.NewPaymentRepository(db)
	emailTemplateRepo := repositories.NewEmailTemplateRepository(db)

	// ----------------------------------------
	// Services
	// ----------------------------------------
	authService := services.NewAuthService(userRepo, adminRepo, staffRepo, requesterRepo, roleRepo, refreshTokenRepo, cfg.JWT.Secret)
	adminService := services.NewAdminService(userRepo, adminRepo, roleRepo)
	staffService := services.NewStaffService(userRepo, staffRepo, roleRepo, permissionRepo)
	requesterService := services.NewRequesterService(userRepo, requesterRepo)
	roleService := services.NewRoleService(roleRepo, permissionRepo)
	storageService := services.NewStorageService(minioClient, cfg.Minio)
	paymentQRService := services.NewPaymentQRService(invoiceRepo, paymentRepo, storageService, cfg.Payment)
	emailService, err := services.NewEmailService(cfg.SMTP, emailTemplateRepo)
	if err != nil {
		log.Fatalf("failed to init email service: %v", err)
	}
	emailTemplateService := services.NewEmailTemplateService(emailTemplateRepo)

	// ----------------------------------------
	// Controllers
	// ----------------------------------------
	authCtrl := controllers.NewAuthController(authService, cfg.Cookie.Secure)
	adminCtrl := controllers.NewAdminController(adminService)
	staffCtrl := controllers.NewStaffController(staffService)
	requesterCtrl := controllers.NewRequesterController(requesterService)
	roleCtrl := controllers.NewRoleController(roleService)
	paymentCtrl := controllers.NewPaymentController(paymentQRService)
	uploadCtrl := controllers.NewUploadController(storageService)
	emailCtrl := controllers.NewEmailController(emailService)
	emailTemplateCtrl := controllers.NewEmailTemplateController(emailTemplateService)
	imageCtrl := controllers.NewImageController(storageService, cfg.Server.PublicBaseURL)

	// ----------------------------------------
	// Router
	// ----------------------------------------
	r := gin.Default()

	routes.SetupRoutes(r, &routes.Dependencies{
		Config:                  cfg,
		AuthController:          authCtrl,
		AdminController:         adminCtrl,
		StaffController:         staffCtrl,
		RequesterController:     requesterCtrl,
		RoleController:          roleCtrl,
		PaymentController:       paymentCtrl,
		UploadController:        uploadCtrl,
		EmailController:         emailCtrl,
		EmailTemplateController: emailTemplateCtrl,
		ImageController:         imageCtrl,
		PermissionChecker:       permissionRepo,
	})

	addr := ":" + cfg.Server.Port
	log.Printf("server running on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
