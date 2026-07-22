# File Storage (MinIO)

เอกสารสรุป **ระบบจัดเก็บไฟล์กลาง** ของ backend (`apps/backend`) — หุ้ม MinIO ไว้ใน
`StorageService` ตัวเดียว เพื่อให้ทุก module อัปโหลดไฟล์และได้ presigned URL กลับมา
โดยไม่ต้องยุ่งกับ MinIO client ตรง ๆ พร้อม endpoint upload กลางสำหรับ frontend

> อัปเดตล่าสุด: 2026-06-08

---

## 1. ภาพรวม

```
                       ┌─────────────────────────────┐
HTTP (multipart) ─────▶│  UploadController            │
                       │  POST /api/v1/uploads        │
                       └──────────────┬──────────────┘
                                      │
Go services อื่น ๆ ───────────────────┼──▶  StorageService  ──▶  MinIO
(payment QR, document, ...)           │     (จุดเดียวที่คุม      (object storage)
                                      │      upload/presign)
                                      ▼
                          presigned URL + object key
```

- **StorageService** (`internal/services/storage.go`) คือจุดเดียวที่เรียก MinIO จริง
- module อื่นมี 2 ทางเลือกในการใช้งาน: เรียกผ่าน **HTTP endpoint** หรือ **inject service ตรง**
- ไฟล์ที่ generate เองในระบบ (เช่นรูป QR ของ payment) ก็ใช้ service ตัวนี้เก็บ

---

## 2. StorageService API (`internal/services`)

inject `*services.StorageService` เข้า service ของคุณแล้วเรียกได้เลย:

| Method | ใช้เมื่อ |
|--------|----------|
| `UploadMultipart(ctx, folder, *multipart.FileHeader) (UploadResult, error)` | มีไฟล์จาก HTTP form (ทางที่ง่ายที่สุดสำหรับ handler) |
| `UploadBytes(ctx, objectKey, data []byte, contentType string) error` | มีเนื้อไฟล์ใน memory อยู่แล้ว (เช่นรูป/PDF ที่ generate เอง) |
| `PresignedURL(ctx, objectKey string) (string, error)` | ขอ URL ดาวน์โหลดใหม่ (URL เดิมหมดอายุ) |
| `BuildObjectKey(folder, filename string) string` | สร้าง object key แบบไม่ชนกัน |
| `URLExpirySeconds() int` | อายุ presigned URL (วินาที) |

**`UploadResult`**
```go
type UploadResult struct {
	ObjectKey   string // คีย์ของไฟล์ใน bucket (เก็บลง DB ของ module ตัวเอง)
	URL         string // presigned URL (ชั่วคราว)
	FileName    string // ชื่อไฟล์เดิม
	ContentType string
	Size        int64
	ExpiresIn   int    // วินาทีจน URL หมดอายุ
}
```

### ตัวอย่างการใช้ใน module อื่น
```go
// (ก) จากไฟล์ที่ผู้ใช้อัปโหลด
result, err := storage.UploadMultipart(ctx, "slips", fileHeader)
// เก็บ result.ObjectKey ลง record ของ module (เช่น Document/Payment) แล้วใช้ PresignedURL ขอ URL ใหม่ภายหลัง

// (ข) จาก bytes ใน memory (เช่น PDF ที่ render เอง)
key := storage.BuildObjectKey("invoices", "invoice.pdf")
if err := storage.UploadBytes(ctx, key, pdfBytes, "application/pdf"); err != nil { ... }
```

> ระบบ payment QR (`services/payment_qr.go`) ใช้ `UploadBytes` + `PresignedURL`
> เป็นตัวอย่างจริง — ดู `docs/payment.md`

---

## 3. Upload Endpoint

### `POST /api/v1/uploads`  *(ต้องล็อกอิน — `Authorization: Bearer <token>`)*

อัปโหลดไฟล์เดียวแบบ `multipart/form-data` — ระบบจะ route ไปยัง **Google Drive** หรือ **MinIO**
อัตโนมัติตามชื่อ `folder` (ดูรายละเอียดใน `docs/gdrive-storage.md`)

