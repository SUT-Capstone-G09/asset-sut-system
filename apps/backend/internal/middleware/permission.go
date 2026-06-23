package middleware

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/gin-gonic/gin"
)

func RequirePermission(module, action string) gin.HandlerFunc {
	required := module + ":" + action
	return func(ctx *gin.Context) {
		userID := ctx.GetUint("user_id")
		if userID == 0 {
			response.Unauthorized(ctx, "missing authentication")
			ctx.Abort()
			return
		}

		for _, p := range ctx.GetStringSlice("permissions") {
			if p == required {
				ctx.Next()
				return
			}
		}

		response.Forbidden(ctx, "insufficient permission")
		ctx.Abort()
	}
}
