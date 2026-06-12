# Email Templates

เอกสารสรุป **ระบบส่งอีเมล + จัดการเทมเพลต** ของ backend (`apps/backend`) — หุ้มการ
render เทมเพลตและการส่ง SMTP ไว้ใน `EmailService` ตัวเดียว ให้ทุก module ส่งอีเมลได้
ด้วยบรรทัดเดียว และให้ admin แก้เทมเพลตผ่านเว็บ (GrapesJS) โดยไม่ต้อง deploy

> อัปเดตล่าสุด: 2026-06-07

---

## 1. ภาพรวม

```
module อื่น (booking, payment, ...)
        │  emailService.Send(to, key, data)
        ▼
┌───────────────────────────────────────────────┐
│ EmailService (internal/services/email.go)      │
│                                                │
│  render(key) ── DB มี template active?         │
│      ├─ มี  → ใช้จาก DB (admin แก้ผ่านเว็บ)     │
│      └─ ไม่ → ใช้จากโค้ด (embed.FS, ตัวสำรอง)   │
│                                                │
│  → คิว (async) → worker → SMTP (+retry, +log)  │
└───────────────────────────────────────────────┘

admin ────▶ /admin/email-templates (GrapesJS) ──▶ CRUD API ──▶ ตาราง email_templates
```

หลักการสำคัญ:
- **โมดูลอื่นรู้แค่ 3 อย่าง**: `key` ของเทมเพลต, ผู้รับ, และ `data` — ที่เหลือ service จัดการเอง
- **DB-first override + code fallback**: เทมเพลตในโค้ดเป็นตัวสำรองถาวร (admin ลบผ่าน UI ไม่ได้), เทมเพลตใน DB ทับชั่วคราวได้
- **ส่งแบบ async**: render ทันที แล้วโยนเข้าคิว → SMTP ล่ม/ช้าก็ไม่ทำให้ request ที่เรียกพัง

---

## 2. EmailService API (`internal/services`)

inject `*services.EmailService` เข้า service ของคุณแล้วเรียกได้เลย:

| Method | ใช้เมื่อ |
|--------|----------|
| `Send(to, key string, data map[string]any) error` | ส่งอีเมลด้วยเทมเพลตที่ลงทะเบียนไว้ (key) |

**พฤติกรรมของ `Send`:**
- คืน `error` เฉพาะปัญหาที่ตรวจได้ทันที: key ไม่รู้จัก, render พัง, คิวเต็ม
- การส่ง SMTP จริงเกิดเบื้องหลัง — **ผลลัพธ์ดูที่ log** ไม่ได้คืนกลับมา
- ตัวแปรใน `data` map ไปแทน `{{.key}}` ในหัวข้อและเนื้อเมล

### ตัวอย่างการใช้ใน module อื่น

```go
// ใน service ของคุณ inject *services.EmailService เข้ามา (wire ที่ cmd/serve/main.go)
err := s.email.Send(user.Email, "booking.approved", map[string]any{
    "userName":   user.Name,
    "assetName":  booking.RoomName,
    "amount":     fmt.Sprintf("%.2f", invoice.TotalAmount),
    "paymentUrl": paymentURL,
})
if err != nil {
    // เช่น key ไม่รู้จัก / คิวเต็ม — log ไว้ ไม่ควรทำให้ flow หลักล้ม
    log.Printf("queue booking.approved email failed: %v", err)
}
```

> ⚠️ ถ้า `data` ขาดตัวแปรที่เทมเพลตใช้ Go template จะ render เป็น `<no value>`
> (ไม่ error) — ใส่ key ให้ครบตามที่เทมเพลตต้องการเสมอ

---

## 3. การ resolve เทมเพลต (DB-first + fallback)

```
Send("booking.approved", ...)
        │
   มี row ใน email_templates ที่ key="booking.approved" และ is_active=true ?
        ├─ ใช่  → 📄 ใช้ CompiledHTML + Subject จาก DB
        └─ ไม่  → 💻 ใช้ไฟล์ในโค้ด (templates/email/*.html + *.txt)
```

| สถานการณ์ | ผลลัพธ์ |
|-----------|---------|
| ไม่มี row ใน DB เลย | ใช้เทมเพลตในโค้ด |
| มี row แต่ `is_active=false` | ใช้เทมเพลตในโค้ด |
| มี row และ `is_active=true` | ใช้เทมเพลตจาก DB |

> "กลับไปใช้ของเดิม" ทำได้ผ่านเว็บ/API ทันที (`is_active=false` หรือลบ row) **ไม่ต้องแก้โค้ด/deploy**

