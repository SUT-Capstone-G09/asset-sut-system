# Google Drive Storage Integration

เอกสารสรุป **ระบบจัดเก็บไฟล์ Google Drive** — เพิ่มเติมจาก MinIO เพื่อรองรับการเก็บ
เอกสารขอใช้พื้นที่และสลิปการชำระเงินใน Google Shared Drive จัดโฟลเดอร์อัตโนมัติตามเดือน
และตั้งชื่อไฟล์ตามสถานที่และเลข booking

> อัปเดตล่าสุด: 2026-06-08

---

## 1. ภาพรวม

```
                       ┌────────────────────────────────────────┐
HTTP (multipart) ─────▶│  UploadController                       │
                       │  POST /api/v1/uploads                   │
                       └───────────────┬────────────────────────┘
                                       │
                           ตรวจสอบ folder name
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                      │
             folder ใน GDRIVE_FOLDER_ROUTES?          folder อื่น
                    │                                      │
                    ▼                                      ▼
             DriveService                           StorageService
          (Google Shared Drive)                       (MinIO)
                    │
          หา/สร้าง subfolder เดือน
          (มิถุนายน_2569, ...)
                    │
               อัปโหลดไฟล์
```

- **DriveService** (`internal/services/drive.go`) จัดการ Google Drive API
- **StorageService** (`internal/services/storage.go`) จัดการ MinIO (เดิม)
- **UploadController** (`internal/controllers/upload.go`) เป็นตัวตัดสินว่าจะไปทาง Drive หรือ MinIO ตาม `folder` ที่ส่งมา
- ตั้งค่าได้ผ่าน env var โดยไม่ต้องแก้ code

---

## 2. ข้อกำหนด Google Drive

### ต้องใช้ Shared Drive (ไม่ใช่ My Drive)

Service account **ไม่มี storage quota** ของตัวเอง → ไม่สามารถ upload ไปยัง My Drive ได้
ต้องสร้าง **Shared Drive** และเพิ่ม service account เป็น **Content Manager**

```
Google Drive
└── Shared drives
    └── SUT Asset System          ← สร้าง Shared Drive
        ├── เอกสารขอใช้พื้นที่   ← folder (copy ID จาก URL)
        └── สลิปจ่ายเงิน         ← folder (copy ID จาก URL)
```

**เพิ่ม service account:**
Shared Drive → Manage members → เพิ่ม `gdrive@gdrive-asset-sut-mgmt.iam.gserviceaccount.com` → role **Content Manager**

---

## 3. Configuration (.env)

```env
# Google Drive Service Account
GDRIVE_CLIENT_EMAIL=gdrive@gdrive-asset-sut-mgmt.iam.gserviceaccount.com
GDRIVE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

# Routing: folder-name:DrivefolderID คั่นด้วย comma
# folder-name ต้องตรงกับค่า NEXT_PUBLIC_UPLOAD_FOLDER_* ฝั่ง frontend
GDRIVE_FOLDER_ROUTES=เอกสารขอใช้พื้นที่:DRIVE_FOLDER_ID_1,สลิปจ่ายเงิน:DRIVE_FOLDER_ID_2

# Frontend folder names (ต้องตรงกับ key ใน GDRIVE_FOLDER_ROUTES)
NEXT_PUBLIC_UPLOAD_FOLDER_LOCATIONS=ภาพสถานที่
NEXT_PUBLIC_UPLOAD_FOLDER_PAYMENT=สลิปจ่ายเงิน
NEXT_PUBLIC_UPLOAD_FOLDER_BOOKING=เอกสารขอใช้พื้นที่
```

**หมายเหตุ `GDRIVE_PRIVATE_KEY`:** ค่า `\n` ใน `.env` จะถูกแปลงเป็น newline จริงโดย `cleanPrivateKey()` ใน `config.go` อัตโนมัติ

**ถ้าไม่ตั้งค่า Drive:** ระบบ fallback ไป MinIO ทุก folder

---

