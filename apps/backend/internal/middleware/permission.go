package middleware

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/gin-gonic/gin"
)

type PermissionChecker interface {
	UserHasPermission(userID uint, module, action string) (bool, error)
}

func RequirePermission(checker PermissionChecker, module, action string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userID := ctx.GetUint("user_id")
		if userID == 0 {
			response.Unauthorized(ctx, "missing authentication")
			ctx.Abort()
			return
		}

		allowed, err := checker.UserHasPermission(userID, module, action)
		if err != nil {
			response.InternalError(ctx, "failed to verify permission")
			ctx.Abort()
			return
		}
		if !allowed {
			response.Forbidden(ctx, "insufficient permission")
			ctx.Abort()
			return
		}
		ctx.Next()
	}
}
