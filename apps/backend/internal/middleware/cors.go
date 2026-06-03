package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
)

func CORS(cfg config.CORSConfig) gin.HandlerFunc {
	corsConfig := cors.Config{
		AllowMethods:     cfg.AllowMethods,
		AllowHeaders:     cfg.AllowHeaders,
		AllowCredentials: cfg.AllowCredentials,
		MaxAge:           cfg.MaxAge,
	}

	if len(cfg.AllowOrigins) == 1 && cfg.AllowOrigins[0] == "*" {
		corsConfig.AllowAllOrigins = true
	} else {
		corsConfig.AllowOrigins = cfg.AllowOrigins
	}

	return cors.New(corsConfig)
}