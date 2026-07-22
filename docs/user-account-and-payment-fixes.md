# Booking UI, User Account & Payment — บันทึกการทำงาน

วันที่: 5 กรกฎาคม 2569

สรุปงานทั้งหมดในรอบนี้ 2 ส่วน: **(1)** ปรับดีไซน์การ์ด `BookingAreaSelector` (เลือกประเภทสถานที่), **(2)** hydration error ในหน้า dashboard, หน้า Profile ใหม่, การสืบสวนข้อมูล requester ซ้ำซ้อน, และบั๊กปุ่ม "ชำระเงิน" ที่ไม่เคยหายไปหลังจ่ายเงินจริง

---
---

## ส่วนที่ 1 — ปรับดีไซน์ `BookingAreaSelector`

ไฟล์: `apps/frontend/src/features/bookings/components/BookingAreaSelector.tsx`

สรุปการปรับดีไซน์หน้า "เลือกประเภทสถานที่" (การ์ด 4 หมวด: ห้องประชุม, อาคารเรียน, สนามกีฬา, โถงอาคาร) ที่แสดงในหน้า `/bookings`

### เวอร์ชันเดิม

การ์ด 4 ใบ พื้นสีต่างกันตามหมวด (ฟ้า/เขียว/ส้ม/ม่วง) พร้อม icon จาก `lucide-react` ในกล่องสีอ่อน hover แล้วพื้นเปลี่ยนเป็นสีทึบ

### รอบที่ 1 — ปรับให้ดู "ทางการ" ตามธีมสถาบัน

**โจทย์:** ทำให้ดูเป็นทางการ น่าเชื่อถือ เหมาะกับระบบของมหาวิทยาลัย

**การแก้:**

- เปลี่ยนการ์ดจาก "พื้นสีเต็ม" เป็น **พื้นขาว + icon badge สี** แทน
- ใช้สีจาก brand palette ของมหาวิทยาลัยที่มีอยู่แล้ว (`brand-primary` ส้ม, `brand-accent` ทอง, `brand-secondary` เทา, `success` เขียว) แทนสีเขียนเอง (navy/purple/yellow) เพื่อไม่ให้ขัดกับส่วนอื่นของแอป
- เพิ่ม watermark ลายจุดบาง ๆ ที่พื้นหลัง

**ปัญหาที่พบทีหลัง:** การ์ด 4 ใบเหมือนกันเป๊ะ + icon-in-badge + watermark จุด ให้ความรู้สึกเป็น template ทั่วไปที่ AI มักสร้าง

### รอบที่ 2 — แก้ให้ดูไม่เหมือน AI-generated

**การแก้:**

- ลบ watermark ลายจุดทิ้งทั้งหมด
- เปลี่ยนหัวข้อจาก centered hero เป็น **left-aligned พร้อม eyebrow label** เล็ก ๆ ด้านบน
- แบ่งลำดับความสำคัญจริง: **ห้องประชุม** (หมวดที่จองบ่อยสุด) ได้การ์ดใหญ่แบบ hero แยกเดี่ยว มี tag "ยอดนิยม" ส่วนอีก 3 หมวดเป็น **list แบบมีเลขกำกับ (01/02/03)** คั่นด้วยเส้นบาง แทนกล่องการ์ดซ้ำ ๆ

### รอบที่ 3 — "modern, ทางการ, น่าใช้งาน" (loop engineer: ทำซ้ำ-ทดสอบก่อนส่ง)

**โจทย์:** กลับมาเป็นกริดสมมาตร (formal/official มักอ่านง่ายกว่าเป็นกริดเท่ากันทุกใบ) แต่ต้องไม่ใช่ icon-badge แบบเดิม

**iteration 3a:** กริด 2×2 เท่ากันทุกใบ + ghost icon ขนาดใหญ่จาง ๆ ที่มุมการ์ดแทน badge + เส้น accent สีบางที่ก้นการ์ด
→ ทดสอบแล้วพบว่า ghost icon ถูกครอบตัด (clip) ที่ขอบการ์ด ดูเหมือนบั๊กมากกว่าตั้งใจ

