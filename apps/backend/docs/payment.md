# Payment QR Generation

เอกสารสรุประบบสร้าง **QR code ชำระเงิน** (PromptPay / Bill Payment) ตามมาตรฐาน
EMVCo ของ backend (`apps/backend`) — สร้าง payload เอง (TLV + CRC16), render เป็น
รูป, เก็บใน MinIO แล้วคืน presigned URL ให้ frontend

> อัปเดตล่าสุด: 2026-06-03

---

## 1. ภาพรวมระบบ

ระบบรับ `invoice_id` จาก frontend → ดึง **ยอดเงินจาก DB** (ไม่เชื่อค่าที่ client ส่ง) →
สร้าง EMVCo payload จากข้อมูลผู้รับเงินใน `.env` → render เป็นรูป PNG → upload ขึ้น
MinIO → บันทึก payload + object key ลง `Payment` → คืน presigned URL

```
Frontend ─POST {invoice_id, mode}─▶ Controller ─▶ Service
                                                   │ 1. ดึง Invoice.TotalAmount จาก DB
                                                   │ 2. อ่านข้อมูลผู้รับเงินจาก .env (PROMPTPAY_ID / BILLER_ID)
                                                   │ 3. build EMVCo payload + CRC16  (pkg/promptpay)
                                                   │ 4. render PNG                   (boombuler/barcode)
                                                   │ 5. upload PNG → MinIO
                                                   │ 6. upsert Payment + เก็บ payload/object key
                                                   ▼
Frontend ◀── {payload, qr_code_url (presigned), amount} ──┘
```

**หลักการสำคัญ:** ยอดเงินมาจาก DB เสมอ ส่วนข้อมูลผู้รับเงิน (เบอร์ PromptPay /
biller id) เป็นค่าคงที่ต่อ deployment จึงอยู่ใน `.env` ไม่ใช่รับจาก request

---

## 2. มาตรฐาน EMVCo QR (`internal/pkg/promptpay`)

payload เป็นสตริงแบบ **TLV** (Tag-Length-Value): แต่ละ field = `tag(2) + length(2) + value`
ปิดท้ายด้วย checksum **CRC16-CCITT** (poly `0x1021`, init `0xFFFF`) คำนวณครอบทั้ง
payload รวม `"6304"`

### 2.1 โครงสร้าง field

| Tag | Field                            | ค่า/หมายเหตุ                                                      |
| --- | -------------------------------- | ----------------------------------------------------------------- |
| 00  | Payload Format Indicator         | `01`                                                              |
| 01  | Point of Initiation              | `11` = static (ไม่ระบุยอด) / `12` = dynamic (มียอด)               |
| 29  | Merchant Account — **PromptPay** | `00`=AID `A000000677010111`, `01`=เบอร์ หรือ `02`=เลขบัตร         |
| 30  | Merchant Account — **Biller**    | `00`=AID `A000000677010112`, `01`=biller id, `02`=ref1, `03`=ref2 |
| 52  | Merchant Category Code           | `0000`                                                            |
| 53  | Currency                         | `764` (THB)                                                       |
| 54  | Amount                           | เช่น `150.00` (มีเฉพาะตอนระบุยอด)                                 |
| 58  | Country                          | `TH`                                                              |
| 59  | Merchant Name                    | ตัด ≤25 ตัวอักษร                                                  |
| 60  | Merchant City                    | ตัด ≤15 ตัวอักษร                                                  |
| 63  | CRC                              | 4 hex digits                                                      |

### 2.2 การ normalize input

- **PromptPay id**: ตัด `-` / ช่องว่างออก, ต้องเป็นตัวเลขล้วน
  - 10 หลัก → เบอร์มือถือ (ขึ้นต้น `0`) → แปลงเป็น `0066` + 9 หลักหลัง, ใช้ tag `01`
  - 13 หลัก → เลขบัตรประชาชน/เลขภาษี, ใช้ tag `02`
