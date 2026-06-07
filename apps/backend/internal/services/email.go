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
	"gopkg.in/gomail.v2"
)

// emailTemplateFS embeds the email templates into the binary so the service has
// no runtime file dependency. Each system email has an .html body and (optionally)
// a .txt plain-text alternative under templates/email/.
//

var emailTemplateFS embed.FS

const (
	emailQueueSize   = 100
	emailMaxAttempts = 3
)

// emailTemplate describes one system email: the embedded files that render its
// body and the subject line (which may itself contain {{.var}} placeholders).
type emailTemplate struct {
	subject  string
	htmlFile string
	textFile string // optional plain-text alternative; "" to skip
}

// systemTemplates is the registry of code-defined emails. Any module sends one by
// its key via EmailService.Send — it never needs to know the files or subject.
var systemTemplates = map[string]emailTemplate{
	"booking.approved": {
		subject:  "การจองของคุณได้รับการอนุมัติแล้ว - รอการชำระเงิน",
		htmlFile: "booking_approved.html",
		textFile: "booking_approved.txt",
	},
}

// emailJob is a fully rendered message handed to the background worker.
type emailJob struct {
	to      string
	subject string
	html    string
	text    string // empty if the template has no plain-text alternative
}

// EmailService renders system email templates and sends them over SMTP. Sending
// is asynchronous: Send renders and validates immediately, then queues the
// message to a background worker that handles SMTP with retries. This keeps email
// failures from breaking the request that triggered them. It is a shared,
// module-agnostic service: inject it anywhere and call Send.
type EmailService struct {
	cfg      config.SMTPConfig
	dialer   *gomail.Dialer
	htmlTmpl *template.Template
	textTmpl *texttemplate.Template
	queue    chan emailJob
}

// NewEmailService parses all embedded templates once at startup (so a bad
// template fails fast) and starts the background delivery worker.
func NewEmailService(cfg config.SMTPConfig) (*EmailService, error) {
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
		queue:    make(chan emailJob, emailQueueSize),
	}

	go s.worker()

	return s, nil
}

// Send renders the template identified by key with data and queues it for
// delivery. data keys map to {{.key}} placeholders in the subject and body. It
// returns an error only for problems detectable up front (unknown template, bad
// render, full queue); actual SMTP delivery happens in the background and its
// outcome is logged, not returned.
func (s *EmailService) Send(to, key string, data map[string]any) error {
	tpl, ok := systemTemplates[key]
	if !ok {
		return fmt.Errorf("unknown email template: %q", key)
	}

	subject, err := renderSubject(tpl.subject, data)
	if err != nil {
		return fmt.Errorf("render subject for %q: %w", key, err)
	}

	var htmlBuf bytes.Buffer
	if err := s.htmlTmpl.ExecuteTemplate(&htmlBuf, tpl.htmlFile, data); err != nil {
		return fmt.Errorf("render html body for %q: %w", key, err)
	}

	var text string
	if tpl.textFile != "" {
		var textBuf bytes.Buffer
		if err := s.textTmpl.ExecuteTemplate(&textBuf, tpl.textFile, data); err != nil {
			return fmt.Errorf("render text body for %q: %w", key, err)
		}
		text = textBuf.String()
	}

	job := emailJob{to: to, subject: subject, html: htmlBuf.String(), text: text}
	select {
	case s.queue <- job:
		return nil
	default:
		return fmt.Errorf("email queue is full; message to %s dropped", to)
	}
}

// worker drains the queue and delivers each message. It runs for the lifetime of
// the process.
func (s *EmailService) worker() {
	for job := range s.queue {
		s.deliver(job)
	}
}

// deliver sends one message over SMTP, retrying transient failures with a simple
// linear backoff. Every outcome is logged.
func (s *EmailService) deliver(job emailJob) {
	m := gomail.NewMessage()
	m.SetHeader("From", m.FormatAddress(s.cfg.From, s.cfg.FromName))
	m.SetHeader("To", job.to)
	m.SetHeader("Subject", job.subject)
	// Plain text first, HTML as the richer alternative (RFC 2046 ordering: clients
	// pick the last part they can render).
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

// renderSubject interpolates {{.var}} in the subject line. It uses text/template
// (not html/template) so the plain-text subject is not HTML-escaped.
func renderSubject(subject string, data map[string]any) (string, error) {
	t, err := texttemplate.New("subject").Parse(subject)
	if err != nil {
		return "", err
	}
	var b bytes.Buffer
	if err := t.Execute(&b, data); err != nil {
		return "", err
	}
	return b.String(), nil
}