**iteration 3b (แก้แล้ว):** ปรับให้ ghost icon อยู่ในขอบการ์ดพอดี ไม่ถูกตัด, จัดลำดับ label → tag → description → เส้น accent + ลูกศร (`ArrowUpRight`) ให้สมดุล
→ ทดสอบซ้ำในเบราว์เซอร์ทั้ง desktop, hover state, mobile viewport (390px) ผ่านหมด, คลิกแล้ว navigate ไป `/bookings/search?category=...` ถูกต้องทุกปุ่ม

### รอบที่ 4 — เปลี่ยนจาก icon เป็นรูปถ่ายจริง

**โจทย์:** ใช้รูปถ่ายแทน icon เพื่อความสมจริง/premium มากขึ้น

**ตรวจสอบก่อนทำ:** เช็คฐานข้อมูล พบว่าระบบยังไม่มีรูปจริงของสถานที่ใช้งานได้ครบทั้ง 4 หมวด:

| หมวด | สถานะรูปในระบบ |
|---|---|
| อาคารเรียน (ห้องบรรยาย) | มี `image_url` แต่เป็น **presigned URL ที่หมดอายุแล้ว** (403 Forbidden) |
| ห้องประชุม | ไม่มี `image_url` เลยสักห้อง |
| สนามกีฬา | **ไม่มีประเภทสถานที่นี้ในระบบเลย** |
| โถงอาคาร | ไม่มี `image_url` เลยสักห้อง |

> หมายเหตุ: การที่ presigned URL หมดอายุเป็นบั๊กแยกต่างหาก (backend เก็บ URL ที่มีวันหมดอายุไว้ถาวรใน DB แทนที่จะสร้างใหม่ทุกครั้งที่เรียกดู) ไม่ได้แก้ในรอบนี้

**การแก้ (ชั่วคราว จนกว่าจะมีรูปจริงครบ):**

- ใช้รูป stock จาก Unsplash แทนไปก่อน — **ดาวน์โหลดและดูรูปแต่ละใบด้วยตาก่อนใช้จริง** (ไม่เดา URL) เพื่อให้แน่ใจว่าตรงกับหมวดหมู่
- รูปที่เลือก: ห้องประชุม (คนคุยงาน+laptop), อาคารเรียน (ห้องเรียนคลาสสิก โต๊ะ+กระดานดำ), สนามกีฬา (ห่วงบาสเก็ตบอล), โถงอาคาร (งานอีเวนต์ในหอประชุม)
- โครงสร้างการ์ดยังเป็นกริดสมมาตรเดิม แค่เปลี่ยนจาก ghost icon เป็นรูปถ่ายด้านบนการ์ด + เส้น accent สีบางที่ขอบล่างของรูป

**TODO ในอนาคต:** สลับ URL รูป stock เป็นรูปจริงของแต่ละสถานที่ เมื่อทีมอัปโหลดรูปเข้าระบบและแก้บั๊ก presigned URL หมดอายุแล้ว

---
---

## ส่วนที่ 2 — User Account, Profile & Payment

### Fix #1 — Hydration error ในหน้า `/user/profile`

**ไฟล์:** `app/user/layout.tsx`, `app/operator/layout.tsx`

**ปัญหา:** React แจ้ง "Hydration failed" ทุกครั้งที่เข้าหน้า user dashboard — reproduce ซ้ำได้แม้ในเบราว์เซอร์เปล่าไม่มี extension เลย จึงไม่ใช่ปัญหา extension ตามที่ error message แนะนำ

**ต้นเหตุ:** `AuthProvider` อ่าน `localStorage` แบบ synchronous ใน `useState` initializer — ฝั่ง server ไม่มี `localStorage` เลยได้ `isAuthenticated = false` เสมอ แต่ฝั่ง client render ครั้งแรกอ่านค่าจริงได้ทันที ทำให้ผลลัพธ์ที่ render ไม่ตรงกัน (server ว่างเปล่า, client เห็น dashboard เต็ม) `admin/layout.tsx` และ `staff/layout.tsx` มี `isMounted` flag กันปัญหานี้อยู่แล้ว แต่ `user/layout.tsx` และ `operator/layout.tsx` ไม่มี — เป็นจุดตกหล่นตอนก็อปโค้ดกัน