## 4. Upload Endpoint (อัปเดต)

### `POST /api/v1/uploads` *(ต้องล็อกอิน)*

| field | ชนิด | บังคับ | หมายเหตุ |
|-------|------|--------|----------|
| `file` | File | ✅ | ไฟล์ที่จะอัปโหลด |
| `folder` | Text | — | ชื่อโฟลเดอร์ — ถ้าตรงกับ `GDRIVE_FOLDER_ROUTES` จะไป Drive |
| `booking_date` | Text | — | ISO date `YYYY-MM-DD` — ใช้จัด subfolder เดือน (ถ้าไม่ส่ง ใช้วันปัจจุบัน) |
| `location_name` | Text | — | ชื่อสถานที่ — ใช้ตั้งชื่อไฟล์ใน Drive |
| `booking_id` | Text | — | เลข booking — ใช้ทำให้ชื่อไฟล์ไม่ซ้ำ |

**Response 201 (Drive)**
```json
{
  "success": true,
  "data": {
    "bucket_name": "gdrive",
    "object_key": "1A2B3CxxxxxxxxxxxxxxxxxxxxxxZZZ",
    "url": "https://drive.google.com/file/d/1A2B3C.../view",
    "file_name": "เอกสาร.pdf",
    "content_type": "application/pdf",
    "size": 102400,
    "expires_in": 0
  }
}
```

> `bucket_name: "gdrive"` และ `expires_in: 0` บ่งบอกว่าไฟล์อยู่ใน Drive (URL ไม่หมดอายุ)

---

## 5. โครงสร้างโฟลเดอร์ใน Drive

```
📁 เอกสารขอใช้พื้นที่   (Shared Drive folder)
  └── 📁 มิถุนายน_2569       ← สร้างอัตโนมัติตามเดือนของวันที่จอง
        └── 📄 ห้องประชุมรวมใหญ่ B4101_มิถุนายน_2569_#13.pdf
        └── 📄 ห้องสัมมนา A101_มิถุนายน_2569_#14.pdf

📁 สลิปจ่ายเงิน   (Shared Drive folder)
  └── 📁 มิถุนายน_2569
        └── 📄 ห้องประชุมรวมใหญ่ B4101_มิถุนายน_2569_#13.jpg
```

### รูปแบบชื่อไฟล์
```
{ชื่อสถานที่}_{เดือนไทย}_{ปีพศ}_#{booking_id}.{ext}
```
ตัวอย่าง: `ห้องประชุมรวมใหญ่ B4101_มิถุนายน_2569_#13.pdf`

### รูปแบบชื่อโฟลเดอร์เดือน
```
{เดือนไทย}_{ปีพศ}
```
ตัวอย่าง: `มิถุนายน_2569`

> โฟลเดอร์เดือนอิงตาม **วันที่จอง** (`booking_date`) ไม่ใช่วันที่อัปโหลด
> สร้างครั้งเดียว — ถ้ามีอยู่แล้วจะนำมาใช้ต่อ

---

## 6. DriveService API (`internal/services/drive.go`)

```go
// สร้าง service จาก GDriveConfig (ถ้า ClientEmail/PrivateKey ว่าง จะ return nil)
func NewDriveService(cfg config.GDriveConfig) (*DriveService, error)

// อัปโหลดไฟล์ไปยัง Shared Drive — สร้าง subfolder เดือนอัตโนมัติ
func (s *DriveService) UploadMultipart(
    ctx          context.Context,
    folderID     string,                // Drive folder ID (จาก GDRIVE_FOLDER_ROUTES)
    fh           *multipart.FileHeader,
    bookingDate  time.Time,             // วันที่จอง — ใช้สร้างชื่อ subfolder
    locationName string,                // ชื่อสถานที่ — ใช้ตั้งชื่อไฟล์
    bookingID    int,                   // เลข booking — ใช้ทำให้ชื่อไฟล์ unique
) (DriveUploadResult, error)
```

