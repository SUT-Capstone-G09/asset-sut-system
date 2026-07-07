// Package easyslip is a thin HTTP client for the EasySlip slip-verification API
// (https://document.easyslip.com). It uploads a bank-transfer slip (image or the
// QR payload decoded from one) and returns the parsed transaction details used to
// match a payment back to a booking.
//
// The response mapping follows the documented v2 shape. The full raw body is kept
// on VerifyResult.Raw so nothing is lost if a field name differs in practice —
// confirm the mapping against a live response before relying on it.
package easyslip

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"strings"
	"time"
)

// defaultVerifyURL is the full EasySlip V2 bank-slip verify endpoint. V2 records
// each verification in the dashboard; the legacy V1 endpoint
// (https://developer.easyslip.com/api/v1/verify) does not.
const defaultVerifyURL = "https://api.easyslip.com/v2/verify/bank"

// ErrNotConfigured is returned when no API key is set.
var ErrNotConfigured = errors.New("easyslip: api key not configured")

// APIError carries EasySlip's own error message, e.g. "duplicate_slip",
// "slip_not_found", "invalid_amount".
type APIError struct {
	StatusCode int
	Message    string
}

func (e *APIError) Error() string { return "easyslip: " + e.Message }

// Client talks to the EasySlip verify endpoint.
type Client struct {
	apiKey    string
	verifyURL string
	http      *http.Client
}

// New builds a client. verifyURL is the full verify endpoint; pass empty to use
// the default V2 endpoint.
func New(apiKey, verifyURL string) *Client {
	u := strings.TrimRight(strings.TrimSpace(verifyURL), "/")
	if u == "" {
		u = defaultVerifyURL
	}
	return &Client{
		apiKey:    strings.TrimSpace(apiKey),
		verifyURL: u,
		http:      &http.Client{Timeout: 20 * time.Second},
	}
}

// VerifyResult is the normalized subset of the EasySlip response this system uses.
type VerifyResult struct {
	TransRef     string    // bank transaction reference (dedupe key)
	Ref1         string    // bill-payment reference 1 (matched to the issued QR ref)
	Ref2         string    // bill-payment reference 2
	Ref3         string    // bill-payment reference 3
	Amount       float64   // amount read from the slip
	ReceiverName string    // payee account name
	ReceiverBank string    // payee bank id
	SenderName   string    // payer account name
	Date         time.Time // transaction datetime on the slip
	Payload      string    // raw QR payload embedded in the slip
	Raw          string    // full response body, kept for audit
}

// VerifyByImage verifies a slip from its raw image bytes.
func (c *Client) VerifyByImage(ctx context.Context, filename string, image []byte) (*VerifyResult, error) {
	if c.apiKey == "" {
		return nil, ErrNotConfigured
	}

	var body bytes.Buffer
	w := multipart.NewWriter(&body)
	// EasySlip V2 expects the multipart field to be named "image".
	part, err := w.CreateFormFile("image", filename)
	if err != nil {
		return nil, err
	}
	if _, err := part.Write(image); err != nil {
		return nil, err
	}
	if err := w.Close(); err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.verifyURL, &body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", w.FormDataContentType())
	return c.do(req)
}

// VerifyByPayload verifies a slip from the QR payload string decoded from it.
// Useful for testing without an image file.
func (c *Client) VerifyByPayload(ctx context.Context, payload string) (*VerifyResult, error) {
	if c.apiKey == "" {
		return nil, ErrNotConfigured
	}

	b, err := json.Marshal(map[string]string{"payload": payload})
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.verifyURL, bytes.NewReader(b))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	return c.do(req)
}

func (c *Client) do(req *http.Request) (*VerifyResult, error) {
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("easyslip request: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var parsed apiResponse
	_ = json.Unmarshal(raw, &parsed) // tolerate non-JSON error bodies

	if resp.StatusCode < 200 || resp.StatusCode >= 300 || parsed.Data == nil {
		msg := parsed.Message
		if msg == "" && parsed.Error != nil {
			msg = parsed.Error.Message // V2 nests the error under "error.message"
		}
		if msg == "" {
			// Surface the raw body so an unmapped error shape stays visible.
			body := strings.TrimSpace(string(raw))
			if len(body) > 300 {
				body = body[:300]
			}
			msg = fmt.Sprintf("http %d: %s", resp.StatusCode, body)
		}
		return nil, &APIError{StatusCode: resp.StatusCode, Message: msg}
	}

	// V2 nests the slip under data.rawSlip; V1 returns it inline on data.
	slip := &parsed.Data.apiSlip
	if parsed.Data.RawSlip != nil {
		slip = parsed.Data.RawSlip
	}
	date, _ := time.Parse(time.RFC3339, slip.Date)

	return &VerifyResult{
		TransRef:     slip.TransRef,
		Ref1:         slip.Ref1,
		Ref2:         slip.Ref2,
		Ref3:         slip.Ref3,
		Amount:       slip.Amount.Value,
		ReceiverName: slip.Receiver.Account.Name.preferred(),
		ReceiverBank: slip.Receiver.Bank.ID,
		SenderName:   slip.Sender.Account.Name.preferred(),
		Date:         date,
		Payload:      slip.Payload,
		Raw:          string(raw),
	}, nil
}

// ── response mapping ──────────────────────────────────────────────────────────

type apiResponse struct {
	Status  int       `json:"status"`  // V1 (developer.easyslip.com)
	Success bool      `json:"success"` // V2 (api.easyslip.com)
	Message string    `json:"message"`
	Error   *apiError `json:"error"` // V2 nests errors here
	Data    *apiData  `json:"data"`
}

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// apiData carries the slip fields inline (V1) plus an optional rawSlip wrapper (V2).
// The embedded apiSlip is populated for V1; RawSlip is populated for V2.
type apiData struct {
	RawSlip *apiSlip `json:"rawSlip"`
	apiSlip
}

type apiSlip struct {
	Payload  string    `json:"payload"`
	TransRef string    `json:"transRef"`
	Date     string    `json:"date"`
	Amount   apiAmount `json:"amount"`
	Ref1     string    `json:"ref1"`
	Ref2     string    `json:"ref2"`
	Ref3     string    `json:"ref3"`
	Sender   apiParty  `json:"sender"`
	Receiver apiParty  `json:"receiver"`
}

type apiParty struct {
	Bank    apiBank    `json:"bank"`
	Account apiAccount `json:"account"`
}

type apiBank struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Short string `json:"short"`
}

type apiAccount struct {
	Name apiName `json:"name"`
}

type apiName struct {
	Th string `json:"th"`
	En string `json:"en"`
}

func (n apiName) preferred() string {
	if strings.TrimSpace(n.Th) != "" {
		return n.Th
	}
	return n.En
}

// apiAmount tolerates both a flat number ("amount": 1000) and the object form
// ("amount": { "amount": 1000, "local": { "amount": 1000 } }).
type apiAmount struct {
	Value float64
}

func (a *apiAmount) UnmarshalJSON(b []byte) error {
	var n float64
	if err := json.Unmarshal(b, &n); err == nil {
		a.Value = n
		return nil
	}
	var obj struct {
		Amount float64 `json:"amount"`
		Local  struct {
			Amount float64 `json:"amount"`
		} `json:"local"`
	}
	if err := json.Unmarshal(b, &obj); err != nil {
		return err
	}
	if obj.Amount != 0 {
		a.Value = obj.Amount
	} else {
		a.Value = obj.Local.Amount
	}
	return nil
}
