package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type EmailOutboxRepository struct {
	db *gorm.DB
}

func NewEmailOutboxRepository(db *gorm.DB) *EmailOutboxRepository {
	return &EmailOutboxRepository{db: db}
}

func (r *EmailOutboxRepository) CreateBatch(rows []*models.EmailOutbox) error {
	if len(rows) == 0 {
		return nil
	}
	return r.db.CreateInBatches(rows, 200).Error
}

func (r *EmailOutboxRepository) ClaimPending(limit int) ([]models.EmailOutbox, error) {
	var rows []models.EmailOutbox
	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("status = ?", models.OutboxPending).
			Order("id").Limit(limit).Find(&rows).Error; err != nil {
			return err
		}
		if len(rows) == 0 {
			return nil
		}
		ids := make([]uint, len(rows))
		for i, row := range rows {
			ids[i] = row.ID
		}
		return tx.Model(&models.EmailOutbox{}).Where("id IN ?", ids).
			Update("status", models.OutboxSending).Error
	})
	return rows, err
}

func (r *EmailOutboxRepository) MarkSent(id uint) error {
	return r.db.Model(&models.EmailOutbox{}).Where("id = ?", id).
		Updates(map[string]any{"status": models.OutboxSent, "last_error": ""}).Error
}

func (r *EmailOutboxRepository) MarkRetry(id uint, attempts int, lastErr string) error {
	return r.db.Model(&models.EmailOutbox{}).Where("id = ?", id).
		Updates(map[string]any{"status": models.OutboxPending, "attempts": attempts, "last_error": lastErr}).Error
}

func (r *EmailOutboxRepository) MarkFailed(id uint, attempts int, lastErr string) error {
	return r.db.Model(&models.EmailOutbox{}).Where("id = ?", id).
		Updates(map[string]any{"status": models.OutboxFailed, "attempts": attempts, "last_error": lastErr}).Error
}

func (r *EmailOutboxRepository) RequeueStuckSending() (int64, error) {
	res := r.db.Model(&models.EmailOutbox{}).Where("status = ?", models.OutboxSending).
		Update("status", models.OutboxPending)
	return res.RowsAffected, res.Error
}

func (r *EmailOutboxRepository) CountByStatus(broadcastID uint) (map[string]int, error) {
	type row struct {
		Status string
		Count  int
	}
	var rows []row
	err := r.db.Model(&models.EmailOutbox{}).
		Select("status, COUNT(*) AS count").
		Where("broadcast_id = ?", broadcastID).
		Group("status").Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	counts := map[string]int{
		models.OutboxPending: 0,
		models.OutboxSending: 0,
		models.OutboxSent:    0,
		models.OutboxFailed:  0,
	}
	for _, r := range rows {
		counts[r.Status] = r.Count
	}
	return counts, nil
}
