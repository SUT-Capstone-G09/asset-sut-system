package services

import (
	"errors"
	"fmt"
	htmltemplate "html/template"
	texttemplate "text/template"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
)

var ErrInvalidTemplateSyntax = errors.New("invalid template syntax")

type EmailTemplateService struct {
	repo *repositories.EmailTemplateRepository
}

func NewEmailTemplateService(repo *repositories.EmailTemplateRepository) *EmailTemplateService {
	return &EmailTemplateService{repo: repo}
}

func (s *EmailTemplateService) GetAll(search string) ([]dto.EmailTemplateResponse, error) {
	templates, err := s.repo.FindAll(search)
	if err != nil {
		return nil, err
	}
	result := make([]dto.EmailTemplateResponse, 0, len(templates))
	for _, t := range templates {
		result = append(result, toEmailTemplateResponse(t))
	}
	return result, nil
}

func (s *EmailTemplateService) GetByID(id uint) (*dto.EmailTemplateResponse, error) {
	t, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	res := toEmailTemplateResponse(*t)
	return &res, nil
}

func (s *EmailTemplateService) Create(req dto.CreateEmailTemplateRequest) (*dto.EmailTemplateResponse, error) {
	if err := validateTemplateSyntax(req.Subject, req.CompiledHTML); err != nil {
		return nil, err
	}
	active := true
	if req.IsActive != nil {
		active = *req.IsActive
	}
	t := &models.EmailTemplate{
		Key:          req.Key,
		Name:         req.Name,
		Subject:      req.Subject,
		ProjectData:  req.ProjectData,
		CompiledHTML: req.CompiledHTML,
		IsActive:     active,
	}
	if err := s.repo.Create(t); err != nil {
		return nil, err
	}
	res := toEmailTemplateResponse(*t)
	return &res, nil
}

func (s *EmailTemplateService) Update(id uint, req dto.UpdateEmailTemplateRequest) (*dto.EmailTemplateResponse, error) {
	t, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if req.Name != nil {
		t.Name = *req.Name
	}
	if req.Subject != nil {
		t.Subject = *req.Subject
	}
	if req.ProjectData != nil {
		t.ProjectData = *req.ProjectData
	}
	if req.CompiledHTML != nil {
		t.CompiledHTML = *req.CompiledHTML
	}
	if req.IsActive != nil {
		t.IsActive = *req.IsActive
	}
	if err := validateTemplateSyntax(t.Subject, t.CompiledHTML); err != nil {
		return nil, err
	}
	if err := s.repo.Update(t); err != nil {
		return nil, err
	}
	res := toEmailTemplateResponse(*t)
	return &res, nil
}

func (s *EmailTemplateService) Delete(id uint) error {
	return s.repo.Delete(id)
}

func validateTemplateSyntax(subject, compiledHTML string) error {
	if _, err := texttemplate.New("subject").Parse(subject); err != nil {
		return fmt.Errorf("%w: subject: %v", ErrInvalidTemplateSyntax, err)
	}
	if _, err := htmltemplate.New("body").Parse(compiledHTML); err != nil {
		return fmt.Errorf("%w: body: %v", ErrInvalidTemplateSyntax, err)
	}
	return nil
}

func toEmailTemplateResponse(t models.EmailTemplate) dto.EmailTemplateResponse {
	return dto.EmailTemplateResponse{
		ID:           t.ID,
		Key:          t.Key,
		Name:         t.Name,
		Subject:      t.Subject,
		ProjectData:  t.ProjectData,
		CompiledHTML: t.CompiledHTML,
		IsActive:     t.IsActive,
	}
}
