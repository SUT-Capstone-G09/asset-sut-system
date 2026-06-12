package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func buildRouter(module, action string, userID uint, permissions []string) *gin.Engine {
	r := gin.New()
	r.GET("/test", func(ctx *gin.Context) {
		ctx.Set("user_id", userID)
		ctx.Set("permissions", permissions)
		ctx.Next()
	}, RequirePermission(module, action), func(ctx *gin.Context) {
		ctx.Status(http.StatusOK)
	})
	return r
}

func TestRequirePermission_Granted(t *testing.T) {
	r := buildRouter("location_mgmt", "create", 1, []string{"location_mgmt:create", "booking:read"})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/test", nil))
	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}

func TestRequirePermission_Denied(t *testing.T) {
	r := buildRouter("location_mgmt", "delete", 1, []string{"location_mgmt:create"})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/test", nil))
	if w.Code != http.StatusForbidden {
		t.Errorf("expected 403, got %d", w.Code)
	}
}

func TestRequirePermission_NoPermissions(t *testing.T) {
	r := buildRouter("location_mgmt", "create", 1, []string{})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/test", nil))
	if w.Code != http.StatusForbidden {
		t.Errorf("expected 403, got %d", w.Code)
	}
}

func TestRequirePermission_Unauthenticated(t *testing.T) {
	r := buildRouter("location_mgmt", "create", 0, []string{"location_mgmt:create"})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/test", nil))
	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}
