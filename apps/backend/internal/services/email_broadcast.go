package services

import (
	"fmt"
	"maps"
	"strings"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
)

// previewSampleSize caps how many recipients the preview returns alongside the
// total count.
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

// Preview resolves an audience without sending, returning the total count and a
// small sample so the admin can sanity-check before committing.
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

// Create resolves the audience, renders one email per recipient (filling
// {{.userName}} from the recipient and merging the admin's static Data), and
// persists them to the outbox for the background worker to deliver.
func (s *EmailBroadcastService) Create(req dto.SendBroadcastRequest, adminUserID uint) (*dto.CreateBroadcastResponse, error) {
	recipients, err := s.recipientRepo.Resolve(req.Audience)
	if err != nil {
		return nil, err
	}
	if len(recipients) == 0 {
		return nil, fmt.Errorf("no recipients matched the selected audience")
	}

	broadcast := &models.EmailBroadcast{
		TemplateKey:     req.TemplateKey,
		AudienceType:    req.Audience.Type,
		AudienceDesc:    describeAudience(req.Audience),
		TotalRecipients: len(recipients),
		CreatedByUserID: adminUserID,
	}
	if err := s.broadcastRepo.Create(broadcast); err != nil {
		return nil, err
	}

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
			BroadcastID: &broadcast.ID,
			ToEmail:     r.Email,
			Subject:     subject,
			HTML:        html,
			Text:        text,
			Status:      models.OutboxPending,
		})
	}
	if err := s.outboxRepo.CreateBatch(rows); err != nil {
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
	result := make([]dto.BroadcastResponse, 0, len(list))
	for _, b := range list {
		counts, err := s.outboxRepo.CountByStatus(b.ID)
		if err != nil {
			return nil, err
		}
		result = append(result, toBroadcastResponse(b, counts))
	}
	return result, nil
}

// Options returns the role names and requester types available as audience
// filters in the compose UI.
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
	return s.recipientRepo.Search(q, 20)
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
