package jwtpkg

import (
	"testing"
)

const testSecret = "test-secret-key"

func TestGenerateAndParsePermissionsRoundTrip(t *testing.T) {
	perms := []string{"location_mgmt:create", "location_mgmt:update", "booking:read"}
	pair, err := GenerateTokenPair(1, "test@sut.ac.th", "staff", perms, testSecret)
	if err != nil {
		t.Fatalf("GenerateTokenPair error: %v", err)
	}

	claims, err := ParseToken(pair.AccessToken, testSecret)
	if err != nil {
		t.Fatalf("ParseToken error: %v", err)
	}

	if len(claims.Permissions) != len(perms) {
		t.Fatalf("permissions length: got %d, want %d", len(claims.Permissions), len(perms))
	}
	permSet := make(map[string]struct{}, len(perms))
	for _, p := range perms {
		permSet[p] = struct{}{}
	}
	for _, p := range claims.Permissions {
		if _, ok := permSet[p]; !ok {
			t.Errorf("unexpected permission in claims: %q", p)
		}
	}
}

func TestGenerateWithEmptyPermissions(t *testing.T) {
	pair, err := GenerateTokenPair(2, "admin@sut.ac.th", "admin", []string{}, testSecret)
	if err != nil {
		t.Fatalf("GenerateTokenPair error: %v", err)
	}

	claims, err := ParseToken(pair.AccessToken, testSecret)
	if err != nil {
		t.Fatalf("ParseToken error: %v", err)
	}

	if claims.Permissions == nil {
		t.Fatal("Permissions should be empty slice, not nil")
	}
	if len(claims.Permissions) != 0 {
		t.Errorf("expected 0 permissions, got %d", len(claims.Permissions))
	}
}

func TestRefreshTokenAlsoCarriesPermissions(t *testing.T) {
	perms := []string{"upload_doc:read"}
	pair, err := GenerateTokenPair(3, "staff@sut.ac.th", "staff", perms, testSecret)
	if err != nil {
		t.Fatalf("GenerateTokenPair error: %v", err)
	}

	claims, err := ParseToken(pair.RefreshToken, testSecret)
	if err != nil {
		t.Fatalf("ParseToken (refresh) error: %v", err)
	}

	if len(claims.Permissions) != 1 || claims.Permissions[0] != "upload_doc:read" {
		t.Errorf("refresh token permissions mismatch: got %v", claims.Permissions)
	}
	if claims.Type != TokenTypeRefresh {
		t.Errorf("expected refresh type, got %q", claims.Type)
	}
}