- **Biller id**: ต้อง 15 หลัก
- **Reference (biller)**: A-Z และ 0-9 เท่านั้น, ≤20 ตัว (ref1 บังคับ, ref2 ไม่บังคับ)
- **Amount**: คืนค่าเป็นทศนิยม 2 ตำแหน่งเสมอ (`"150"` → `"150.00"`); ค่าว่าง = ไม่ระบุยอด

ฟังก์ชันในแพ็กเกจนี้เป็น **pure function** (ไม่มี I/O) ทดสอบได้ที่
`internal/pkg/promptpay/promptpay_test.go` (เช็ค CRC ด้วยค่ามาตรฐาน `0x29B1` ของ
`"123456789"` + ตรวจ payload self-consistency)

---

## 3. โครงสร้างไฟล์

```
internal/
├── pkg/promptpay/
│   ├── promptpay.go        # EMVCo payload + CRC16 + TLV (pure)
│   └── promptpay_test.go   # unit tests
├── initializers/minio/
│   └── minio.go            # MinIO client + ensure bucket
├── dto/payment.go          # GenerateQRRequest / GenerateQRResponse
├── repositories/
│   ├── invoice.go          # FindByID (ดึงยอดเงิน)
│   └── payment.go          # UpsertForInvoice / Save
├── services/payment_qr.go  # orchestrate ทั้ง 6 ขั้น + render QR
├── controllers/payment.go  # handler + map error → response
└── routes/payment.go       # POST /api/v1/payments/qr (ต้องล็อกอิน)
```

จุด wiring: `cmd/serve/main.go` (สร้าง repo/service/controller + connect MinIO),
`internal/routes/routes.go` (เพิ่ม `PaymentController` ใน `Dependencies` + register)

---

## 4. API

### `POST /api/v1/payments/qr` _(ต้องล็อกอิน — `Authorization: Bearer <token>`)_

**Request**

```json
{ "invoice_id": 1, "mode": "promptpay" }
```

| field        | ชนิด            | หมายเหตุ                            |
| ------------ | --------------- | ----------------------------------- |
| `invoice_id` | uint (required) | ใช้ดึงยอดเงินจากตาราง `invoices`    |
| `mode`       | string          | `promptpay` (default) หรือ `biller` |

**Response 200**

```json
{
  "success": true,
  "data": {
    "payment_id": 1,
    "invoice_id": 1,
    "amount": 150,
    "payload": "00020101021229370016A000000677010111...6304C3B4",
    "qr_code_url": "http://localhost:9000/payment-qr/qr/invoice-1-...png?X-Amz-...",
    "expires_in": 900
  }
}
```

`payload` = string ดิบ (ให้ client ที่อยาก render QR เอง), `qr_code_url` = presigned
URL ของรูป PNG ใน MinIO (หมดอายุตาม `MINIO_URL_EXPIRY`)

**Error**
| สถานการณ์ | HTTP |
|-----------|------|
| ไม่มี/ผิด `Authorization` header | 401 |
| `invoice_id` ไม่มีใน DB | 404 `invoice not found` |
| `mode` ไม่ใช่ promptpay/biller | 400 |
| config ผู้รับเงินไม่ครบ (เช่น biller mode แต่ `BILLER_ID` ว่าง) | 500 |

---

## 5. Configuration (`.env`)