**เทมเพลตในโค้ด (system templates)** ลงทะเบียนใน `internal/services/email.go`:
```go
var systemTemplates = map[string]emailTemplate{
    "booking.approved": {
        subject:  "การจองของคุณได้รับการอนุมัติแล้ว - รอการชำระเงิน",
        htmlFile: "booking_approved.html",
        textFile: "booking_approved.txt", // plain-text alternative (กัน spam)
    },
}
```

### เพิ่ม system template ใหม่
1. สร้างไฟล์ `internal/services/templates/email/<name>.html` (และ `.txt` ถ้าต้องการ) ใช้ `{{.var}}`
2. เพิ่ม entry ใน `systemTemplates` ผูก key → ไฟล์ + subject
3. เรียก `Send("<key>", ...)` จากที่ไหนก็ได้

> ไฟล์เทมเพลตถูก **embed เข้า binary** (`//go:embed`) — ไม่มี dependency ตอน runtime

---

## 4. การส่งแบบ async (worker + retry)

| ค่า | ที่ตั้งไว้ | แก้ที่ |
|-----|-----------|--------|
| ขนาดคิว | 100 | `emailQueueSize` ใน `email.go` |
| จำนวน retry | 3 ครั้ง | `emailMaxAttempts` |
| backoff | 2s, 4s ระหว่างครั้ง | `deliver()` |
| timeout ต่อครั้ง | 30s | `emailSendTimeout` |

> **timeout ต่อ attempt**: gomail cap แค่ TCP connect (10s) แต่ไม่ได้ตั้ง deadline ช่วงคุย
> SMTP (HELO/AUTH/DATA) — ถ้า server ค้าง worker ตัวเดียวจะค้างทั้งคิว จึงห่อ `DialAndSend`
> ด้วย timeout 30s ครบเวลานับเป็น fail แล้ว retry ต่อ (worker ไม่ค้าง)

Log ที่ออกมา (ดูใน terminal ที่รัน server):
- `email sent to xxx@... (subject="...")` → สำเร็จ
- `email send attempt 1/3 to xxx@... failed: ...` → กำลัง retry (สาเหตุอยู่หลัง `failed:`)
- `email permanently failed to xxx@... after 3 attempts` → ล้มเหลวถาวร

> เนื้อเมล: ส่ง **HTML + plain-text** (multipart) ทั้งคู่ — เทมเพลตจากโค้ดใช้ไฟล์ `.txt`,
> เทมเพลตจาก DB สร้าง plain-text อัตโนมัติจาก HTML (ลดโอกาสเข้าถัง spam)

---

## 5. รูปภาพในเทมเพลต

```
admin อัปโหลดรูปใน GrapesJS
        │  POST /api/v1/email/templates/image (admin)
        ▼
   เก็บ MinIO ใต้ prefix  email-images/
        │
   คืน URL ถาวร: {PUBLIC_BASE_URL}/api/v1/images/email-images/<key>
        │  ฝังใน CompiledHTML
        ▼
email client โหลดผ่าน  GET /api/v1/images/*  (public, proxy → MinIO)
```

ทำไมไม่ชี้ MinIO ตรงๆ:
- presigned URL หมดอายุ (15m) → รูปพังในกล่องเมล
- เปิด bucket public → payment QR หลุดด้วย → proxy จึงจำกัดเฉพาะ prefix `email-images/`
- ตอน prod MinIO มักไม่เปิดออก internet แต่ API เปิด

> **admin ใส่ image URL ภายนอกเองก็ได้** (GrapesJS แถมมา) — กรณีนั้นรูปไม่ถูกเก็บใน MinIO
> ชี้ไป host ภายนอกตรงๆ (ต้องเป็น URL public + ถาวรเอง)

---

## 6. ตัวแปรของเทมเพลต (variables)

ใช้ syntax **Go template** คือ `{{.ชื่อ}}` (มีจุดนำหน้า)

| token | ความหมาย |
|-------|----------|
| `{{.userName}}` | ชื่อผู้ใช้ |
| `{{.assetName}}` | ชื่อสินทรัพย์/ห้อง |
| `{{.amount}}` | จำนวนเงิน |
| `{{.paymentUrl}}` | ลิงก์ชำระเงิน |

การเพิ่มตัวแปรใหม่เกี่ยวกับ 2-3 จุด:
1. **frontend** `src/features/email-template/constants.ts` → ให้ admin เห็น/ลากใน editor
2. **ค่าจริง** ที่ตรงเรียก `Send` ต้องใส่ key นั้นใน `data` map
3. (ถ้าต้องการ) เพิ่มใน system template `*.html` / `*.txt`

