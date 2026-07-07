# Payment QR Generation & Slip Verification

เอกสารสรุประบบ **ชำระเงินด้วย QR (PromptPay / Bill Payment)** + **ตรวจสลิปด้วย EasySlip**
ของ backend (`apps/backend`) — สร้าง EMVCo payload เอง (TLV + CRC16), render เป็นรูป,
เก็บใน MinIO, คืน presigned URL, แล้วรับสลิปที่ผู้ใช้อัปโหลดไปตรวจกับ EasySlip เพื่อ
auto-match กลับเข้ากับการจอง ก่อนให้เจ้าหน้าที่ยืนยัน

> อัปเดตล่าสุด: 2026-07-06

---

## 1. ภาพรวมระบบ

มหาวิทยาลัยเข้าไม่ถึง reconciliation API ของธนาคาร จึงใช้แนวทาง **self-gen reference +
ตรวจสลิป**: ฝัง `ref1 = BK<bookingID>` ลงใน biller QR (ref เดินทางถึงธนาคารและกลับมาใน
สลิป), ผู้ใช้อัปสลิป, ระบบส่งสลิปให้ EasySlip แล้วเอา `ref1`/ยอด/ผู้รับที่อ่านได้มา
match กับ "ตัวตั้ง" ที่เก็บไว้ตอนออก QR

```
① สร้าง QR
Frontend ─POST {booking_id, mode}─▶ PaymentQRService
                                     │ 1. ดึง Booking.TotalPrice จาก DB (ยอดจริง)
                                     │ 2. อ่านข้อมูลผู้รับจาก .env (BILLER_ID/PROMPTPAY_ID)
                                     │ 3. build EMVCo payload + CRC16 (ref1=BK<id>)
                                     │ 4. render PNG → upload MinIO
                                     │ 5. upsert QRRef1/QRPayload/QRObjectKey/QRIssuedAt → invoice
                                     ▼
Frontend ◀── {booking_id, amount, payload, qr_code_url} ──┘

② ผู้ใช้จ่าย + อัปสลิป → ③ ตรวจสลิป
Frontend ─POST {booking_id, document_id}─▶ PaymentVerifyService
                                            │ 1. โหลด invoice (ตัวตั้ง: QRRef1/TotalAmount/QRIssuedAt)
                                            │ 2. ดึงรูปสลิปจาก MinIO → เรียก EasySlip
                                            │ 3. dedupe ด้วย SlipTransRef
                                            │ 4. verdict: เทียบยอด/ref1/เวลา + flag ผู้รับ
                                            │ 5. สร้าง PaymentTransaction (auto_verified | mismatch)
                                            ▼
Frontend ◀── {status, trans_ref, match_amount, match_ref, receiver_flag, ...} ──┘

④ เจ้าหน้าที่ยืนยัน
Staff ─POST /payments/:id/verify {status_id=confirmed}─▶ invoice=paid, booking=completed
```

**หลักการสำคัญ:** ยอดเงินมาจาก **`bookings.total_price`** เสมอ (ไม่เชื่อ client) ส่วนข้อมูล
ผู้รับเงินเป็นค่าคงที่ต่อ deployment อยู่ใน `.env`

---

## 2. บทบาทของตาราง

| ตาราง | บทบาท | ความสัมพันธ์ |
| --- | --- | --- |
| `bookings` | แหล่งยอดเงินจริง (`total_price`) | — |
| `invoices` | **ตัวตั้ง (expected)** — เก็บ QR ที่ออก (`qr_ref1`/`qr_payload`/`qr_object_key`/`qr_issued_at`) + สถานะบิล `pending→paid` | 1 : 1 booking |
| `payment_transactions` | **หลักฐาน (actual)** — 1 สลิป = 1 แถว, เก็บผล EasySlip + `slip_trans_ref` (uniqueIndex สำหรับ dedupe) | N : 1 invoice |