**การแก้:** เพิ่ม `isMounted` gate แบบเดียวกับ `admin`/`staff` ให้ทั้งสองไฟล์ — render `null` จนกว่า client mount เสร็จ ค่อยเช็ค auth

---

### Feature ใหม่ — หน้า Profile (`/user/profile`)

**ไฟล์ใหม่:** `features/profile/services/profile.service.ts`, `features/profile/components/ProfileView.tsx`

หน้าเดิมเป็นแค่ placeholder ("Profile Page") เปล่า ๆ สร้างใหม่ทั้งหมด:

1. **การ์ดสรุปบัญชี** — avatar, ชื่อ-นามสกุล, badge ประเภทผู้ขอใช้, อีเมล
2. **ข้อมูลส่วนตัว** (read-only) — ชื่อ, นามสกุล, เบอร์โทร, LINE ID, ประเภทผู้ขอใช้ — ผ่าน `GET /me/requester` ที่มีอยู่แล้ว
3. **เปลี่ยนรหัสผ่าน** — ฟอร์มจริงต่อกับ `PUT /me/password`
4. **ลายเซ็นของฉัน** — ดู/อัปโหลด/ลบลายเซ็นที่บันทึกไว้ (reuse `/me/signature` เดิมจาก booking flow)

**ข้อจำกัดที่ตั้งใจไว้:** "ข้อมูลส่วนตัว" เป็น read-only เพราะ backend ยังไม่มี endpoint ให้ requester แก้ข้อมูลตัวเอง (มีแต่ `PUT /admin/requesters/:id` ให้ admin แก้แทน) — ต้องเพิ่ม `PUT /me/requester` ก่อนถึงจะทำให้แก้ไขได้เอง

---

### พบระหว่างทาง — ตาราง `profiles` กับ `requesters` ซ้ำซ้อนกัน (ยังไม่แก้)

ตอนตรวจสอบเรื่องราคา booking ผิด พบว่าระบบมี **2 ตารางข้อมูลผู้ใช้ที่ไม่ sync กัน**:

- **22 มิ.ย. 69** มี commit refactor รวม `Admins`/`Staffs`/`Requesters` (3 โมเดลเดิม) เป็น `Profiles` ตัวเดียว แต่ **ไม่ได้ย้ายข้อมูลเก่าไปด้วย** และไม่ได้ลบตารางเก่าทิ้ง
- บัญชีที่สมัครก่อนวันที่ 22 มิ.ย. 69 (เช่น user 4, 5, 6 ที่เจอตอนตรวจสอบ) ข้อมูลตกค้างอยู่ในตาราง `requesters` เก่า ไม่มีแถวใน `profiles` เลย → ทุกจุดที่พึ่ง `requesterRepo.FindByUserID()` (คำนวณราคา booking, `GET /me/requester`) หาไม่เจอและ fallback ผิดแบบเงียบ ๆ
- **ทดสอบแล้ว: บัญชีที่สมัครใหม่หลัง 22 มิ.ย. 69 ไม่ได้รับผลกระทบ** — สมัคร+จองจริงผ่าน API แล้วราคาคำนวณถูกต้อง 100%

**ยังไม่แก้:** ต้องเขียน one-time backfill script copy ข้อมูลจากตาราง `admins`/`staffs`/`requesters` เก่าเข้า `profiles` เฉพาะ `user_id` ที่ยังไม่มีแถว แล้วค่อยลบตารางเก่าทิ้งทีหลังได้อย่างปลอดภัย

---

### Fix #2 — ปุ่ม "ชำระเงิน" ไม่หายไปหลังจ่ายเงินและ verify แล้ว

**ไฟล์:** `models/payment.go`, `repositories/payment.go`, `repositories/invoice.go`, `services/payment.go`, `controllers/payment.go`, `cmd/serve/main.go`