---

## 7. CRUD Endpoints (admin เท่านั้น)

ทุก endpoint ต้อง `Authorization: Bearer <token>` + role `admin`

| Method | Path | ทำอะไร |
|--------|------|--------|
| `GET` | `/api/v1/email/templates` | รายการทั้งหมด |
| `POST` | `/api/v1/email/templates` | สร้างใหม่ |
| `GET` | `/api/v1/email/templates/:id` | ดูตัวเดียว |
| `PUT` | `/api/v1/email/templates/:id` | แก้ไข (รวม toggle `is_active`) |
| `DELETE` | `/api/v1/email/templates/:id` | ลบ |
| `POST` | `/api/v1/email/templates/image` | อัปโหลดรูป (form-data `file`) → คืน URL ถาวร |
| `POST` | `/api/v1/email/test` | ส่งอีเมลทดสอบ (`booking.approved`) |
| `GET` | `/api/v1/images/*objectKey` | **public** — เสิร์ฟรูปจาก MinIO |

> ตอน `POST`/`PUT` ระบบจะ **ตรวจ syntax ของ `subject` + `compiled_html`** (parse เป็น Go
> template) ถ้าพัง เช่น `{{.userName` (ปีกกาไม่ปิด) จะตอบ **400** ทันที ไม่ให้ save —
> กันเทมเพลตเสียหลุดไปพังตอนส่งจริง (ที่ error จะโผล่แค่ใน log)

**โครง `email_templates`** (`internal/models/email_template.go`)

| field | ชนิด | หมายเหตุ |
|-------|------|----------|
| `key` | string (unique) | ตัวระบุ เช่น `booking.approved` |
| `name` | string | ชื่อให้ admin เห็น |
| `subject` | string | หัวข้อ (รองรับ `{{.var}}`) |
| `project_data` | text | GrapesJS JSON (ไว้กลับมาแก้) |
| `compiled_html` | text | HTML ที่ใช้ส่งจริง (inlined) |
| `is_active` | bool | เปิด = ใช้แทนเทมเพลตในโค้ด |

---

## 8. Configuration (`.env`)

| ตัวแปร | default | หมายเหตุ |
|--------|---------|----------|
| `SMTP_HOST` | `localhost` | เช่น `smtp.gmail.com` |
| `SMTP_PORT` | `587` | |
| `SMTP_USERNAME` | — | บัญชีส่ง |
| `SMTP_PASSWORD` | — | Gmail ใช้ **App Password** ไม่ใช่รหัสปกติ |
| `SMTP_FROM` | `no-reply@sut.ac.th` | อีเมลผู้ส่ง |
| `FROM_NAME` | `ASSET SUT` | ชื่อผู้ส่งที่แสดง |
| `PUBLIC_BASE_URL` | `http://localhost:8080` | base URL ของ API (ไม่มี `/` ท้าย) — ใช้สร้าง URL รูป ตั้งเป็น domain จริงตอน prod |

---

## 9. วิธีทดสอบ (Postman)

### 9.0 เตรียม
ตาราง `email_templates` ถูกสร้างตอน init-db (serve ไม่ auto-migrate):
```bash
cd apps/backend
go run ./cmd/init-db      # สร้างตาราง + seed
go run ./cmd/serve        # รัน server (อ่าน SMTP/PUBLIC_BASE_URL จาก .env)
```
ดึง `access_token` ของ admin จากการ login (ดู `docs/payment.md` ข้อ 7) แล้วใส่ใน
header `Authorization: Bearer <access_token>` ทุก request (ยกเว้นข้อ 9.5 ที่เป็น public)

> 💡 ใน Postman ตั้ง Collection Variable `access_token` ไว้ครั้งเดียว แล้วใช้
> `Authorization: Bearer {{access_token}}` ในทุก request จะสะดวกกว่า

### 9.1 ส่งอีเมลทดสอบ (เทมเพลตในโค้ด)

| | |
|---|---|
| Method | `POST` |
| URL | `http://localhost:8080/api/v1/email/test` |
| Headers | `Authorization: Bearer <access_token>` |
| Body | เลือก **raw → JSON** (ด้านล่าง) |

```json
{
  "to": "you@example.com",
  "key": "booking.approved",
  "data": {
    "userName": "สมชาย",
    "assetName": "ห้องประชุม B4101",
    "amount": "500.00",
    "paymentUrl": "https://app.sut.ac.th/payment/123"
  }
}
```