> `slip_trans_ref` ต้อง unique ระดับทั้งระบบเพื่อกันสลิปซ้ำ จึงอยู่ที่ transaction ไม่ใช่
> invoice — 1 invoice อาจมีหลายครั้งอัปสลิป (ครั้งแรก mismatch, ครั้งถัดไปผ่าน)

---

## 3. Status Flow

```
                     ┌────────── invoice.status ──────────┐
                     │ pending ───────────────► paid       │  (เมื่อ transaction = confirmed)
                     └─────────────────▲───────────────────┘
        payment_transaction.status
  สร้าง QR (ยังไม่มี transaction — เก็บ ref ลง invoice)
        │  ผู้ใช้จ่าย + อัปสลิป
        ▼
  slip_uploaded ──► เรียก EasySlip
        ├─ ยอด/ref/เวลา ไม่ตรง หรือ dedupe ซ้ำ ─► mismatch  (ให้ผู้ใช้อัปใหม่)
        └─ ผ่าน ─► auto_verified ──┬─ เจ้าหน้าที่ confirm ─► confirmed  ✅ (invoice=paid, booking=completed)
                                   └─ เจ้าหน้าที่ปฏิเสธ ─► rejected
```

Seed `PaymentStatuses`: `pending, slip_uploaded, auto_verified, mismatch, confirmed, rejected`
(`cmd/init-db/seed_data/lookup_tables.go`)

---

## 4. มาตรฐาน EMVCo QR (`internal/pkg/promptpay`)

payload เป็นสตริง **TLV** (`tag(2)+length(2)+value`) ปิดท้ายด้วย **CRC16-CCITT**
(poly `0x1021`, init `0xFFFF`)

| Tag | Field | ค่า/หมายเหตุ |
| --- | --- | --- |
| 00 | Payload Format | `01` |
| 01 | Point of Initiation | `11` static (ไม่ระบุยอด) / `12` dynamic (มียอด) |
| 29 | Merchant — **PromptPay** | `00`=AID `A000000677010111`, `01`=เบอร์ / `02`=เลขบัตร |
| 30 | Merchant — **Biller** | `00`=AID `A000000677010112`, `01`=biller id, `02`=ref1, `03`=ref2 |
| 52 | Merchant Category | `0000` |
| 53 | Currency | `764` (THB) |
| 54 | Amount | เช่น `220.00` (เฉพาะตอนระบุยอด) |
| 58 / 59 / 60 | Country / Name(≤25) / City(≤15) | `TH` / merchant name / city |
| 63 | CRC | 4 hex digits |

**การ normalize**: PromptPay id (10 หลัก→เบอร์ tag01 / 13 หลัก→เลขบัตร tag02),
Biller id 15 หลัก, reference A-Z0-9 ≤20, amount ทศนิยม 2 ตำแหน่งเสมอ
ทดสอบที่ `internal/pkg/promptpay/promptpay_test.go`

> **โหมดที่ใช้จริง = biller** เพราะ `ref1 = BK<bookingID>` จะเดินทางถึงธนาคารและกลับมาใน
> สลิป (ยืนยันด้วยการสแกนจริง: ผู้รับ = ม.ทส., Ref1 = BK1) ทำให้ EasySlip อ่าน ref กลับมา
> auto-match ได้ ส่วน promptpay mode ไม่มี ref → `qr_ref1` ว่าง, match ด้วยยอด/เวลา

---

## 5. ตรวจสลิปด้วย EasySlip (`internal/pkg/easyslip`)

client เรียก EasySlip v2 (`POST {base}/verify`, header `Authorization: Bearer <key>`)
ได้ 2 ทาง: `VerifyByImage` (multipart field `file`) และ `VerifyByPayload` (JSON `{payload}`)
คืน `VerifyResult`: `TransRef, Ref1/2/3, Amount, ReceiverName, ReceiverBank, SenderName,
Date, Payload, Raw`