| field | ชนิด | บังคับ | หมายเหตุ |
|-------|------|--------|----------|
| `file` | File | ✅ | ไฟล์ที่จะอัปโหลด (สูงสุด 10MB) |
| `folder` | Text | — | โฟลเดอร์จัดกลุ่ม — ถ้าตรงกับ `GDRIVE_FOLDER_ROUTES` จะไป Drive, อื่น ๆ ไป MinIO |
| `booking_date` | Text | — | ISO date `YYYY-MM-DD` — ใช้จัด subfolder เดือนใน Drive |
| `location_name` | Text | — | ชื่อสถานที่ — ใช้ตั้งชื่อไฟล์ใน Drive |
| `booking_id` | Text | — | เลข booking — ทำให้ชื่อไฟล์ unique ใน Drive |

**Response 201 (MinIO)**
```json
{
  "success": true,
  "data": {
    "bucket_name": "asset-sut-bucket",
    "object_key": "slips/20260603081500-a1b2c3d4.png",
    "url": "http://localhost:9000/asset-sut-bucket/slips/...?X-Amz-...",
    "file_name": "slip.png",
    "content_type": "image/png",
    "size": 20480,
    "expires_in": 900
  }
}
```

**Response 201 (Google Drive)**
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

**Error**
| สถานการณ์ | HTTP |
|-----------|------|
| ไม่มี/ผิด `Authorization` header | 401 |
| ไม่ได้แนบ field `file` | 400 `missing form-data file field 'file'` |
| ไฟล์ใหญ่เกิน 10MB | 400 `file too large (max 10MB)` |
| upload/MinIO ล้มเหลว | 500 |

---

## 4. ทดสอบด้วย Postman

| | |
|---|---|
| Method | `POST` |
| URL | `http://localhost:8080/api/v1/uploads` |
| Headers | `Authorization: Bearer <access_token>` |
| Body | เลือก **form-data**:<br>• key `file` → ชนิด **File** → เลือกไฟล์<br>• key `folder` → ชนิด Text → เช่น `slips` (ไม่บังคับ) |

> **สำคัญ:** อย่าตั้ง header `Content-Type` เอง — ปล่อยให้ Postman ใส่
> `multipart/form-data; boundary=...` ให้อัตโนมัติ ไม่งั้นจะ parse ไม่ได้

นำ `access_token` มาจากการ login (ดู `docs/payment.md` ข้อ 7) — เปิด `data.url` ใน
browser เพื่อดูไฟล์ที่อัปโหลด

### ตัวอย่าง: อัปโหลดสลิปการชำระเงิน

**Postman — Body แท็บ `form-data`**

| KEY      | ชนิด (dropdown) | VALUE                       |
| -------- | --------------- | --------------------------- |
| `file`   | **File**        | `slip.png` (เลือกจากเครื่อง) |
| `folder` | Text            | `slips`                     |

> ที่ KEY `file` ต้องกด dropdown เปลี่ยนจาก *Text* เป็น *File* ก่อน ถึงจะเลือกไฟล์ได้

**curl (เทียบเท่ากัน)**

```bash
curl -X POST http://localhost:8080/api/v1/uploads \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@C:/path/to/slip.png" \
  -F "folder=slips"
```

`-F "file=@..."` → `@` บอก curl ให้แนบไฟล์จริง (map กับ `ctx.FormFile("file")`),
`-F "folder=slips"` → field text ธรรมดา (map กับ `ctx.PostForm("folder")`)

**Raw HTTP ที่ถูกส่งจริงเบื้องหลัง**

```http
POST /api/v1/uploads HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: multipart/form-data; boundary=----Boundary7MA4YWxkTrZu0gW

------Boundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="slip.png"
Content-Type: image/png

‹...binary ของไฟล์...›
------Boundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="folder"

slips
------Boundary7MA4YWxkTrZu0gW--
```

**Response 201**

```json
{
  "success": true,
  "data": {
    "object_key": "slips/20260603081500-a1b2c3d4.png",
    "url": "http://localhost:9000/payment-qr/slips/20260603081500-a1b2c3d4.png?X-Amz-...",
    "file_name": "slip.png",
    "content_type": "image/png",
    "size": 20480,
    "expires_in": 900
  }
}
```