> `key` ใส่หรือไม่ก็ได้ (ไม่ใส่ = `booking.approved`) — เปลี่ยน `key` + `data` เพื่อ
> ทดสอบเทมเพลตตัวอื่นที่ admin สร้างไว้ได้ทุกตัว `data` คือ map ตัวแปร `{{.var}}` ตรงๆ

**Response 200** ตอบ `"email queued for delivery"` ทันที → ดู **log ใน terminal ที่รัน
server** ว่าขึ้น `email sent to ...` (เพราะส่งแบบ async ผลจริงอยู่ที่ log ไม่ใช่ response)

### 9.2 สร้างเทมเพลต (ทดสอบ DB-first override)

| | |
|---|---|
| Method | `POST` |
| URL | `http://localhost:8080/api/v1/email/templates` |
| Headers | `Authorization: Bearer <access_token>` |
| Body | **raw → JSON** |

```json
{
  "key": "booking.approved",
  "name": "อนุมัติการจอง (เวอร์ชัน admin)",
  "subject": "ทดสอบจาก DB - {{.userName}}",
  "compiled_html": "<h1>สวัสดีคุณ {{.userName}}</h1><p>ยอด {{.amount}} บาท</p>",
  "is_active": true
}
```

จากนั้น **ยิงข้อ 9.1 ซ้ำ** → เมลจะใช้เวอร์ชันจาก DB (subject ขึ้นต้น "ทดสอบจาก DB")
จด `id` ที่ได้ใน response ไว้ใช้ข้อ 9.3

### 9.3 toggle is_active (กลับไปใช้เทมเพลตในโค้ด)

| | |
|---|---|
| Method | `PUT` |
| URL | `http://localhost:8080/api/v1/email/templates/<id>` |
| Headers | `Authorization: Bearer <access_token>` |
| Body | **raw → JSON** → `{ "is_active": false }` |

ยิงข้อ 9.1 อีกครั้ง → เมลจะกลับไปใช้เทมเพลตในโค้ด (พิสูจน์ fallback)

### 9.4 อัปโหลดรูป

| | |
|---|---|
| Method | `POST` |
| URL | `http://localhost:8080/api/v1/email/templates/image` |
| Headers | `Authorization: Bearer <access_token>` |
| Body | เลือก **form-data**:<br>• key `file` → ชนิด **File** → เลือกรูป |

> **สำคัญ:** ที่ key `file` กด dropdown เปลี่ยนจาก *Text* เป็น *File* ก่อน และ **อย่าตั้ง
> header `Content-Type` เอง** ปล่อยให้ Postman ใส่ `multipart/form-data; boundary=...` ให้

**Response 201**
```json
{
  "success": true,
  "data": {
    "url": "http://localhost:8080/api/v1/images/email-images/20260607-a1b2c3d4.png",
    "object_key": "email-images/20260607-a1b2c3d4.png"
  }
}
```

### 9.5 เปิดดูรูปที่อัปโหลด (public — ไม่ต้องใส่ token)

| | |
|---|---|
| Method | `GET` |
| URL | `data.url` จากข้อ 9.4 |
| Headers | — (ไม่ต้องมี Authorization) |

กด **Send** ใน Postman จะเห็นรูปในแท็บ preview หรือเปิด URL ในเบราว์เซอร์ก็ได้ →
ต้องเห็นรูป (พิสูจน์ว่า proxy MinIO ทำงาน)

### 9.6 ทดสอบผ่านเว็บ (GrapesJS)
1. `npm run dev` ที่ `apps/frontend` → login admin → เมนู **"เทมเพลตอีเมล"**
2. **สร้าง Template** → ออกแบบ, ลากตัวแปร/อัปโหลดรูป, เปิด toggle, บันทึก
3. สลับ toggle `is_active` ในตารางได้ตลอด

> **รูปไม่ขึ้นในเมลตอน dev เป็นเรื่องปกติ** — เพราะ `localhost` ที่ email client เข้าไม่ถึง
> ทดสอบจริงให้ใช้ tunnel (เช่น `ngrok http 8080`) แล้วตั้ง `PUBLIC_BASE_URL` เป็น URL นั้น

---

## 10. Broadcast — ส่งหากลุ่มผู้รับ (admin)

ให้ admin เลือกเทมเพลตที่สร้างไว้ แล้วส่งหากลุ่มผู้รับผ่านเว็บ ระบบเติม `{{.userName}}`
ให้แต่ละคนอัตโนมัติ ส่วนตัวแปรคงที่อื่น (เช่น `{{.amount}}`) admin กรอกค่าเดียวใช้กับทุกคน