> ⚠️ mapping ของ response อิงเอกสาร v2 แต่ยัง **ไม่ได้ verify กับ response จริง** — เก็บ
> body ดิบไว้ที่ `VerifyResult.Raw` ครบ ถ้า field ไม่ตรงปรับได้ที่ `apiData` ใน `easyslip.go`

### Verdict / auto-match (`PaymentVerifyService.evaluate`)

| เงื่อนไข | ผล |
| --- | --- |
| `slip_trans_ref` ซ้ำ (dedupe) | reject `duplicate slip` |
| `round(SlipAmount) ≠ invoice.total_amount` | **mismatch** (hard) |
| `ref1 ≠ invoice.qr_ref1` (เมื่อ QR มี ref) | **mismatch** (hard) |
| จ่ายก่อน `qr_issued_at` | **mismatch** (hard) |
| ชื่อผู้รับไม่ contains `PAYMENT_RECEIVER_NAME` | `auto_verified` + **`receiver_flag=true`** (soft, ให้เจ้าหน้าที่ดู) |
| ผ่านทั้งหมด | `auto_verified` |

การเทียบชื่อผู้รับเป็น contains-match แบบตัด whitespace/ตัวพิมพ์ (ธนาคาร mask ชื่อไม่เหมือนกัน)
ถ้า `PAYMENT_RECEIVER_NAME` ว่าง = ถือว่าผ่าน

---

## 6. โครงสร้างไฟล์

```
internal/
├── pkg/promptpay/           # EMVCo payload + CRC16 + TLV (pure) + test
├── pkg/easyslip/            # EasySlip HTTP client + response mapping (ใหม่)
├── initializers/minio/      # MinIO client
├── dto/payment.go           # GenerateQR* / VerifySlip* / CreatePayment* / VerifyPayment*
├── repositories/
│   ├── invoice.go           # FindByBookingID / FindByID / UpdateQRByBookingID (ใหม่)
│   ├── booking.go           # FindByID (ดึง total_price)
│   ├── document.go          # FindByID (ดึงสลิปจาก storage)
│   └── payment.go           # Create / FindBySlipTransRef / FindMethodByName (ใหม่)
├── services/
│   ├── payment_qr.go        # สร้าง QR + persist ref ลง invoice
│   ├── payment_verify.go    # เรียก EasySlip + verdict + สร้าง transaction (ใหม่)
│   └── payment.go           # staff confirm (status=confirmed → invoice paid)
├── controllers/payment.go   # GenerateQR / VerifySlip / Verify / ...
└── routes/payment.go        # /payments/... (ต้องล็อกอิน)
```

wiring: `cmd/serve/main.go` (สร้าง easyslip client + verify service),
`internal/config/config.go` (`PaymentConfig` + `EasySlipConfig`)

---

## 7. API _(ทุก endpoint ต้องล็อกอิน — `Authorization: Bearer <token>`)_

### 7.1 `POST /api/v1/payments/qr` — สร้าง QR

**Request**
```json
{ "booking_id": 1, "mode": "biller" }
```
| field | ชนิด | หมายเหตุ |
| --- | --- | --- |
| `booking_id` | uint (required) | ใช้ดึง `total_price` จากตาราง `bookings` |
| `mode` | string | `promptpay` (default) หรือ `biller` |

**Response 200**
```json
{
  "success": true,
  "data": {
    "booking_id": 1,
    "amount": 220,
    "payload": "00020101021230460016A00000067701011201150994000288654300203BK1...6304XXXX",
    "qr_code_url": "http://localhost:9000/payment-qr/qr/booking-1-...png?X-Amz-...",
    "expires_in": 900
  }
}
```

### 7.2 `POST /api/v1/payments/verify-slip` — ตรวจสลิป