**`DriveUploadResult`**
```go
type DriveUploadResult struct {
    FileID      string // Google Drive file ID
    FileName    string
    ContentType string
    Size        int64
    ViewURL     string // https://drive.google.com/file/d/{id}/view
    DownloadURL string // https://drive.google.com/uc?export=download&id={id}
}
```

---

## 7. Frontend (`uploadFile`)

```ts
// src/lib/services/upload.ts
uploadFile(
  file:         File,
  folder?:      string,   // ชื่อโฟลเดอร์ — กำหนดว่าจะไป Drive หรือ MinIO
  bookingDate?: string,   // "YYYY-MM-DD" — วันที่จอง
  locationName?: string,  // ชื่อสถานที่
  bookingId?:   number,   // เลข booking
): Promise<UploadResult>
```

**จุดที่เรียกใช้:**

| ไฟล์ | folder | หมายเหตุ |
|------|--------|----------|
| `BookingConfirmView.tsx` | `UPLOAD_FOLDERS.BOOKING_DOCS` | ส่ง `booking.id`, `draft.timeslots[0].date`, `room.name` |
| `my-bookings/[id]/page.tsx` | `UPLOAD_FOLDERS.BOOKING_DOCS` | ส่ง `bookingId`, `firstSlot.date`, `firstSlot.location_name` |

---

## 8. แก้ไข: รูปสถานที่หายหลัง refresh

**สาเหตุ:** `ImageUpload.tsx` เคยเก็บ **presigned URL** (หมดอายุ 15 นาที) ลง DB

**วิธีแก้:**
- **Frontend** `ImageUpload.tsx`: `onChange(result.object_key)` — เก็บ key ลง DB แทน URL
- **Backend** `LocationService`: inject `StorageService` เข้ามา → `resolveImageURL()` generate presigned URL ใหม่ทุกครั้งที่ fetch

```go
// ถ้าเก็บเป็น object_key (ไม่ขึ้นต้นด้วย http) → generate presigned URL ใหม่
// ถ้าเป็น URL เต็ม (ข้อมูลเก่า) → ส่งคืนตามเดิม
func (s *LocationService) resolveImageURL(objectKeyOrURL *string) *string
```

> ข้อมูลเก่าที่เคยบันทึก URL ไว้จะยังพัง — ต้องอัปโหลดรูปใหม่เพื่อแก้

---

## 9. ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|------|----------------|
| `internal/services/drive.go` | DriveService ใหม่ + folder เดือน + ชื่อไฟล์ |
| `internal/controllers/upload.go` | routing Drive/MinIO + parse `booking_date`, `location_name`, `booking_id` |
| `internal/services/location.go` | inject StorageService + `resolveImageURL` |
| `internal/config/config.go` | `GDriveConfig`, `parseDriveFolderRoutes`, `cleanPrivateKey` |
| `cmd/serve/main.go` | init DriveService + ส่ง storageService เข้า locationService |
| `src/lib/services/upload.ts` | `uploadFile` รับ `bookingDate`, `locationName`, `bookingId` |
| `src/features/areas/.../ImageUpload.tsx` | `onChange(object_key)` แทน `onChange(url)` |
| `src/features/bookings/.../BookingConfirmView.tsx` | ส่ง booking metadata ไปกับ upload |
| `src/app/my-bookings/[id]/page.tsx` | ส่ง booking metadata ไปกับ upload |

---

## 10. ข้อจำกัดที่ควรรู้

- **Shared Drive เท่านั้น** — My Drive ใช้ไม่ได้เพราะ service account ไม่มี quota
- **Permission ไฟล์:** ตั้งเป็น `anyone with link → reader` อัตโนมัติหลัง upload
- **`expires_in: 0`** สำหรับไฟล์ใน Drive — URL ไม่หมดอายุ (ต่างจาก MinIO)
- ถ้าไม่ตั้ง `GDRIVE_CLIENT_EMAIL` / `GDRIVE_PRIVATE_KEY` → DriveService จะไม่ถูก init และทุก upload จะไป MinIO แทน