```
admin (เว็บ) ──▶ POST /email/broadcasts ──▶ resolve ผู้รับ ──▶ render ต่อคน
        │                                          (เติม userName)
        ▼                                                │
  สร้าง row ใน email_broadcasts                          ▼
        │                                 เขียนลง email_outbox (status=pending)
        ▼                                                │
  หน้า progress (poll GET :id) ◀── นับ status ◀── outboxWorker poll+ส่ง (รอด restart)
```

### กลุ่มผู้รับ (`audience.type`)
| type | ฟิลด์ที่ใช้ | ความหมาย |
|------|------------|----------|
| `all` | — | user ทั้งหมดที่ `is_active=true` |
| `roles` | `roles: ["staff", ...]` | ตามชื่อ role |
| `requester_types` | `requester_type_ids: [1,2]` | ตาม RequesterType (เฉพาะ requester) |
| `users` | `user_ids: [10,11]` | เลือกรายคน |

ชื่อผู้รับมาจาก profile (admins/staffs/requesters) ผ่าน LEFT JOIN + COALESCE; ถ้าไม่มีชื่อ ใช้อีเมลแทน

### Endpoints (admin เท่านั้น)
| Method | Path | ทำอะไร |
|--------|------|--------|
| `POST` | `/email/broadcasts/preview` | นับจำนวนผู้รับ + ตัวอย่าง (ยังไม่ส่ง) |
| `POST` | `/email/broadcasts` | สร้าง + enqueue (body `template_key`, `audience`, `data`) |
| `GET` | `/email/broadcasts` | รายการ broadcast ทั้งหมด + counts |
| `GET` | `/email/broadcasts/:id` | สถานะ 1 รายการ (`counts`: pending/sending/sent/failed) |
| `GET` | `/email/audiences/options` | roles + requester types สำหรับ dropdown |
| `GET` | `/email/recipients/search?q=` | ค้น user สำหรับเลือกรายคน |

### ความทนทาน (outbox)
- อีเมลถูก render + เขียนลงตาราง `email_outbox` ก่อน แล้ว `outboxWorker` (poll ทุก 3s) ค่อยส่ง
- ส่งไม่สำเร็จ → กลับเป็น `pending` retry (สูงสุด `emailMaxAttempts`) เกินนั้น = `failed`
- ตอน start `RequeueStuckSending()` คืน row ที่ค้าง `sending` (จาก crash) กลับเป็น `pending`
- **ตาราง `email_broadcasts` + `email_outbox` ต้อง `go run ./cmd/init-db` ก่อน** (serve ไม่ migrate)

---

## 11. ความพร้อมใช้งาน (Readiness)

### ✅ พร้อมใช้ (development / internal)
- ส่งอีเมลด้วยเทมเพลตจากโค้ดได้ (async + retry + plain-text + log)
- admin จัดการเทมเพลตผ่านเว็บ (GrapesJS) + toggle เปิด/ปิดได้ตลอด
- รูปภาพเก็บ MinIO + เสิร์ฟผ่าน URL ถาวร (กัน QR หลุด)

### ⚠️ ต้องพิจารณาก่อนขึ้น production
- [ ] ตั้ง `PUBLIC_BASE_URL` เป็น domain จริง (ไม่งั้นรูปในเมลโหลดไม่ขึ้น)
- [ ] ตั้ง SMTP จริง (App Password / service เช่น SES) + `SMTP_HOST` `SMTP_PORT`
- [ ] เทมเพลตที่สร้างตอน dev จะมี URL รูปเป็น `localhost` ฝังอยู่ — สร้างใหม่บน prod หรือทำ relative-path rewrite
- [ ] พิจารณา outbox pattern (เก็บคิวลง DB) ถ้าต้องการรับประกันว่าเมลไม่หายเมื่อ process ดับ

### 📌 ข้อจำกัดที่ควรรู้ (by design)
- ยังไม่มีโมดูล booking ที่เรียก `Send` ตอนอนุมัติจริง — ตอนนี้ทดสอบผ่าน `/email/test`
- `data` ที่ขาดตัวแปร → render เป็น `<no value>` (ไม่ error)
- ถ้า process ดับ อีเมลที่ค้างในคิว (in-memory) จะหาย

**สรุป:** ใช้เป็นระบบส่งอีเมลกลางได้ทุก module ในระดับ dev/internal — เรียก `Send(to, key, data)`
บรรทัดเดียว ส่วน production ให้ตั้ง `PUBLIC_BASE_URL` + SMTP จริง และพิจารณา outbox pattern
