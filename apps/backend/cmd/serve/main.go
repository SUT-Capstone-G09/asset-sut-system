package main

import (
	"log"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/controllers"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/initializers/database"
	minioinit "github.com/SUT-Capstone-G09/asset-sut-system/internal/initializers/minio"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/easyslip"
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
	locationRepo := repositories.NewLocationRepository(db)
	bookingRepo := repositories.NewBookingRepository(db)
	timeslotRepo := repositories.NewTimeslotRepository(db)
	invoiceRepo := repositories.NewInvoiceRepository(db)
	paymentRepo := repositories.NewPaymentRepository(db)
	documentRepo := repositories.NewDocumentRepository(db)
	emailTemplateRepo := repositories.NewEmailTemplateRepository(db)
	emailOutboxRepo := repositories.NewEmailOutboxRepository(db)
	emailBroadcastRepo := repositories.NewEmailBroadcastRepository(db)
	recipientRepo := repositories.NewRecipientRepository(db)
	signatureRepo := repositories.NewSignatureRepository(db)
	tenantRepo := repositories.NewTenantRepository(db)
	rentalSpaceRepo := repositories.NewRentalSpaceRepository(db)
	floorPlanRepo := repositories.NewFloorPlanRepository(db)
	mapLayerRepo := repositories.NewMapLayerRepository(db)
	buildingRepo := repositories.NewBuildingRepository(db)

	// ----------------------------------------
	// Services
	// ----------------------------------------
	authService := services.NewAuthService(userRepo, adminRepo, staffRepo, requesterRepo, tenantRepo, roleRepo, refreshTokenRepo, permissionRepo, cfg.JWT.Secret)
	adminService := services.NewAdminService(userRepo, adminRepo, roleRepo)
	staffService := services.NewStaffService(userRepo, staffRepo, roleRepo, permissionRepo)
	requesterService := services.NewRequesterService(userRepo, requesterRepo)
	roleService := services.NewRoleService(roleRepo, permissionRepo)
	storageService := services.NewStorageService(minioClient, cfg.Minio)
	locationService := services.NewLocationService(locationRepo, timeslotRepo, staffRepo, storageService)
	invoiceService := services.NewInvoiceService(invoiceRepo)
	paymentService := services.NewPaymentService(paymentRepo, invoiceRepo, bookingRepo)
	bookingService := services.NewBookingService(bookingRepo, timeslotRepo, locationRepo, invoiceRepo, requesterRepo, storageService)
	paymentQRService := services.NewPaymentQRService(bookingRepo, invoiceRepo, storageService, cfg.Payment)
	easySlipClient := easyslip.New(cfg.EasySlip.APIKey, cfg.EasySlip.VerifyURL)
	paymentVerifyService := services.NewPaymentVerifyService(easySlipClient, paymentRepo, invoiceRepo, documentRepo, storageService, cfg.Payment)
	documentService := services.NewDocumentService(documentRepo, storageService)
	emailService, err := services.NewEmailService(cfg.SMTP, emailTemplateRepo, emailOutboxRepo)
	if err != nil {
		log.Fatalf("failed to init email service: %v", err)
	}
	emailTemplateService := services.NewEmailTemplateService(emailTemplateRepo)
	emailBroadcastService := services.NewEmailBroadcastService(
		recipientRepo, emailTemplateRepo, emailBroadcastRepo, emailOutboxRepo, emailService, roleRepo, requesterRepo,
	)
	signatureService := services.NewSignatureService(signatureRepo, storageService)
	rentalSpaceService := services.NewRentalSpaceService(rentalSpaceRepo, buildingRepo)
	floorPlanService := services.NewFloorPlanService(floorPlanRepo, buildingRepo)
	mapLayerService := services.NewMapLayerService(mapLayerRepo, floorPlanRepo, rentalSpaceRepo)

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
	paymentCtrl := controllers.NewPaymentController(paymentService, paymentQRService, paymentVerifyService)
	documentCtrl := controllers.NewDocumentController(documentService)
	rentalSpaceCtrl := controllers.NewRentalSpaceController(rentalSpaceService)
	floorPlanCtrl := controllers.NewFloorPlanController(floorPlanService)
	mapLayerCtrl := controllers.NewMapLayerController(mapLayerService)

	// Google Drive (optional — ข้ามถ้าไม่ได้ตั้งค่า credentials)
	var driveService *services.DriveService
	if cfg.GDrive.ClientEmail != "" && cfg.GDrive.PrivateKey != "" {
		var driveErr error
		driveService, driveErr = services.NewDriveService(cfg.GDrive)
		if driveErr != nil {
			log.Printf("warning: Google Drive unavailable: %v", driveErr)
			driveService = nil
		} else {
			log.Printf("Google Drive initialized (%d folder route(s))", len(cfg.GDrive.FolderRoutes))
		}
	}

	uploadCtrl := controllers.NewUploadController(storageService, driveService, cfg.GDrive.FolderRoutes)
	emailCtrl := controllers.NewEmailController(emailService)
	emailTemplateCtrl := controllers.NewEmailTemplateController(emailTemplateService)
	emailBroadcastCtrl := controllers.NewEmailBroadcastController(emailBroadcastService)
	imageCtrl := controllers.NewImageController(storageService, cfg.Server.PublicBaseURL)
	signatureCtrl := controllers.NewSignatureController(signatureService)

	// ----------------------------------------
	// Router
	// ----------------------------------------
	r := gin.Default()

	routes.SetupRoutes(r, &routes.Dependencies{
		Config:                   cfg,
		AuthController:           authCtrl,
		AdminController:          adminCtrl,
		StaffController:          staffCtrl,
		RequesterController:      requesterCtrl,
		RoleController:           roleCtrl,
		LocationController:       locationCtrl,
		BookingController:        bookingCtrl,
		PaymentController:        paymentCtrl,
		DocumentController:       documentCtrl,
		UploadController:         uploadCtrl,
		EmailController:          emailCtrl,
		EmailTemplateController:  emailTemplateCtrl,
		EmailBroadcastController: emailBroadcastCtrl,
		ImageController:          imageCtrl,
		SignatureController:      signatureCtrl,
		RentalSpaceController:    rentalSpaceCtrl,
		FloorPlanController:      floorPlanCtrl,
		MapLayerController:       mapLayerCtrl,
	})

	addr := ":" + cfg.Server.Port
	log.Printf("server running on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
