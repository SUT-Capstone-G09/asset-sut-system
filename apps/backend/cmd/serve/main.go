package main

import (
	"log"
	"net/http"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/controllers"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/initializers/database"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-contrib/cors"
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

	// ----------------------------------------
	// Services
	// ----------------------------------------
	authService := services.NewAuthService(userRepo, adminRepo, staffRepo, requesterRepo, roleRepo, refreshTokenRepo, cfg.JWT.Secret)
	adminService := services.NewAdminService(userRepo, adminRepo, roleRepo)
	staffService := services.NewStaffService(userRepo, staffRepo, roleRepo, permissionRepo)
	requesterService := services.NewRequesterService(userRepo, requesterRepo)
	roleService := services.NewRoleService(roleRepo, permissionRepo)

	// ----------------------------------------
	// Controllers
	// ----------------------------------------
	authCtrl := controllers.NewAuthController(authService)
	adminCtrl := controllers.NewAdminController(adminService)
	staffCtrl := controllers.NewStaffController(staffService)
	requesterCtrl := controllers.NewRequesterController(requesterService)
	roleCtrl := controllers.NewRoleController(roleService)

	// ----------------------------------------
	// Router
	// ----------------------------------------
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.CORS.AllowOrigins,
		AllowMethods:     cfg.CORS.AllowMethods,
		AllowHeaders:     cfg.CORS.AllowHeaders,
		AllowCredentials: cfg.CORS.AllowCredentials,
		MaxAge:           cfg.CORS.MaxAge,
	}))

	r.GET("/health", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	v1 := r.Group("/api/v1")

	// ----------------------------------------
	// Auth Routes (public)
	// ----------------------------------------
	auth := v1.Group("/auth")
	{
		auth.POST("/login", authCtrl.Login)
		auth.POST("/register", authCtrl.Register)
		auth.POST("/refresh", authCtrl.Refresh)
		auth.POST("/logout", authCtrl.Logout)
	}

	// ----------------------------------------
	// Protected Routes (any authenticated user)
	// ----------------------------------------
	protected := v1.Group("/")
	protected.Use(middleware.AuthMiddleware(cfg.JWT.Secret))
	{
		protected.GET("/me", authCtrl.GetMe)
		protected.PUT("/me/password", authCtrl.ChangePassword)

		protected.GET("/me/admin", middleware.RequireRole("admin"), adminCtrl.GetMyProfile)
		protected.GET("/me/staff", middleware.RequireRole("staff"), staffCtrl.GetMyProfile)
		protected.GET("/me/requester", middleware.RequireRole("requester"), requesterCtrl.GetMyProfile)
	}

	// ----------------------------------------
	// Admin Routes (admin only)
	// ----------------------------------------
	adminOnly := v1.Group("/")
	adminOnly.Use(middleware.AuthMiddleware(cfg.JWT.Secret), middleware.RequireRole("admin"))
	{
		admins := adminOnly.Group("/admins")
		admins.GET("", adminCtrl.GetAll)
		admins.POST("", adminCtrl.Create)
		admins.GET("/:id", adminCtrl.GetByID)
		admins.PUT("/:id", adminCtrl.Update)
		admins.DELETE("/:id", adminCtrl.Delete)

		staffs := adminOnly.Group("/staffs")
		staffs.GET("", staffCtrl.GetAll)
		staffs.POST("", staffCtrl.Create)
		staffs.GET("/:id", staffCtrl.GetByID)
		staffs.PUT("/:id", staffCtrl.Update)
		staffs.DELETE("/:id", staffCtrl.Delete)
		staffs.GET("/:id/permissions", staffCtrl.GetPermissions)
		staffs.PUT("/:id/permissions", staffCtrl.AssignPermissions)

		requesters := adminOnly.Group("/requesters")
		requesters.GET("", requesterCtrl.GetAll)
		requesters.GET("/:id", requesterCtrl.GetByID)
		requesters.PUT("/:id", requesterCtrl.Update)
		requesters.DELETE("/:id", requesterCtrl.Delete)

		roles := adminOnly.Group("/roles")
		roles.GET("", roleCtrl.GetAll)
		roles.POST("", roleCtrl.Create)
		roles.GET("/:id", roleCtrl.GetByID)
		roles.PUT("/:id", roleCtrl.Update)
		roles.DELETE("/:id", roleCtrl.Delete)

		adminOnly.GET("/permissions", roleCtrl.GetAllPermissions)
	}

	addr := ":" + cfg.Server.Port
	log.Printf("server running on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