**ขั้นต่อไป — ผูกสลิปกับ payment:** เก็บ `object_key` ที่ได้ลง record ของ module เอง
(เช่นสร้าง `Document` แล้วชี้ `Payment.SlipDocumentID` ไปที่ document นั้น) — endpoint
นี้เก็บไฟล์ขึ้น MinIO อย่างเดียว ไม่สร้าง DB record ให้ (ดูข้อ 6 "ข้อจำกัด")

---

## 5. รายละเอียดการทำงาน

### 5.1 Object key
รูปแบบ `<folder>/<timestamp>-<random><ext>` เช่น `slips/20260603081500-a1b2c3d4.png`
- ป้องกันชื่อชนกันด้วย timestamp (UTC) + random 4 ไบต์
- คงนามสกุลไฟล์เดิม (lowercase)

### 5.2 ความปลอดภัยของ `folder`
`sanitizeFolder` คงไว้เฉพาะ `a-z A-Z 0-9 - _ /`, แปลง `\` เป็น `/`, ตัด `..` ออก
(กัน path traversal) และตัด `/` หัวท้าย

### 5.3 ขนาดไฟล์
จำกัด **10MB** ที่ controller (`maxUploadSize`) — ปรับได้ที่
`internal/controllers/upload.go`

### 5.4 Configuration
ใช้ค่าเดียวกับ MinIO ใน `.env` (ดูตารางใน `docs/payment.md` ข้อ 5):
`MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`,
`MINIO_USE_SSL`, `MINIO_URL_EXPIRY`

---

## 6. ความพร้อมใช้งาน (Readiness)

### ✅ พร้อมใช้ (development / internal)
- upload กลางใช้ซ้ำได้ทุก module (HTTP + Go service)
- กัน path traversal + จำกัดขนาดไฟล์
- endpoint ต้องล็อกอิน

### ⚠️ ต้องพิจารณาก่อนขึ้น production
- [ ] `MINIO_USE_SSL=true` + endpoint จริง
- [ ] ตรวจชนิดไฟล์ (whitelist content-type / นามสกุล) ตามแต่ละ use case — ตอนนี้รับทุกชนิด
- [ ] สแกนไวรัส/มัลแวร์สำหรับไฟล์จากผู้ใช้ภายนอก (ถ้าจำเป็น)
- [ ] พิจารณากั้นด้วย permission (เช่น `upload_doc:create`) ตาม module — ตอนนี้แค่ล็อกอินก็อัปได้
- [ ] ตั้ง bucket policy / lifecycle (เช่นลบไฟล์ชั่วคราวอัตโนมัติ)

### 📌 ข้อจำกัดที่ควรรู้ (by design)
- endpoint นี้เก็บไฟล์ขึ้น MinIO อย่างเดียว **ไม่สร้าง record ใน DB** — module ที่เรียกใช้
  ต้องเอา `object_key` ไปผูกกับตารางของตัวเอง (เช่น `Document`, `Payment.SlipDocumentID`)
- รองรับ **1 ไฟล์ต่อ 1 request** (field `file`) — ถ้าต้องอัปหลายไฟล์ เรียกซ้ำหลายครั้ง
- presigned URL เป็น URL **ชั่วคราว** (ตาม `MINIO_URL_EXPIRY`) — เก็บ `object_key` ไว้
  แล้วขอ URL ใหม่ผ่าน `PresignedURL` เมื่อต้องใช้ **ไม่ควรเก็บ URL ลง DB**
  > ✅ แก้แล้วใน `LocationService` — `resolveImageURL()` generate presigned URL ใหม่ทุกครั้งที่ fetch
  > โดย frontend `ImageUpload.tsx` ส่ง `object_key` (ไม่ใช่ URL) ลง DB ตั้งแต่ 2026-06-08

**สรุป:** ใช้เป็นระบบอัปโหลดไฟล์กลางได้ทุก module ในระดับ dev/internal ส่วน production
ให้เพิ่มการตรวจชนิดไฟล์/permission ตาม use case