**Request** (ให้อย่างใดอย่างหนึ่ง: `document_id` = สลิปที่อัปแล้ว / `payload` = QR string จากสลิป สำหรับทดสอบ)
```json
{ "booking_id": 1, "document_id": 5 }
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "transaction_id": 12,
    "status": "auto_verified",
    "trans_ref": "68370160657749I376388B35",
    "ref1": "BK1",
    "amount": 220,
    "match_amount": true,
    "match_ref": true,
    "receiver_matched": true,
    "receiver_flag": false,
    "reasons": []
  }
}
```
`status = mismatch` เมื่อมี hard reason (`reasons` เช่น `["amount"]` / `["ref1"]` / `["paid_before_qr"]`)

### 7.3 `POST /api/v1/payments/:id/verify` — เจ้าหน้าที่ยืนยัน

**Request** `{ "status_id": <id ของ "confirmed">, "note": "" }`
→ ถ้า status = `confirmed`: invoice → `paid`, booking → `completed` (+ status log)

### 7.4 อื่น ๆ
`POST /payments` (สร้าง transaction ตรง), `GET /payments`, `PUT /payments/:id/slip/:docId`,
`GET /invoices/:id/transactions`

**Error หลัก**
| สถานการณ์ | HTTP |
| --- | --- |
| ไม่มี/ผิด `Authorization` | 401 |
| `booking_id`/invoice/slip ไม่พบ | 404 |
| `mode` ไม่ใช่ promptpay/biller | 400 |
| สลิปซ้ำ (dedupe) | 400 `duplicate slip` |
| ไม่ได้ตั้ง `EASYSLIP_API_KEY` | 500 `slip verification is not configured` |
| EasySlip ตอบ error (เช่น `duplicate_slip`) | 400 (ข้อความจาก EasySlip) |

---

## 8. Configuration (`.env`)

| Key | ค่าเริ่มต้น | คำอธิบาย |
| --- | --- | --- |
| `MINIO_ENDPOINT` / `_ACCESS_KEY` / `_SECRET_KEY` | `localhost:9000` / `minioadmin` / `minioadmin` | MinIO |
| `MINIO_BUCKET` | `payment-qr` | bucket (สร้างอัตโนมัติ) |
| `MINIO_URL_EXPIRY` | `15m` | อายุ presigned URL |
| `PROMPTPAY_ID` | — | เบอร์ 10 หลัก / เลขบัตร 13 หลัก (promptpay mode) |
| `BILLER_ID` | — | 15 หลัก = เลขภาษี 13 + suffix 2 (biller mode) |
| `BILLER_REF1` / `BILLER_REF2` | — | ถ้า `BILLER_REF1` ว่าง service ใช้ `BK<bookingID>` |
| `PAYMENT_MERCHANT_NAME` / `_CITY` | `SUT` / `Nakhon Ratchasima` | tag 59 (≤25) / tag 60 (≤15) |
| `PAYMENT_RECEIVER_NAME` | — | ชื่อบัญชีผู้รับที่คาดหวัง (เทียบกับสลิป → `receiver_flag`) |
| `PAYMENT_RECEIVER_BANK` | — | (optional) รหัสธนาคารผู้รับ |
| `EASYSLIP_API_KEY` | — | key จาก developer.easyslip.com (ว่าง = ตรวจสลิปไม่ได้) |
| `EASYSLIP_VERIFY_URL` | — | override URL เต็มของ verify endpoint (ว่าง = default V2 `https://api.easyslip.com/v2/verify/bank`) |

---

## 9. การเปลี่ยนแปลง Database (`AutoMigrate` เพิ่มคอลัมน์ scalar — additive)

**`invoices`** เพิ่ม: `qr_ref1` (index), `qr_payload`, `qr_object_key`, `qr_issued_at`

**`payment_transactions`** เพิ่ม: `slip_trans_ref` (**uniqueIndex**), `slip_ref1` (index),
`slip_amount`, `slip_receiver`, `slip_sender`, `slip_paid_at`, `slip_payload`,
`easy_slip_raw` (jsonb), `receiver_flag`, `verify_note`