| Key                     | ค่าเริ่มต้น         | คำอธิบาย                                                  |
| ----------------------- | ------------------- | --------------------------------------------------------- |
| `MINIO_ENDPOINT`        | `localhost:9000`    | host:port ของ MinIO                                       |
| `MINIO_ACCESS_KEY`      | `minioadmin`        |                                                           |
| `MINIO_SECRET_KEY`      | `minioadmin`        |                                                           |
| `MINIO_BUCKET`          | `payment-qr`        | bucket เก็บรูป (สร้างอัตโนมัติตอน start)                  |
| `MINIO_USE_SSL`         | `false`             |                                                           |
| `MINIO_URL_EXPIRY`      | `15m`               | อายุ presigned URL (รูปแบบ Go duration)                   |
| `PROMPTPAY_ID`          | —                   | เบอร์ 10 หลัก หรือเลขบัตร 13 หลัก ของผู้รับเงิน           |
| `BILLER_ID`             | —                   | 15 หลัก (โหมด biller)                                     |
| `BILLER_REF1`           | —                   | reference เริ่มต้น (ถ้าว่าง service ใช้ `INV<invoiceID>`) |
| `BILLER_REF2`           | —                   | reference รอง (ไม่บังคับ)                                 |
| `PAYMENT_MERCHANT_NAME` | `SUT`               | tag 59 (ตัด ≤25)                                          |
| `PAYMENT_MERCHANT_CITY` | `Nakhon Ratchasima` | tag 60 (ตัด ≤15 — ชื่อยาวกว่านี้จะถูกตัด)                 |

config อ่านเข้า struct `MinioConfig` / `PaymentConfig` ใน `internal/config/config.go`

---

## 6. การเปลี่ยนแปลง Database

ฟีเจอร์นี้เพิ่ม `Invoice` และ `Payment` เข้า `models.AllEntities` (`init-db` จะ migrate ให้)

### 6.1 แก้ Foreign Key ใน model ให้ถูกต้องตาม GORM

models เดิม (`payment.go`, `invoice.go`) ประกาศ FK ผิด — field ชื่อ `XxxID` แต่ type
เป็น struct (`*Invoice`) ทำให้ GORM **ไม่สร้างคอลัมน์ FK จริง** และ set ค่าไม่ได้
รอบนี้แก้เฉพาะ 2 model ที่ฟีเจอร์ใช้ ให้เป็นคอลัมน์ scalar:

```go
// Payment (หลังแก้)
InvoiceID      uint    // คอลัมน์ FK จริง set/query ได้
MethodID       *uint
SlipDocumentID *uint
VerifiedByID   *uint
StatusID       *uint
QRPayload      string  // payload EMVCo
QRObjectKey    string  // object key ของรูปใน MinIO (ใช้ re-presign ภายหลัง)
```

> association struct (เช่น `Invoice *Invoice`) ถูก **ตัดออกตั้งใจ** เพื่อให้ AutoMigrate
> แตะแค่ตาราง `invoices` / `payments` ไม่ลากตารางอื่น (เช่น `documents` ที่ FK ยังผิดอยู่)
> เข้ามา — model อื่น (`booking`, `document`) ค่อยแก้ตอนทำฟีเจอร์ที่เกี่ยวข้อง

### 6.2 Seed data

`cmd/init-db/seed_data/invoice.go` seed invoice ตัวอย่าง 2 ใบ (idempotent, match ด้วย
`BookingID`): `id=1` ยอด 150.00, `id=2` ยอด 2500.50

---

## 7. วิธีทดสอบ

### 7.1 เฉพาะตรรกะ payload (ไม่ต้องมี infra)

```powershell
go test ./internal/pkg/promptpay/... -v
```

### 7.2 End-to-end

**ขั้นที่ 1 — เตรียมระบบ (รันผ่าน cmd)**

รันทีละคำสั่งใน Command Prompt ที่ path `apps/backend`:

```cmd
1. สตาร์ท MinIO (object storage)
docker run -d --name minio -p 9000:9000 -p 9001:9001 -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin minio/minio server /data --console-address ":9001"

2. ตั้ง PROMPTPAY_ID ใน .env เป็นเบอร์ผู้รับเงินจริง (แก้ไฟล์)

3. migrate + seed (สร้างตาราง + user + invoice ตัวอย่าง)
go run ./cmd/init-db

4. start server
go run ./cmd/serve
```

> MinIO console: http://localhost:9001 (minioadmin / minioadmin) — bucket `payment-qr` สร้างอัตโนมัติตอน start

**ขั้นที่ 2 — ทดสอบ API ด้วย Postman**

**(2.1) Login เพื่อเอา access token**

