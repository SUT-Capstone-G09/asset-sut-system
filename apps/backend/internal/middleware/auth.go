package middleware

import (
	"strings"

	jwtpkg "github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/jwt"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			response.Unauthorized(ctx, "missing or invalid authorization header")
			ctx.Abort()
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := jwtpkg.ParseToken(tokenStr, jwtSecret)
		if err != nil {
			response.Unauthorized(ctx, "invalid or expired token")
			ctx.Abort()
			return
		}

		if claims.Type != jwtpkg.TokenTypeAccess {
			response.Unauthorized(ctx, "invalid or expired token")
			ctx.Abort()
			return
		}

		ctx.Set("user_id", claims.UserID)
		ctx.Set("email", claims.Email)
		ctx.Set("role", claims.Role)
		ctx.Set("permissions", claims.Permissions)
		ctx.Next()
	}
}

// OptionalAuthMiddleware parses the JWT if present and populates context values,
// but does not abort the request if the token is missing or invalid.
func OptionalAuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			ctx.Next()
			return
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := jwtpkg.ParseToken(tokenStr, jwtSecret)
		if err != nil || claims.Type != jwtpkg.TokenTypeAccess {
			ctx.Next()
			return
		}
		ctx.Set("user_id", claims.UserID)
		ctx.Set("email", claims.Email)
		ctx.Set("role", claims.Role)
		ctx.Set("permissions", claims.Permissions)
		ctx.Next()
	}
}

func RequireRole(roles ...string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userRole := ctx.GetString("role")
		for _, r := range roles {
			if r == userRole {
				ctx.Next()
				return
			}
		}
		response.Forbidden(ctx, "insufficient role")
		ctx.Abort()
	}
}
