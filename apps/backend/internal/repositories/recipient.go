package repositories

import (
	"strings"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type RecipientRepository struct {
	db *gorm.DB
}

func NewRecipientRepository(db *gorm.DB) *RecipientRepository {
	return &RecipientRepository{db: db}
}

type recipientRow struct {
	ID    uint
	Email string
	Name  string
}

func (r *RecipientRepository) baseQuery() *gorm.DB {
	return r.db.Table("users AS u").
		Select(`u.id AS id, u.email AS email,
			TRIM(COALESCE(a.first_name, s.first_name, r.first_name, '') || ' ' ||
			     COALESCE(a.last_name,  s.last_name,  r.last_name,  '')) AS name`).
		Joins("LEFT JOIN admins a ON a.user_id = u.id AND a.deleted_at IS NULL").
		Joins("LEFT JOIN staffs s ON s.user_id = u.id AND s.deleted_at IS NULL").
		Joins("LEFT JOIN requesters r ON r.user_id = u.id AND r.deleted_at IS NULL").
		Where("u.is_active = ? AND u.deleted_at IS NULL", true)
}

func toRecipients(rows []recipientRow) []dto.Recipient {
	out := make([]dto.Recipient, 0, len(rows))
	for _, row := range rows {
		name := strings.TrimSpace(row.Name)
		if name == "" {
			name = row.Email
		}
		out = append(out, dto.Recipient{UserID: row.ID, Email: row.Email, Name: name})
	}
	return out
}

func (r *RecipientRepository) Resolve(spec dto.AudienceSpec) ([]dto.Recipient, error) {
	q := r.baseQuery()

	switch spec.Type {
	case "all":
	case "roles":
		if len(spec.Roles) == 0 {
			return []dto.Recipient{}, nil
		}
		userIDs, err := r.userIDsByRoles(spec.Roles)
		if err != nil {
			return nil, err
		}
		if len(userIDs) == 0 {
			return []dto.Recipient{}, nil
		}
		q = q.Where("u.id IN ?", userIDs)
	case "requester_types":
		if len(spec.RequesterTypeIDs) == 0 {
			return []dto.Recipient{}, nil
		}
		q = q.Where("r.requester_type_id IN ?", spec.RequesterTypeIDs)
	case "users":
		if len(spec.UserIDs) == 0 {
			return []dto.Recipient{}, nil
		}
		q = q.Where("u.id IN ?", spec.UserIDs)
	default:
		return []dto.Recipient{}, nil
	}

	var rows []recipientRow
	if err := q.Order("u.id").Scan(&rows).Error; err != nil {
		return nil, err
	}
	return toRecipients(rows), nil
}

func (r *RecipientRepository) userIDsByRoles(names []string) ([]uint, error) {
	var roles []models.Roles
	if err := r.db.Preload("Users").Where("name IN ?", names).Find(&roles).Error; err != nil {
		return nil, err
	}
	seen := map[uint]struct{}{}
	var ids []uint
	for _, role := range roles {
		for _, u := range role.Users {
			if _, ok := seen[u.ID]; ok {
				continue
			}
			seen[u.ID] = struct{}{}
			ids = append(ids, u.ID)
		}
	}
	return ids, nil
}

func (r *RecipientRepository) Search(q string, limit int) ([]dto.Recipient, error) {
	if limit <= 0 {
		limit = 20
	}
	query := r.baseQuery()
	if q = strings.TrimSpace(q); q != "" {
		like := "%" + strings.ToLower(q) + "%"
		query = query.Where(
			`LOWER(u.email) LIKE ? OR
			 LOWER(COALESCE(a.first_name, s.first_name, r.first_name, '')) LIKE ? OR
			 LOWER(COALESCE(a.last_name,  s.last_name,  r.last_name,  '')) LIKE ?`,
			like, like, like,
		)
	}
	var rows []recipientRow
	if err := query.Order("u.id").Limit(limit).Scan(&rows).Error; err != nil {
		return nil, err
	}
	return toRecipients(rows), nil
}
