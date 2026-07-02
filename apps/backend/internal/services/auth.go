package services

import (
	"crypto/sha256"
	"errors"
	"fmt"
	"strings"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/hash"
	jwtpkg "github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/jwt"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
	"gorm.io/gorm"
)

type AuthService struct {
	userRepo         *repositories.UserRepository
	adminRepo        *repositories.AdminRepository
	staffRepo        *repositories.StaffRepository
	requesterRepo    *repositories.RequesterRepository
	roleRepo         *repositories.RoleRepository
	refreshTokenRepo *repositories.RefreshTokenRepository
	jwtSecret        string
}

func NewAuthService(
	userRepo *repositories.UserRepository,
	adminRepo *repositories.AdminRepository,
	staffRepo *repositories.StaffRepository,
	requesterRepo *repositories.RequesterRepository,
	roleRepo *repositories.RoleRepository,
	refreshTokenRepo *repositories.RefreshTokenRepository,
	jwtSecret string,
) *AuthService {
	return &AuthService{
		userRepo:         userRepo,
		adminRepo:        adminRepo,
		staffRepo:        staffRepo,
		requesterRepo:    requesterRepo,
		roleRepo:         roleRepo,
		refreshTokenRepo: refreshTokenRepo,
		jwtSecret:        jwtSecret,
	}
}

func (s *AuthService) Login(req dto.LoginRequest) (*dto.TokenResponse, string, error) {
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, "", errors.New("invalid email or password")
		}
		return nil, "", err
	}

	if !user.IsActive {
		return nil, "", errors.New("account is deactivated")
	}

	if !hash.CheckPassword(req.Password, user.Password) {
		return nil, "", errors.New("invalid email or password")
	}

	roleName, err := s.userRepo.GetUserRole(user.ID)
	if err != nil {
		return nil, "", err
	}

	tokens, err := jwtpkg.GenerateTokenPair(user.ID, user.Email, roleName, s.jwtSecret)
	if err != nil {
		return nil, "", err
	}

	tokenHash := hashToken(tokens.RefreshToken)
	if err := s.refreshTokenRepo.Create(user.ID, tokenHash, jwtpkg.RefreshTokenExpiry()); err != nil {
		return nil, "", err
	}

	summary := dto.UserSummary{ID: user.ID, Email: user.Email, Role: roleName}
	s.populateName(user.ID, roleName, &summary)

	return &dto.TokenResponse{
		AccessToken: tokens.AccessToken,
		User:        summary,
	}, tokens.RefreshToken, nil
}

func (s *AuthService) Register(req dto.RegisterRequesterRequest) error {
	_, err := s.userRepo.FindByEmail(req.Email)
	if err == nil {
		return errors.New("email already registered")
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	hashed, err := hash.HashPassword(req.Password)
	if err != nil {
		return err
	}

	requesterTypeID := req.RequesterTypeID
	if requesterTypeID == 0 {
		requesterTypeID = s.detectRequesterType(req.Email)
	}

	user := &models.Users{
		Email:        req.Email,
		Password:     hashed,
		AuthProvider: "local",
		ProviderID:   "local",
		IsActive:     true,
	}
	if err := s.userRepo.Create(user); err != nil {
		return err
	}

	requesterRole, err := s.roleRepo.FindByName("requester")
	if err != nil {
		return err
	}
	if err := s.userRepo.AssignRole(user.ID, requesterRole); err != nil {
		return err
	}

	requester := &models.Requesters{
		FirstName:       req.FirstName,
		LastName:        req.LastName,
		Phone:           req.Phone,
		LineID:          req.LineID,
		UserID:          user.ID,
		RequesterTypeID: requesterTypeID,
	}
	return s.requesterRepo.Create(requester)
}

func (s *AuthService) Refresh(rawRefreshToken string) (*dto.TokenResponse, string, error) {
	claims, err := jwtpkg.ParseToken(rawRefreshToken, s.jwtSecret)
	if err != nil {
		return nil, "", errors.New("invalid refresh token")
	}
	if claims.Type != jwtpkg.TokenTypeRefresh {
		return nil, "", errors.New("invalid refresh token")
	}

	tokenHash := hashToken(rawRefreshToken)
	stored, err := s.refreshTokenRepo.FindByHash(tokenHash)
	if err != nil {
		return nil, "", errors.New("refresh token not found or expired")
	}

	user, err := s.userRepo.FindByID(stored.UserID)
	if err != nil {
		return nil, "", err
	}
	if !user.IsActive {
		_ = s.refreshTokenRepo.DeleteAllByUserID(stored.UserID)
		return nil, "", errors.New("account is deactivated")
	}

	roleName := ""
	if len(user.Roles) > 0 {
		roleName = user.Roles[0].Name
	}

	if err := s.refreshTokenRepo.DeleteByHash(tokenHash); err != nil {
		return nil, "", err
	}

	tokens, err := jwtpkg.GenerateTokenPair(user.ID, user.Email, roleName, s.jwtSecret)
	if err != nil {
		return nil, "", err
	}

	newHash := hashToken(tokens.RefreshToken)
	if err := s.refreshTokenRepo.Create(user.ID, newHash, jwtpkg.RefreshTokenExpiry()); err != nil {
		return nil, "", err
	}

	summary := dto.UserSummary{ID: user.ID, Email: user.Email, Role: roleName}
	s.populateName(user.ID, roleName, &summary)

	return &dto.TokenResponse{
		AccessToken: tokens.AccessToken,
		User:        summary,
	}, tokens.RefreshToken, nil
}

func (s *AuthService) populateName(userID uint, role string, out *dto.UserSummary) {
	switch role {
	case "admin":
		if p, err := s.adminRepo.FindByUserID(userID); err == nil {
			out.FirstName = p.FirstName
			out.LastName = p.LastName
		}
	case "staff":
		if p, err := s.staffRepo.FindByUserID(userID); err == nil {
			out.FirstName = p.FirstName
			out.LastName = p.LastName
		}
	case "requester":
		if p, err := s.requesterRepo.FindByUserID(userID); err == nil {
			out.FirstName = p.FirstName
			out.LastName = p.LastName
			out.RequesterTypeID = p.RequesterTypeID
		}
	}
}

func (s *AuthService) Logout(rawRefreshToken string) error {
	tokenHash := hashToken(rawRefreshToken)
	return s.refreshTokenRepo.DeleteByHash(tokenHash)
}

func (s *AuthService) ChangePassword(userID uint, req dto.ChangePasswordRequest) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return err
	}
	if !hash.CheckPassword(req.OldPassword, user.Password) {
		return errors.New("old password is incorrect")
	}
	hashed, err := hash.HashPassword(req.NewPassword)
	if err != nil {
		return err
	}
	return s.userRepo.UpdatePassword(userID, hashed)
}

// VerifyPassword re-checks the current user's password without changing it —
// used as a step-up confirmation before sensitive actions (e.g. signing a document).
func (s *AuthService) VerifyPassword(userID uint, password string) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return err
	}
	if !hash.CheckPassword(password, user.Password) {
		return errors.New("incorrect password")
	}
	return nil
}

func (s *AuthService) detectRequesterType(email string) uint {
	if strings.HasSuffix(email, "@g.sut.ac.th") {
		return 1 // ภายใน
	}
	return 2 // ภายนอก
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return fmt.Sprintf("%x", sum)
}