|                   |                                                         |
| ----------------- | ------------------------------------------------------- |
| Method            | `POST`                                                  |
| URL               | `http://localhost:8080/api/v1/auth/login`               |
| Headers           | `Content-Type: application/json`                        |
| Body (raw / JSON) | `{ "email": "admin@example.com", "password": "admin" }` |

จาก response คัดลอกค่า `data.access_token` ไปใช้ในขั้นถัดไป

**(2.2) Generate QR**

|                   |                                                                            |
| ----------------- | -------------------------------------------------------------------------- |
| Method            | `POST`                                                                     |
| URL               | `http://localhost:8080/api/v1/payments/qr`                                 |
| Headers           | `Content-Type: application/json`<br>`Authorization: Bearer <access_token>` |
| Body (raw / JSON) | `{ "invoice_id": 1, "mode": "promptpay" }`                                 |

- ตั้ง Authorization tab เป็น **Bearer Token** แล้ววาง token หรือใส่ใน Headers ตรงๆ ก็ได้
- เปลี่ยน `invoice_id` เป็น `2` เพื่อทดสอบยอด 2500.50
- เปลี่ยน `mode` เป็น `biller` เพื่อทดสอบโหมด bill payment (ต้องตั้ง `BILLER_ID` 15 หลักใน `.env` ก่อน)

**(2.3) ดูรูป QR** — คัดลอก `data.qr_code_url` จาก response ไปเปิดใน browser (presigned URL ใช้ได้ 15 นาที)

**ยืนยันสุดท้าย:** สแกน QR ด้วยแอปธนาคารจริง → ต้องขึ้นชื่อเจ้าของ `PROMPTPAY_ID`
และยอดตรงกับ invoice

---

## 8. ความพร้อมใช้งาน (Readiness)

### ✅ พร้อมใช้ (development / internal)

- สร้าง payload PromptPay + Biller ถูกต้องตาม EMVCo (CRC ผ่าน unit test)
- ยอดเงินดึงจาก DB เสมอ (กัน client ปลอมยอด)
- endpoint ต้องล็อกอิน (`AuthMiddleware`)
- รูป QR เก็บ MinIO + presigned URL มีวันหมดอายุ

### ⚠️ ต้องทำก่อนขึ้น production

- [ ] `PROMPTPAY_ID` / `BILLER_ID` ตั้งเป็นบัญชีผู้รับเงินจริงของมหาวิทยาลัย
- [ ] `MINIO_USE_SSL=true` + endpoint จริงเมื่อรันบน production
- [ ] พิจารณากั้น endpoint ด้วย permission `payment:create` (ตอนนี้แค่ล็อกอินก็เรียกได้)
- [ ] ตั้ง `PAYMENT_MERCHANT_CITY` ให้ ≤15 ตัวอักษร ถ้าไม่อยากให้ถูกตัด (ไม่กระทบการจ่ายเงิน)

### 📌 ข้อจำกัดที่ควรรู้ (by design / ยังไม่ทำ)

- ยังไม่มี API สร้าง/แก้ invoice — ต้อง seed หรือสร้างจากฝั่ง booking ก่อน
- โหมด biller ใช้ `BILLER_REF1` จาก `.env` ถ้าตั้งไว้ ไม่งั้น default เป็น `INV<invoiceID>`
- ยังไม่มีการอัปเดตสถานะการชำระเงิน (`PaymentStatus`) / ตรวจสลิป — เป็นขั้นถัดไป
- 1 invoice ↔ 1 payment (upsert ด้วย `invoice_id`) เรียก generate ซ้ำจะ reuse payment row เดิมและสร้างรูปใหม่

**สรุป:** ใช้สร้าง QR ชำระเงินได้จริงในระดับ dev/internal ส่วนการขึ้น production ให้ทำ
ตาม checklist ด้านบน และต่อยอดเรื่องตรวจสลิป/อัปเดตสถานะการชำระเงินต่อไป

```

```
