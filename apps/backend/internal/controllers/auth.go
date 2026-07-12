package controllers

import (
	"net/http"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

const (
	userCookieName  = "refresh_token"
	adminCookieName = "admin_refresh_token"
	cookiePath      = "/api/v1/auth"
)

type AuthController struct {
	authService  *services.AuthService
	cookieSecure bool
}

func NewAuthController(authService *services.AuthService, cookieSecure bool) *AuthController {
	return &AuthController{authService: authService, cookieSecure: cookieSecure}
}

func (c *AuthController) cookieName(ctx *gin.Context) string {
	if ctx.Query("app") == "admin" {
		return adminCookieName
	}
	return userCookieName
}

func (c *AuthController) Login(ctx *gin.Context) {
	var req dto.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	tokenResp, refreshToken, err := c.authService.Login(req)
	if err != nil {
		response.Unauthorized(ctx, err.Error())
		return
	}
	c.setRefreshCookie(ctx, refreshToken)
	response.OK(ctx, tokenResp)
}

func (c *AuthController) Register(ctx *gin.Context) {
	var req dto.RegisterRequesterRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	if err := c.authService.Register(req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.Created(ctx, gin.H{"message": "registered successfully"})
}

func (c *AuthController) Refresh(ctx *gin.Context) {
	name := c.cookieName(ctx)
	rawToken, err := ctx.Cookie(name)
	if err != nil {
		response.Unauthorized(ctx, "refresh token not found")
		return
	}
	tokenResp, newRefreshToken, err := c.authService.Refresh(rawToken)
	if err != nil {
		c.clearRefreshCookieByName(ctx, name)
		response.Unauthorized(ctx, err.Error())
		return
	}
	c.setRefreshCookieByName(ctx, name, newRefreshToken)
	response.OK(ctx, tokenResp)
}

func (c *AuthController) Logout(ctx *gin.Context) {
	name := c.cookieName(ctx)
	rawToken, err := ctx.Cookie(name)
	if err == nil {
		_ = c.authService.Logout(rawToken)
	}
	c.clearRefreshCookieByName(ctx, name)
	response.OK(ctx, gin.H{"message": "logged out"})
}

func (c *AuthController) ChangePassword(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")
	var req dto.ChangePasswordRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	if err := c.authService.ChangePassword(userID, req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "password changed"})
}

func (c *AuthController) VerifyPassword(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")
	var req dto.VerifyPasswordRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	if err := c.authService.VerifyPassword(userID, req.Password); err != nil {
		response.Unauthorized(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"verified": true})
}

func (c *AuthController) setRefreshCookie(ctx *gin.Context, token string) {
	c.setRefreshCookieByName(ctx, c.cookieName(ctx), token)
}

func (c *AuthController) setRefreshCookieByName(ctx *gin.Context, name, token string) {
	ctx.SetCookie(name, token, int((7*24*time.Hour).Seconds()), cookiePath, "", c.cookieSecure, true)
}

func (c *AuthController) clearRefreshCookieByName(ctx *gin.Context, name string) {
	ctx.SetCookie(name, "", -1, cookiePath, "", c.cookieSecure, true)
}

func (c *AuthController) GetMe(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"user_id": ctx.GetUint("user_id"),
			"email":   ctx.GetString("email"),
			"role":    ctx.GetString("role"),
		},
	})
}