พบบั๊กซ้อนกัน 4 ชั้นในระบบชำระเงิน:

1. **ไม่เคยอัปเดตสถานะ booking หลังจ่ายเงิน** — มีสถานะ `completed` เตรียมไว้ในฐานข้อมูลอยู่แล้วแต่ไม่มีโค้ดจุดไหนตั้งค่านี้เลย ทำให้ booking ค้างสถานะ "อนุมัติแล้ว" ตลอดไป ปุ่ม "ชำระเงิน" (โชว์เมื่อ status="อนุมัติแล้ว") เลยไม่มีวันหาย
   → เพิ่มโค้ดใน `PaymentService.Verify()`: เมื่อ verify การชำระเงินเป็น approved ให้ mark invoice เป็น "paid" **และ** booking เป็น "completed" พร้อม log ประวัติ
2. **`PaymentController.Verify` พิมพ์ context key ผิด** (`"userID"` แทน `"user_id"`) ทำให้การ verify ล้มเหลวด้วย foreign key error ทุกครั้ง — พังมาตั้งแต่แรก
3. **Model ผูก FK ผิดตาราง** — `PaymentTransactions.Verifier` อ้างอิง `Profiles` (ผิด) ทั้งที่ทุกจุดอื่น (เช่น `ChangedBy`) อ้างอิง `Users` (ถูก) — ร่องรอยจาก refactor เดียวกับปัญหา `profiles`/`requesters` ด้านบน → แก้ model + preload chain + ปรับ FK constraint ในฐานข้อมูลตรงให้ตรงกับของใหม่
4. **GORM save-association bug** — `FindByID` preload ความสัมพันธ์ `Status` ไว้ พอแก้ `StatusID` ตรง ๆ แล้ว `Save()` ธรรมดาจะเขียนทับกลับเป็นค่าเดิมจาก association ที่ preload ไว้ (ทั้งใน payment และ invoice repo) → แก้เป็น `.Omit(clause.Associations)` ก่อน save

**ทดสอบ end-to-end จริง** (สร้าง booking → อนุมัติ → จ่ายเงิน → staff verify): `payment_transactions`, `invoices`, `bookings` อัปเดตสถานะถูกต้องครบทุกชั้น เปิดหน้า "การจองของฉัน" จริง ปุ่ม "ชำระเงิน" หายไปตามที่ควร

> **หมายเหตุสำหรับตอน merge `dev-G02` ทีหลัง:** เช็คแล้วพบว่า branch `dev-G02` แก้บั๊กข้อ 1, 2, 4 ข้างบนไว้เหมือนกัน (คนละวิธีแต่ผลลัพธ์เดียวกัน — เขาใช้ `tx.Status = nil` แทน `.Omit(clause.Associations)`) **แต่ไม่ได้แก้ข้อ 3** (`Verifier` ผูก FK ผิดตาราง) เพราะบังเอิญ staff/admin ที่เขาทดสอบมี `profiles.id` ตรงกับ `user_id` เลยไม่เจอบั๊กนี้ — ตอน merge ต้องเอา fix ข้อ 3 ติดไปด้วย ไม่งั้นบั๊กจะกลับมา

---

### Fix #3 — Stepper หน้ารายละเอียด booking (`my-bookings/[id]/page.tsx`)

#### 3.1 ขั้นตอน "เสร็จสิ้น" ไม่ขึ้นเครื่องหมายถูก

**ปัญหา:** เงื่อนไข `done = idx < stepIdx` ทำให้ขั้นตอนสุดท้ายไม่มีทางเป็น `done` ได้เลย (ไม่มีขั้นที่ 5 ให้เทียบว่าน้อยกว่า) แม้ booking จะสถานะ `completed` จริงแล้ว ขั้นสุดท้ายก็ยังโชว์แค่วงกลมเลข 4 เฉย ๆ

**การแก้:** เพิ่มเงื่อนไขพิเศษ — ถ้าเป็นขั้นตอนสุดท้ายและ `idx === stepIdx` ให้ถือว่า done (ไปถึงขั้นสุดท้ายแล้ว ไม่ใช่ "กำลังดำเนินการ" เพราะไม่มีขั้นถัดไป)

