package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type SignatureRepository struct {
	db *gorm.DB
}

func NewSignatureRepository(db *gorm.DB) *SignatureRepository {
	return &SignatureRepository{db: db}
}

func (r *SignatureRepository) FindByUserID(userID uint) (*models.UserSignatures, error) {
	var sig models.UserSignatures
	err := r.db.Where("user_id = ?", userID).First(&sig).Error
	return &sig, err
}

// Upsert stores the given signature record, replacing the existing row for
// this user (if any) so each user keeps at most one saved signature. Looks up
// Unscoped so a previously soft-deleted row is revived instead of colliding
// with the unique index on user_id.
func (r *SignatureRepository) Upsert(sig *models.UserSignatures) error {
	var existing models.UserSignatures
	if err := r.db.Unscoped().Where("user_id = ?", sig.UserID).First(&existing).Error; err == nil {
		if err := r.db.Unscoped().Model(&existing).Updates(map[string]any{
			"bucket_name": sig.BucketName,
			"object_key":  sig.ObjectKey,
			"deleted_at":  nil,
		}).Error; err != nil {
			return err
		}
		// Reflect the DB-assigned ID/timestamps back onto the caller's struct.
		*sig = existing
		return nil
	}
	return r.db.Create(sig).Error
}

func (r *SignatureRepository) DeleteByUserID(userID uint) error {
	return r.db.Where("user_id = ?", userID).Delete(&models.UserSignatures{}).Error
}
