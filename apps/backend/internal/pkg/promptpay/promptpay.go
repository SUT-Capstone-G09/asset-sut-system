// Package promptpay builds EMVCo-compliant QR payment payloads (PromptPay and
// bill-payment "biller" mode) using TLV encoding and a CRC16-CCITT checksum.
//
// The functions here are pure (no I/O), so they are cheap to unit test. Payload
// strings produced here are fed to a QR renderer to create the actual image.
package promptpay

import (
	"errors"
	"fmt"
	"strings"
)

const (
	payloadFormat = "01"
	merchantCat   = "0000"
	currencyCode  = "764" // THB
	countryCode   = "TH"
	promptPayAID  = "A000000677010111"
	billerAID     = "A000000677010112"
)

// BuildPromptPayPayload builds a PromptPay (AnyID) QR payload for a phone number
// or national/tax id. rawID may contain dashes/spaces; amount is optional ("" =
// amount not fixed, payer enters it).
func BuildPromptPayPayload(rawID, merchantName, merchantCity, amount string) (string, error) {
	id, idType, err := normalizePromptPayID(rawID)
	if err != nil {
		return "", err
	}
	normAmount, err := normalizeAmount(amount)
	if err != nil {
		return "", err
	}

	merchantAccount := tlv("00", promptPayAID) + tlv(idType, id)
	return assemble("29", merchantAccount, merchantName, merchantCity, normAmount), nil
}

// BuildBillerPayload builds a bill-payment QR payload. reference1 is required,
// reference2 optional. amount is optional.
func BuildBillerPayload(rawBillerID, reference1, reference2, merchantName, merchantCity, amount string) (string, error) {
	billerID, err := normalizeBillerID(rawBillerID)
	if err != nil {
		return "", err
	}
	ref1, err := normalizeReference(reference1, "reference1", true)
	if err != nil {
		return "", err
	}
	ref2, err := normalizeReference(reference2, "reference2", false)
	if err != nil {
		return "", err
	}
	normAmount, err := normalizeAmount(amount)
	if err != nil {
		return "", err
	}

	merchantAccount := tlv("00", billerAID) + tlv("01", billerID) + tlv("02", ref1)
	if ref2 != "" {
		merchantAccount += tlv("03", ref2)
	}
	return assemble("30", merchantAccount, merchantName, merchantCity, normAmount), nil
}

// assemble joins the common EMVCo fields around the merchant-account block and
// appends the CRC16 checksum. accountTag is "29" (PromptPay) or "30" (biller).
func assemble(accountTag, merchantAccount, merchantName, merchantCity, amount string) string {
	pointOfInit := "11" // static (reusable)
	if amount != "" {
		pointOfInit = "12" // dynamic (single use, amount embedded)
	}

	fields := []string{
		tlv("00", payloadFormat),
		tlv("01", pointOfInit),
		tlv(accountTag, merchantAccount),
		tlv("52", merchantCat),
		tlv("53", currencyCode),
	}
	if amount != "" {
		fields = append(fields, tlv("54", amount))
	}
	fields = append(fields,
		tlv("58", countryCode),
		tlv("59", truncate(merchantName, 25)),
		tlv("60", truncate(merchantCity, 15)),
		"6304", // CRC tag + length, value computed over everything up to here
	)

	payload := strings.Join(fields, "")
	return payload + fmt.Sprintf("%04X", crc16(payload))
}

func normalizePromptPayID(raw string) (id string, idType string, err error) {
	clean := stripSeparators(raw)
	if clean == "" {
		return "", "", errors.New("promptpay id is required")
	}
	if !isDigits(clean) {
		return "", "", errors.New("promptpay id must be digits only")
	}
	switch len(clean) {
	case 10:
		if !strings.HasPrefix(clean, "0") {
			return "", "", errors.New("phone promptpay id must start with 0")
		}
		return "0066" + clean[1:], "01", nil // tag 01 = mobile number
	case 13:
		return clean, "02", nil // tag 02 = national id / tax id
	default:
		return "", "", errors.New("promptpay id must be 10 or 13 digits")
	}
}

func normalizeBillerID(raw string) (string, error) {
	clean := stripSeparators(raw)
	if clean == "" {
		return "", errors.New("biller id is required")
	}
	if !isDigits(clean) {
		return "", errors.New("biller id must be digits only")
	}
	if len(clean) != 15 {
		return "", errors.New("biller id must be 15 digits")
	}
	return clean, nil
}

func normalizeReference(raw, field string, required bool) (string, error) {
	clean := strings.ToUpper(strings.TrimSpace(raw))
	if clean == "" {
		if required {
			return "", fmt.Errorf("%s is required", field)
		}
		return "", nil
	}
	if len(clean) > 20 {
		return "", fmt.Errorf("%s must be 20 characters or less", field)
	}
	if !isAlphaNum(clean) {
		return "", fmt.Errorf("%s must be A-Z or 0-9 only", field)
	}
	return clean, nil
}

// normalizeAmount returns "" for an empty amount, otherwise a value with exactly
// two decimal places (e.g. "150" -> "150.00").
func normalizeAmount(raw string) (string, error) {
	value := strings.TrimSpace(raw)
	if value == "" {
		return "", nil
	}
	if strings.HasPrefix(value, ".") {
		value = "0" + value
	}
	if strings.Count(value, ".") > 1 {
		return "", errors.New("amount format is invalid")
	}
	parts := strings.SplitN(value, ".", 2)
	if !isDigits(parts[0]) {
		return "", errors.New("amount must be numeric")
	}
	integer := strings.TrimLeft(parts[0], "0")
	if integer == "" {
		integer = "0"
	}
	frac := "00"
	if len(parts) == 2 {
		if parts[1] != "" && !isDigits(parts[1]) {
			return "", errors.New("amount must be numeric")
		}
		if len(parts[1]) > 2 {
			return "", errors.New("amount supports up to 2 decimals")
		}
		frac = padRight(parts[1], 2)
	}
	return integer + "." + frac, nil
}

// tlv encodes one EMVCo Tag-Length-Value field. Length is the byte count of the
// value, zero-padded to two digits.
func tlv(id, value string) string {
	return fmt.Sprintf("%s%02d%s", id, len(value), value)
}

// crc16 computes CRC16-CCITT (poly 0x1021, init 0xFFFF) per the EMVCo spec.
func crc16(payload string) uint16 {
	crc := uint16(0xFFFF)
	for i := range len(payload) {
		crc ^= uint16(payload[i]) << 8
		for range 8 {
			if crc&0x8000 != 0 {
				crc = (crc << 1) ^ 0x1021
			} else {
				crc <<= 1
			}
		}
	}
	return crc
}

func stripSeparators(raw string) string {
	clean := strings.TrimSpace(raw)
	clean = strings.ReplaceAll(clean, "-", "")
	clean = strings.ReplaceAll(clean, " ", "")
	return clean
}

func padRight(value string, size int) string {
	if len(value) >= size {
		return value
	}
	return value + strings.Repeat("0", size-len(value))
}

func truncate(value string, size int) string {
	if len(value) <= size {
		return value
	}
	return value[:size]
}

func isDigits(value string) bool {
	for _, r := range value {
		if r < '0' || r > '9' {
			return false
		}
	}
	return value != ""
}

func isAlphaNum(value string) bool {
	for _, r := range value {
		if (r >= '0' && r <= '9') || (r >= 'A' && r <= 'Z') {
			continue
		}
		return false
	}
	return true
}