#### 3.2 เส้น progress สีส้มทะลุขอบการ์ด

**ปัญหา:** เส้นพื้นหลัง (แทร็กจริง) วางตำแหน่งจาก `left-12.5%` ถึง `right-12.5%` (กว้าง 75% ของกล่อง เพราะจุดวงกลมแรก/สุดท้ายอยู่กึ่งกลางช่อง 25% ริมสองข้าง) แต่เส้น progress สีส้มคำนวณ `width` เป็น `33.33%/66.66%/100%` ซึ่งวัดเทียบกับความกว้าง**เต็ม**ของกล่อง ไม่ใช่แทร็ก 75% ทำให้ตอนถึงขั้นสุดท้าย เส้นยื่นทะลุขอบการ์ดออกไปอีก 12.5%

**การแก้:** เปลี่ยนสูตรเป็น `(stepIdx / (STEPS.length - 1)) × 75%` ให้เส้นวิ่งเทียบกับแทร็กจริง — ทดสอบทั้งสถานะ approved (หยุดกึ่งกลางจุดที่ 3) และ completed (หยุดกึ่งกลางจุดสุดท้าย) ไม่ทะลุอีกแล้ว

---

### Fix #4 — คำว่า "ที่ผ่านมา" ไม่ตรงกับหน้ารายละเอียด

**ไฟล์:** `services/booking.service.ts`, `components/my-bookings/MyBookingsView.tsx`, `data/mock-my-bookings.ts`

**ปัญหา:** สถานะ `completed` ถูกแปลเป็นคนละคำในคนละหน้า — หน้ารายละเอียด booking (`my-bookings/[id]`) ใช้ "เสร็จสิ้น" แต่หน้ารายการ (`MyBookingsView`) ใช้ "ที่ผ่านมา"

**การแก้:** รวมให้ใช้คำว่า **"เสร็จสิ้น"** เหมือนกันทั้งแอป (เปลี่ยน `STATUS_MAP`, tab label, badge, `TabKey` type, mock data ให้ตรงกัน)

---
---

## ไฟล์ที่เปลี่ยนแปลง (ทั้งหมด)

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `features/bookings/components/BookingAreaSelector.tsx` | ส่วนที่ 1 (รอบ 1-4) |
| `app/user/layout.tsx`, `app/operator/layout.tsx` | Fix #1 |
| `features/profile/services/profile.service.ts` *(ใหม่)*, `features/profile/components/ProfileView.tsx` *(ใหม่)*, `app/user/profile/page.tsx` | Feature ใหม่ |
| `models/payment.go`, `repositories/payment.go`, `repositories/invoice.go`, `services/payment.go`, `controllers/payment.go`, `cmd/serve/main.go` | Fix #2 |
| `app/my-bookings/[id]/page.tsx` | Fix #3.1, #3.2 |
| `features/bookings/services/booking.service.ts`, `features/bookings/components/my-bookings/MyBookingsView.tsx`, `features/bookings/data/mock-my-bookings.ts` | Fix #4 |

## ที่ยังค้างอยู่ (TODO)

- สลับ URL รูป stock ของ `BookingAreaSelector` เป็นรูปจริงของแต่ละสถานที่ เมื่อทีมอัปโหลดรูปเข้าระบบและแก้บั๊ก presigned URL หมดอายุแล้ว
- Backfill ข้อมูล `profiles` จากตาราง `admins`/`staffs`/`requesters` เก่า สำหรับบัญชีที่สมัครก่อน 22 มิ.ย. 69
- เพิ่ม `PUT /me/requester` เพื่อให้ผู้ใช้แก้ข้อมูลส่วนตัวเองได้ในหน้า Profile
- ตอน merge `dev-G02`: เอา fix เรื่อง `Verifier` FK (payment.go ข้อ 3 ด้านบน) ติดไปด้วย เพราะ branch เขาไม่มี fix นี้
