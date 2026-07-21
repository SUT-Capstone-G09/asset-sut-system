package services

import (
	"fmt"
	"maps"
	"strings"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
)

const previewSampleSize = 5

type EmailBroadcastService struct {
	recipientRepo *repositories.RecipientRepository
	templateRepo  *repositories.EmailTemplateRepository
	broadcastRepo *repositories.EmailBroadcastRepository
	outboxRepo    *repositories.EmailOutboxRepository
	email         *EmailService
	roleRepo      *repositories.RoleRepository
	requesterRepo *repositories.RequesterRepository
}

func NewEmailBroadcastService(
	recipientRepo *repositories.RecipientRepository,
	templateRepo *repositories.EmailTemplateRepository,
	broadcastRepo *repositories.EmailBroadcastRepository,
	outboxRepo *repositories.EmailOutboxRepository,
	email *EmailService,
	roleRepo *repositories.RoleRepository,
	requesterRepo *repositories.RequesterRepository,
) *EmailBroadcastService {
	return &EmailBroadcastService{
		recipientRepo: recipientRepo,
		templateRepo:  templateRepo,
		broadcastRepo: broadcastRepo,
		outboxRepo:    outboxRepo,
		email:         email,
		roleRepo:      roleRepo,
		requesterRepo: requesterRepo,
	}
}

func (s *EmailBroadcastService) Preview(spec dto.AudienceSpec) (*dto.PreviewAudienceResponse, error) {
	recipients, err := s.recipientRepo.Resolve(spec)
	if err != nil {
		return nil, err
	}
	sample := recipients
	if len(sample) > previewSampleSize {
		sample = sample[:previewSampleSize]
	}
	return &dto.PreviewAudienceResponse{Count: len(recipients), Sample: sample}, nil
}

func (s *EmailBroadcastService) Create(req dto.SendBroadcastRequest, adminUserID uint) (*dto.CreateBroadcastResponse, error) {
	recipients, err := s.recipientRepo.Resolve(req.Audience)
	if err != nil {
		return nil, err
	}
	if len(recipients) == 0 {
		return nil, fmt.Errorf("no recipients matched the selected audience")
	}

	// Render every message up-front. A bad template or a missing variable fails
	// the whole request here, before any broadcast row is persisted — so we never
	// leave behind an orphaned broadcast with zero outbox rows. BroadcastID is
	// assigned later, inside the transaction.
	rows := make([]*models.EmailOutbox, 0, len(recipients))
	for _, r := range recipients {
		data := map[string]any{}
		maps.Copy(data, req.Data)
		data["userName"] = r.Name

		subject, html, text, err := s.email.Render(req.TemplateKey, data)
		if err != nil {
			return nil, fmt.Errorf("render template %q for %s: %w", req.TemplateKey, r.Email, err)
		}
		rows = append(rows, &models.EmailOutbox{
			ToEmail: r.Email,
			Subject: subject,
			HTML:    html,
			Text:    text,
			Status:  models.OutboxPending,
		})
	}

	broadcast := &models.EmailBroadcast{
		TemplateKey:     req.TemplateKey,
		AudienceType:    req.Audience.Type,
		AudienceDesc:    describeAudience(req.Audience),
		TotalRecipients: len(recipients),
		CreatedByUserID: adminUserID,
	}

	// Persist broadcast + outbox atomically (see CreateWithOutbox).
	if err := s.broadcastRepo.CreateWithOutbox(broadcast, rows); err != nil {
		return nil, err
	}

	return &dto.CreateBroadcastResponse{BroadcastID: broadcast.ID, TotalRecipients: len(recipients)}, nil
}

func (s *EmailBroadcastService) Get(id uint) (*dto.BroadcastResponse, error) {
	b, err := s.broadcastRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	counts, err := s.outboxRepo.CountByStatus(b.ID)
	if err != nil {
		return nil, err
	}
	res := toBroadcastResponse(*b, counts)
	return &res, nil
}

func (s *EmailBroadcastService) List() ([]dto.BroadcastResponse, error) {
	list, err := s.broadcastRepo.FindAll()
	if err != nil {
		return nil, err
	}
	ids := make([]uint, len(list))
	for i, b := range list {
		ids[i] = b.ID
	}
	// One grouped query for all broadcasts instead of one COUNT per row.
	countsByID, err := s.outboxRepo.CountByStatusForBroadcasts(ids)
	if err != nil {
		return nil, err
	}
	result := make([]dto.BroadcastResponse, 0, len(list))
	for _, b := range list {
		result = append(result, toBroadcastResponse(b, countsByID[b.ID]))
	}
	return result, nil
}

// Recipients lists the per-recipient delivery status of a broadcast so an admin
// can see exactly who did (or did not) receive the email. An empty status
// returns every recipient; "failed" narrows it to the ones that bounced.
func (s *EmailBroadcastService) Recipients(id uint, status string) ([]dto.BroadcastRecipientResponse, error) {
	rows, err := s.outboxRepo.ListByBroadcast(id, status)
	if err != nil {
		return nil, err
	}
	result := make([]dto.BroadcastRecipientResponse, 0, len(rows))
	for _, row := range rows {
		result = append(result, dto.BroadcastRecipientResponse{
			ID:        row.ID,
			ToEmail:   row.ToEmail,
			Status:    row.Status,
			Attempts:  row.Attempts,
			LastError: row.LastError,
		})
	}
	return result, nil
}

func (s *EmailBroadcastService) Options() (*dto.AudienceOptionsResponse, error) {
	roles, err := s.roleRepo.FindAll()
	if err != nil {
		return nil, err
	}
	roleNames := make([]string, 0, len(roles))
	for _, r := range roles {
		roleNames = append(roleNames, r.Name)
	}

	types, err := s.requesterRepo.FindAllRequesterTypes()
	if err != nil {
		return nil, err
	}
	typeOpts := make([]dto.RequesterTypeOption, 0, len(types))
	for _, t := range types {
		typeOpts = append(typeOpts, dto.RequesterTypeOption{ID: t.ID, Type: t.Type})
	}

	return &dto.AudienceOptionsResponse{Roles: roleNames, RequesterTypes: typeOpts}, nil
}

func (s *EmailBroadcastService) SearchRecipients(q string) ([]dto.Recipient, error) {
	// No cap: an empty query lists every user (browse the full roster) and a text
	// query returns every match — the picker lets admins scroll and filter it.
	return s.recipientRepo.Search(q, 0)
}

func describeAudience(spec dto.AudienceSpec) string {
	switch spec.Type {
	case "all":
		return "ผู้ใช้ทั้งหมด"
	case "roles":
		return "role: " + strings.Join(spec.Roles, ", ")
	case "requester_types":
		ids := make([]string, len(spec.RequesterTypeIDs))
		for i, id := range spec.RequesterTypeIDs {
			ids[i] = fmt.Sprintf("%d", id)
		}
		return "requester type: " + strings.Join(ids, ", ")
	case "users":
		return fmt.Sprintf("เลือกรายคน (%d)", len(spec.UserIDs))
	default:
		return spec.Type
	}
}

func toBroadcastResponse(b models.EmailBroadcast, counts map[string]int) dto.BroadcastResponse {
	return dto.BroadcastResponse{
		ID:              b.ID,
		TemplateKey:     b.TemplateKey,
		AudienceType:    b.AudienceType,
		AudienceDesc:    b.AudienceDesc,
		TotalRecipients: b.TotalRecipients,
		CreatedAt:       b.CreatedAt.Format("2006-01-02 15:04:05"),
		Counts:          counts,
	}
}
