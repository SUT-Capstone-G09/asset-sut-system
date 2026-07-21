package docpath

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"path/filepath"
	"strings"
	"time"
)

var thaiMonths = [12]string{
	"มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
	"พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
	"กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
}

// MonthFolder returns "มิถุนายน_2569" for use as a subfolder name.
func MonthFolder(t time.Time) string {
	return fmt.Sprintf("%s_%d", thaiMonths[t.Month()-1], t.Year()+543)
}

// uniqueSuffix returns a short random hex string so files sharing the same
// location/month/year/booking-ID/extension (e.g. two PDFs on one booking)
// don't collide on the same storage key and silently overwrite each other.
func uniqueSuffix() string {
	b := make([]byte, 3)
	if _, err := rand.Read(b); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano()%1000000)
	}
	return hex.EncodeToString(b)
}

// FileName builds "{location}_{month}_{year}_#{bookingID}_{suffix}.{ext}".
// If bookingID is 0, the booking-ID segment is omitted.
func FileName(locationName string, bookingDate time.Time, bookingID int, original string) string {
	ext := strings.ToLower(filepath.Ext(original))
	month := thaiMonths[bookingDate.Month()-1]
	year := bookingDate.Year() + 543
	suffix := uniqueSuffix()
	if bookingID > 0 {
		return fmt.Sprintf("%s_%s_%d_#%d_%s%s", locationName, month, year, bookingID, suffix, ext)
	}
	return fmt.Sprintf("%s_%s_%d_%s%s", locationName, month, year, suffix, ext)
}

// ObjectKey returns the full storage path:
// "{folderName}/มิถุนายน_2569/{FileName(...)}"
func ObjectKey(folderName string, bookingDate time.Time, locationName string, bookingID int, original string) string {
	return folderName + "/" + MonthFolder(bookingDate) + "/" + FileName(locationName, bookingDate, bookingID, original)
}

// HallFloorPlanKey สร้าง path ของรูปผังพื้นที่โถง:
// "รูปภาพสถานที่/{ชื่ออาคาร}/โถงอาคาร/แผนผัง/{ชื่อโถง}{ext}"
// จัดกลุ่มตามอาคาร/โถง (ไม่อิงเดือน) — ผังมี 1 รูปต่อโถง อัปโหลดใหม่ทับของเดิม
func HallFloorPlanKey(buildingName, hallName, original string) string {
	ext := strings.ToLower(filepath.Ext(original))
	root := DocTypes["location-pics"].FolderName // "รูปภาพสถานที่"
	return strings.Join([]string{
		root,
		sanitizeSegment(buildingName),
		"โถงอาคาร",
		"แผนผัง",
		sanitizeSegment(hallName) + ext,
	}, "/")
}

// sanitizeSegment กันไม่ให้ชื่อ (อาคาร/โถง) ทำ path พัง — ตัด separator และ traversal
// แต่คงตัวอักษรไทย/UTF-8 ไว้ (S3/MinIO key รองรับ)
func sanitizeSegment(s string) string {
	s = strings.ReplaceAll(s, "\\", "/")
	s = strings.ReplaceAll(s, "/", "-")
	s = strings.ReplaceAll(s, "..", "")
	s = strings.TrimSpace(s)
	if s == "" {
		return "ไม่ระบุ"
	}
	return s
}

// DocType declares where a document category is stored and what its Thai
// folder name is. Add a new entry to DocTypes to register a new category.
type DocType struct {
	FolderName string // Thai folder name used in both MinIO and Drive
	StoreMinio bool
	StoreDrive bool
}

// DocTypes is the single source of truth for document routing.
// To add a new doc type: add one line here.
// To move a type from "both" to "Drive only": set StoreMinio = false.
var DocTypes = map[string]DocType{
	"location-pics":   {FolderName: "รูปภาพสถานที่", StoreMinio: true, StoreDrive: true},
	"booking-docs":    {FolderName: "เอกสารขอใช้พื้นที่", StoreMinio: true, StoreDrive: true},
	"payment-slip":    {FolderName: "สลิปการชำระเงิน", StoreMinio: true, StoreDrive: true},
	"payment-receipt": {FolderName: "ใบเสร็จรับเงิน", StoreMinio: true, StoreDrive: true},
	"other":           {FolderName: "อื่นๆ", StoreMinio: true, StoreDrive: true},
}
