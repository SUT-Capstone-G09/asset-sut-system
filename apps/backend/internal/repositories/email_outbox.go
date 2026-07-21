package repositories

import (
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type EmailOutboxRepository struct {
	db *gorm.DB
}

func NewEmailOutboxRepository(db *gorm.DB) *EmailOutboxRepository {
	return &EmailOutboxRepository{db: db}
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

// RequeueStuckSendingOlderThan กู้ row ที่ค้างสถานะ 'sending' นานเกินกำหนด (updated_at เก่ากว่า cutoff)
// กลับเป็น 'pending' — ใช้กวาดเป็นระยะระหว่างรัน (self-healing) เผื่อ process ตายกลางคัน
// หรือ mark status ไม่สำเร็จ จะได้ไม่ค้างถาวรจนกว่าจะ restart (RequeueStuckSending รันแค่ตอน startup)
func (r *EmailOutboxRepository) RequeueStuckSendingOlderThan(cutoff time.Time) (int64, error) {
	res := r.db.Model(&models.EmailOutbox{}).
		Where("status = ? AND updated_at < ?", models.OutboxSending, cutoff).
		Update("status", models.OutboxPending)
	return res.RowsAffected, res.Error
}

// ListByBroadcast returns every outbox row for a broadcast, optionally filtered
// to a single status (e.g. "failed" to see who did not receive the email).
func (r *EmailOutboxRepository) ListByBroadcast(broadcastID uint, status string) ([]models.EmailOutbox, error) {
	q := r.db.Where("broadcast_id = ?", broadcastID)
	if status != "" {
		q = q.Where("status = ?", status)
	}
	var rows []models.EmailOutbox
	// Failed first, then by id, so the rows that need attention surface at the top.
	err := q.Order("CASE status WHEN 'failed' THEN 0 WHEN 'pending' THEN 1 WHEN 'sending' THEN 2 ELSE 3 END").
		Order("id").
		Find(&rows).Error
	return rows, err
}

func zeroStatusCounts() map[string]int {
	return map[string]int{
		models.OutboxPending: 0,
		models.OutboxSending: 0,
		models.OutboxSent:    0,
		models.OutboxFailed:  0,
	}
}

// CountByStatusForBroadcasts returns status counts for many broadcasts in a single
// grouped query (avoids the N+1 of calling CountByStatus per broadcast). Every
// requested id is present in the result with a fully-zeroed map.
func (r *EmailOutboxRepository) CountByStatusForBroadcasts(broadcastIDs []uint) (map[uint]map[string]int, error) {
	result := make(map[uint]map[string]int, len(broadcastIDs))
	for _, id := range broadcastIDs {
		result[id] = zeroStatusCounts()
	}
	if len(broadcastIDs) == 0 {
		return result, nil
	}

	type row struct {
		BroadcastID uint
		Status      string
		Count       int
	}
	var rows []row
	err := r.db.Model(&models.EmailOutbox{}).
		Select("broadcast_id, status, COUNT(*) AS count").
		Where("broadcast_id IN ?", broadcastIDs).
		Group("broadcast_id, status").Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	for _, row := range rows {
		if m, ok := result[row.BroadcastID]; ok {
			m[row.Status] = row.Count
		}
	}
	return result, nil
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
	counts := zeroStatusCounts()
	for _, r := range rows {
		counts[r.Status] = r.Count
	}
	return counts, nil
}
