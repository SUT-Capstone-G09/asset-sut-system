package services

import (
	"bytes"
	"embed"
	"fmt"
	"html"
	"html/template"
	"log"
	"regexp"
	"strings"
	texttemplate "text/template"
	"time"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
	"gopkg.in/gomail.v2"
)

//go:embed templates/email/*.html templates/email/*.txt
var emailTemplateFS embed.FS

const (
	emailQueueSize     = 100
	emailMaxAttempts   = 3
	emailSendTimeout   = 30 * time.Second
	outboxPollInterval = 3 * time.Second
	outboxBatchSize    = 20
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
	cfg        config.SMTPConfig
	dialer     *gomail.Dialer
	htmlTmpl   *template.Template
	textTmpl   *texttemplate.Template
	repo       *repositories.EmailTemplateRepository
	outboxRepo *repositories.EmailOutboxRepository
	queue      chan emailJob
}

func NewEmailService(cfg config.SMTPConfig, repo *repositories.EmailTemplateRepository, outboxRepo *repositories.EmailOutboxRepository) (*EmailService, error) {
	htmlTmpl, err := template.ParseFS(emailTemplateFS, "templates/email/*.html")
	if err != nil {
		return nil, fmt.Errorf("parse html email templates: %w", err)
	}
	textTmpl, err := texttemplate.ParseFS(emailTemplateFS, "templates/email/*.txt")
	if err != nil {
		return nil, fmt.Errorf("parse text email templates: %w", err)
	}

	s := &EmailService{
		cfg:        cfg,
		dialer:     gomail.NewDialer(cfg.Host, cfg.Port, cfg.Username, cfg.Password),
		htmlTmpl:   htmlTmpl,
		textTmpl:   textTmpl,
		repo:       repo,
		outboxRepo: outboxRepo,
		queue:      make(chan emailJob, emailQueueSize),
	}

	go s.worker()

	if outboxRepo != nil {
		if n, err := outboxRepo.RequeueStuckSending(); err != nil {
			log.Printf("outbox: failed to requeue stuck rows on startup: %v", err)
		} else if n > 0 {
			log.Printf("outbox: requeued %d stuck 'sending' rows on startup", n)
		}
		go s.outboxWorker()
	}

	return s, nil
}

func (s *EmailService) Render(key string, data map[string]any) (subject, html, text string, err error) {
	return s.render(key, data)
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
			return subject, html, htmlToText(html), nil
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
	for attempt := 1; attempt <= emailMaxAttempts; attempt++ {
		if err := s.sendWithTimeout(s.buildMessage(job)); err == nil {
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

func (s *EmailService) buildMessage(job emailJob) *gomail.Message {
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
	return m
}

func (s *EmailService) sendWithTimeout(m *gomail.Message) error {
	done := make(chan error, 1)
	go func() {
		done <- s.dialer.DialAndSend(m)
	}()
	select {
	case err := <-done:
		return err
	case <-time.After(emailSendTimeout):
		return fmt.Errorf("smtp send timed out after %s", emailSendTimeout)
	}
}

func (s *EmailService) outboxWorker() {
	ticker := time.NewTicker(outboxPollInterval)
	defer ticker.Stop()
	for range ticker.C {
		rows, err := s.outboxRepo.ClaimPending(outboxBatchSize)
		if err != nil {
			log.Printf("outbox: claim pending failed: %v", err)
			continue
		}
		for _, row := range rows {
			s.deliverOutbox(row)
		}
	}
}

func (s *EmailService) deliverOutbox(row models.EmailOutbox) {
	attempts := row.Attempts + 1
	m := s.buildMessage(emailJob{to: row.ToEmail, subject: row.Subject, html: row.HTML, text: row.Text})

	if err := s.sendWithTimeout(m); err != nil {
		if attempts >= emailMaxAttempts {
			log.Printf("outbox: permanently failed id=%d to=%s after %d attempts: %v", row.ID, row.ToEmail, attempts, err)
			if e := s.outboxRepo.MarkFailed(row.ID, attempts, err.Error()); e != nil {
				log.Printf("outbox: mark failed id=%d error: %v", row.ID, e)
			}
			return
		}
		log.Printf("outbox: attempt %d/%d failed id=%d to=%s: %v", attempts, emailMaxAttempts, row.ID, row.ToEmail, err)
		if e := s.outboxRepo.MarkRetry(row.ID, attempts, err.Error()); e != nil {
			log.Printf("outbox: mark retry id=%d error: %v", row.ID, e)
		}
		return
	}

	if e := s.outboxRepo.MarkSent(row.ID); e != nil {
		log.Printf("outbox: mark sent id=%d error: %v", row.ID, e)
	}
	log.Printf("outbox: sent id=%d to=%s", row.ID, row.ToEmail)
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

var (
	reScriptStyle = regexp.MustCompile(`(?is)<(script|style)[^>]*>.*?</(script|style)>`)
	reBlockBreak  = regexp.MustCompile(`(?i)<(br|/p|/div|/tr|/h[1-6]|/li)\s*/?>`)
	reTag         = regexp.MustCompile(`<[^>]+>`)
	reLeadWS      = regexp.MustCompile(`(?m)^[ \t]+`)
	reTrailWS     = regexp.MustCompile(`[ \t]+\n`)
	reBlankLines  = regexp.MustCompile(`\n{3,}`)
)

func htmlToText(htmlBody string) string {
	s := reScriptStyle.ReplaceAllString(htmlBody, "")
	s = reBlockBreak.ReplaceAllString(s, "\n")
	s = reTag.ReplaceAllString(s, "")
	s = html.UnescapeString(s)
	s = reLeadWS.ReplaceAllString(s, "")
	s = reTrailWS.ReplaceAllString(s, "\n")
	s = reBlankLines.ReplaceAllString(s, "\n\n")
	return strings.TrimSpace(s)
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
