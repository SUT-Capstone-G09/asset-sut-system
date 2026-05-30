package repositories

import (
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type RefreshTokenRepository struct {
	db *gorm.DB
}

func NewRefreshTokenRepository(db *gorm.DB) *RefreshTokenRepository {
	return &RefreshTokenRepository{db: db}
}

func (r *RefreshTokenRepository) Create(userID uint, tokenHash string, expiresAt time.Time) error {
	token := models.RefreshTokens{
		UserID:    userID,
		TokenHash: tokenHash,
		ExpiresAt: expiresAt,
	}
	return r.db.Create(&token).Error
}

func (r *RefreshTokenRepository) FindByHash(tokenHash string) (*models.RefreshTokens, error) {
	var token models.RefreshTokens
	err := r.db.Where("token_hash = ? AND expires_at > ?", tokenHash, time.Now()).First(&token).Error
	return &token, err
}

func (r *RefreshTokenRepository) DeleteByHash(tokenHash string) error {
	return r.db.Where("token_hash = ?", tokenHash).Delete(&models.RefreshTokens{}).Error
}

func (r *RefreshTokenRepository) DeleteAllByUserID(userID uint) error {
	return r.db.Where("user_id = ?", userID).Delete(&models.RefreshTokens{}).Error
}
