package services

import (
	"bytes"
	"embed"
	"fmt"
	"html/template"
	"log"
	texttemplate "text/template"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
	"gopkg.in/gomail.v2"
)

//go:embed templates/email/*.html templates/email/*.txt
var emailTemplateFS embed.FS

const (
	emailQueueSize   = 100
	emailMaxAttempts = 3
)

type emailTemplate struct {
	subject  string
	htmlFile string
	textFile string
}

var systemTemplates = map[string]emailTemplate{
	"booking.approved": {
		subject:  "การจองของคุณได้รับการอนุมัติแล้ว - รอการชำระเงิน",
		htmlFile: "booking_approved.html",
		textFile: "booking_approved.txt",
	},
}

type emailJob struct {
	to      string
	subject string
	html    string
	text    string
}

type EmailService struct {
	cfg      config.SMTPConfig
	dialer   *gomail.Dialer
	htmlTmpl *template.Template
	textTmpl *texttemplate.Template
	repo     *repositories.EmailTemplateRepository
	queue    chan emailJob
}

func NewEmailService(cfg config.SMTPConfig, repo *repositories.EmailTemplateRepository) (*EmailService, error) {
	htmlTmpl, err := template.ParseFS(emailTemplateFS, "templates/email/*.html")
	if err != nil {
		return nil, fmt.Errorf("parse html email templates: %w", err)
	}
	textTmpl, err := texttemplate.ParseFS(emailTemplateFS, "templates/email/*.txt")
	if err != nil {
		return nil, fmt.Errorf("parse text email templates: %w", err)
	}

	s := &EmailService{
		cfg:      cfg,
		dialer:   gomail.NewDialer(cfg.Host, cfg.Port, cfg.Username, cfg.Password),
		htmlTmpl: htmlTmpl,
		textTmpl: textTmpl,
		repo:     repo,
		queue:    make(chan emailJob, emailQueueSize),
	}

	go s.worker()

	return s, nil
}

func (s *EmailService) Send(to, key string, data map[string]any) error {
	subject, html, text, err := s.render(key, data)
	if err != nil {
		return err
	}

	job := emailJob{to: to, subject: subject, html: html, text: text}
	select {
	case s.queue <- job:
		return nil
	default:
		return fmt.Errorf("email queue is full; message to %s dropped", to)
	}
}

func (s *EmailService) render(key string, data map[string]any) (subject, html, text string, err error) {
	if s.repo != nil {
		if t, dbErr := s.repo.FindActiveByKey(key); dbErr == nil && t != nil {
			subject, err = renderTextString("subject", t.Subject, data)
			if err != nil {
				return "", "", "", fmt.Errorf("render db subject for %q: %w", key, err)
			}
			html, err = renderHTMLString(key, t.CompiledHTML, data)
			if err != nil {
				return "", "", "", fmt.Errorf("render db body for %q: %w", key, err)
			}
			return subject, html, "", nil
		}
	}

	tpl, ok := systemTemplates[key]
	if !ok {
		return "", "", "", fmt.Errorf("unknown email template: %q", key)
	}

	subject, err = renderTextString("subject", tpl.subject, data)
	if err != nil {
		return "", "", "", fmt.Errorf("render subject for %q: %w", key, err)
	}

	var htmlBuf bytes.Buffer
	if err = s.htmlTmpl.ExecuteTemplate(&htmlBuf, tpl.htmlFile, data); err != nil {
		return "", "", "", fmt.Errorf("render html body for %q: %w", key, err)
	}

	if tpl.textFile != "" {
		var textBuf bytes.Buffer
		if err = s.textTmpl.ExecuteTemplate(&textBuf, tpl.textFile, data); err != nil {
			return "", "", "", fmt.Errorf("render text body for %q: %w", key, err)
		}
		text = textBuf.String()
	}

	return subject, htmlBuf.String(), text, nil
}

func (s *EmailService) worker() {
	for job := range s.queue {
		s.deliver(job)
	}
}

func (s *EmailService) deliver(job emailJob) {
	m := gomail.NewMessage()
	m.SetHeader("From", m.FormatAddress(s.cfg.From, s.cfg.FromName))
	m.SetHeader("To", job.to)
	m.SetHeader("Subject", job.subject)
	if job.text != "" {
		m.SetBody("text/plain", job.text)
		m.AddAlternative("text/html", job.html)
	} else {
		m.SetBody("text/html", job.html)
	}

	for attempt := 1; attempt <= emailMaxAttempts; attempt++ {
		if err := s.dialer.DialAndSend(m); err == nil {
			log.Printf("email sent to %s (subject=%q)", job.to, job.subject)
			return
		} else {
			log.Printf("email send attempt %d/%d to %s failed: %v", attempt, emailMaxAttempts, job.to, err)
			if attempt < emailMaxAttempts {
				time.Sleep(time.Duration(attempt) * 2 * time.Second)
			}
		}
	}
	log.Printf("email permanently failed to %s after %d attempts (subject=%q)", job.to, emailMaxAttempts, job.subject)
}

func renderTextString(name, tmplStr string, data map[string]any) (string, error) {
	t, err := texttemplate.New(name).Parse(tmplStr)
	if err != nil {
		return "", err
	}
	var b bytes.Buffer
	if err := t.Execute(&b, data); err != nil {
		return "", err
	}
	return b.String(), nil
}

func renderHTMLString(name, tmplStr string, data map[string]any) (string, error) {
	t, err := template.New(name).Parse(tmplStr)
	if err != nil {
		return "", err
	}
	var b bytes.Buffer
	if err := t.Execute(&b, data); err != nil {
		return "", err
	}
	return b.String(), nil
}