รัน `go run ./cmd/init-db` เพื่อ migrate + seed statuses ใหม่ (idempotent, ไม่ลบข้อมูลเดิม)

---

## 10. วิธีทดสอบ

### 10.1 เฉพาะตรรกะ payload
```powershell
go test ./internal/pkg/promptpay/... -v
```

### 10.2 End-to-end (PowerShell)

**เตรียม:** Postgres รันที่ `localhost:5432`, MinIO ผ่าน Docker:
```powershell
docker run -d --name minio -p 9000:9000 -p 9001:9001 -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin minio/minio server /data --console-address ":9001"
go run ./cmd/init-db      # migrate + seed (admin@example.com / admin, booking 1=220, booking 2=859)
go run ./cmd/serve
```

**① login + สร้าง QR**
```powershell
$login = Invoke-RestMethod -Uri http://localhost:8080/api/v1/auth/login -Method Post `
  -ContentType "application/json" -Body '{"email":"admin@example.com","password":"admin"}'
$headers = @{ Authorization = "Bearer $($login.data.access_token)" }

$qr = Invoke-RestMethod -Uri http://localhost:8080/api/v1/payments/qr -Method Post `
  -ContentType "application/json" -Headers $headers `
  -Body '{"booking_id":1,"mode":"biller"}'    # ต้องตั้ง BILLER_ID 15 หลักก่อน
$qr.data | Format-List
Start-Process $qr.data.qr_code_url
```
สแกน QR ด้วยแอปธนาคาร → ผู้รับต้องเป็นมหาวิทยาลัย, Ref1 = `BK1`, ยอด 220.00

**② ยืนยัน persist** (psql)
```powershell
psql "postgresql://postgres:postgres@localhost:5432/mydb" -c "SELECT booking_id, qr_ref1, qr_object_key, qr_issued_at FROM invoices WHERE booking_id=1;"
```

**③ ตรวจสลิป** (ต้องมี `EASYSLIP_API_KEY`) — ทดสอบเร็วด้วย payload ของสลิปจริง
```powershell
Invoke-RestMethod -Uri http://localhost:8080/api/v1/payments/verify-slip -Method Post `
  -ContentType "application/json" -Headers $headers `
  -Body '{"booking_id":1,"payload":"<qr-string-จากสลิปจริง>"}'
```
คาดหวัง `status=auto_verified`, `match_amount=true`, `match_ref=true`

---

## 11. ความพร้อมใช้งาน

### ✅ พร้อม (development / internal)
- สร้าง payload PromptPay + Biller ถูกต้องตาม EMVCo (CRC ผ่าน test)
- ยอดจาก `bookings.total_price` เสมอ (กัน client ปลอมยอด)
- QR persist ลง invoice (มีตัวตั้งให้ match)
- ตรวจสลิป EasySlip + auto-match (ยอด/ref1/เวลา) + dedupe + flag ผู้รับ
- endpoint ต้องล็อกอิน, รูป QR เก็บ MinIO + presigned URL หมดอายุได้

### ⚠️ ต้องทำก่อน production
- [ ] ตั้ง `BILLER_ID` / `PROMPTPAY_ID` เป็นบัญชีจริงของมหาวิทยาลัย
- [ ] ตั้ง `EASYSLIP_API_KEY` จริง และ **verify response mapping กับ response จริง** (ปรับ `easyslip.go` ถ้า field ต่าง)
- [ ] `MINIO_USE_SSL=true` + endpoint จริง
- [ ] พิจารณากั้น endpoint ด้วย permission (ตอนนี้แค่ล็อกอินก็เรียกได้)

### 📌 ข้อจำกัด/ยังไม่ทำ
- ยังไม่มี unit test ของ `PaymentVerifyService` / `easyslip`
- frontend ยังไม่ต่อ `verify-slip` (หน้า payment ยังใช้ flow เดิม)
- ยังไม่มี API สร้าง/แก้ invoice — invoice ถูกสร้างพร้อม booking
```
