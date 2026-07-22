# Booking Flow — Bug Fixes & Improvements

วันที่: 4 กรกฎาคม 2569

สรุปการแก้ไขและปรับปรุง booking flow ตั้งแต่หน้า search → calendar → confirm → document form

---

## ปัญหาที่พบ

ตรวจสอบ flow ทั้งหมดได้แก่:
- `app/bookings/search/page.tsx`
- `app/bookings/[roomId]/page.tsx`
- `app/bookings/[roomId]/confirm/page.tsx`
- `features/bookings/components/confirm/BookingConfirmView.tsx`
- `features/bookings/components/confirm/DocumentFormModal.tsx`
- `features/bookings/hooks/useBookingCalendar.ts`
- `features/bookings/components/calendar/BookingCalendarView.tsx`

---

## การแก้ไข

### Fix #1 — `draft === null` ใน BookingConfirmView

**ไฟล์:** `features/bookings/components/confirm/BookingConfirmView.tsx`

**ปัญหา:** ถ้า user เปิด URL confirm โดยตรงโดยไม่ผ่านหน้า calendar จะไม่มี draft ใน sessionStorage หน้าจะแสดงข้อมูลว่างเปล่าเงียบ ๆ โดยไม่มี error หรือ redirect

**การแก้:** ถ้า sessionStorage ไม่มี draft → redirect กลับ `/bookings/[roomId]` ทันที พร้อม early return เพื่อป้องกันการ render ขณะ redirect

---

### Fix #2 — ราคา Full-day ไม่ถูกต้อง

**ไฟล์:** `features/bookings/components/confirm/BookingConfirmView.tsx`

**ปัญหา:** คำนวณ `totalPrice = totalHours * pricePerHour` เสมอ ถ้า user จอง full-day (07:00–21:00 = 14 ชม.) จะได้ราคา 14 × pricePerHour แทนที่จะเป็น pricePerDay

**การแก้:**
- เพิ่ม `splitByType()` แยก timeslots เป็น full-day vs hourly
- คำนวณ `fullDayTotal = count × pricePerDay` และ `hourlyTotal = hours × pricePerHour`
- UI breakdown แสดงแถว full-day และ hourly แยกกัน

---

### Fix #3 — Terms & Conditions ครอบเฉพาะ path สร้าง PDF

**ไฟล์:** `features/bookings/components/confirm/BookingConfirmView.tsx`, `DocumentFormModal.tsx`

**ปัญหา:** Terms อยู่ใน DocumentFormModal เท่านั้น user ที่ **อัปโหลดเอกสารเอง** (ไม่ได้ผ่าน modal) จะไม่เห็น Terms เลย

**การแก้:**
- ย้าย Terms section (scroll-to-read + checkbox) มาไว้ใน confirm page
- ลบออกจาก DocumentFormModal
- ปุ่มยืนยันการจองต้องมี `termsAccepted === true` จึงจะกดได้ ครอบทุก path

---

### Fix #4 — Document Upload ล้มเหลวเงียบ

**ไฟล์:** `features/bookings/components/confirm/BookingConfirmView.tsx`

**ปัญหา:** ถ้า upload หรือ createDocument ล้มเหลว catch block ทิ้งโดยไม่แจ้ง user เลย (เพราะ booking สร้างสำเร็จแล้ว ไม่ต้องการ block redirect)

**การแก้:** แสดง `toast.warning()` บอก user ว่าเอกสารไม่ถูกบันทึก แต่การจองยังสำเร็จ

```tsx
toast.warning(`อัปโหลดเอกสาร "${file.name}" ไม่สำเร็จ — การจองถูกบันทึกแล้ว`);
```

---

### Fix #5 — Purpose กรอกได้ 2 ที่ ทำให้สับสน

**ไฟล์:** `features/bookings/components/confirm/DocumentFormModal.tsx`

**ปัญหา:** `purpose` มี textarea ในทั้ง confirm page และ DocumentFormModal โดย sync กันผ่าน `onPurposeChange` prop ทำให้ user ไม่รู้ว่าต้องกรอกที่ไหน

**การแก้:**
- ลบ `purposeText` field ออกจาก DocumentFormModal ทั้ง FormData, form state, และ textarea
- PDF preview ใช้ `purpose` prop โดยตรง (read-only)
- ลบ `onPurposeChange` callback ออก
- User กรอก purpose ที่เดียวใน confirm page

---

### Fix #6 — ไม่มี Loading State บนหน้า Calendar และ Confirm

**ไฟล์:** `app/bookings/[roomId]/page.tsx`, `app/bookings/[roomId]/confirm/page.tsx`

**ปัญหา:** ขณะโหลด room จาก API ทั้ง 2 หน้า return `null` ทำให้หน้าจอว่างเปล่า

**การแก้:** แสดง Skeleton layout ที่มีโครงสร้างตรงกับหน้าจริง ขณะรอโหลด

---

### Fix #7 — Room-Fetching Logic ซ้ำกัน 2 หน้า

**ไฟล์ใหม่:** `features/bookings/hooks/useRoom.ts`

**ปัญหา:** `app/bookings/[roomId]/page.tsx` และ `confirm/page.tsx` มี useEffect + useState สำหรับ fetch room เหมือนกันทุกบรรทัด

**การแก้:** สร้าง `useRoom(roomId)` hook ที่ encapsulate logic นี้ ทั้ง 2 หน้า import hook เดียวกัน

```ts
// ก่อน: ~10 บรรทัด useEffect/useState ซ้ำกัน
// หลัง:
const { room, notFound: notFound404 } = useRoom(roomId);
```

---

## ไฟล์ที่เปลี่ยนแปลง

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `features/bookings/components/confirm/BookingConfirmView.tsx` | Fix #1, #2, #3, #4, #5 |
| `features/bookings/components/confirm/DocumentFormModal.tsx` | Fix #3, #5, #8, #9, Refactor |
| `app/bookings/[roomId]/page.tsx` | Fix #6, #7 |
| `app/bookings/[roomId]/confirm/page.tsx` | Fix #6, #7 |
| `features/bookings/hooks/useRoom.ts` *(ใหม่)* | Fix #7 |
| `features/bookings/hooks/useThaiAddressAutofill.ts` *(ใหม่)* | Fix #8, #9 |
| `features/bookings/components/confirm/SignaturePad.tsx` *(ใหม่)* | Refactor |
| `features/bookings/components/confirm/FField.tsx` *(ใหม่)* | Refactor |
| `lib/utils/thaiDate.ts` *(ใหม่)* | Refactor |

---

## อัปเดต — 5 กรกฎาคม 2569

### Fix #8 — เพิ่ม Thai address autofill ใน DocumentFormModal

**ไฟล์:** `features/bookings/components/confirm/DocumentFormModal.tsx`, `features/bookings/hooks/useThaiAddressAutofill.ts` *(ใหม่)*

**ปัญหา:** ผู้ใช้ต้องกรอกตำบล/อำเภอ/จังหวัดเองทั้งหมด ทั้งที่รหัสไปรษณีย์บอกข้อมูลนี้ได้อยู่แล้ว

**การแก้:**
- ใช้ package `use-thai-address` ดึงข้อมูลตำบล/อำเภอ/จังหวัดจากรหัสไปรษณีย์ 5 หลัก
- รหัสไปรษณีย์ 1 รหัส อาจมีได้หลายอำเภอ/ตำบล (เช่น `30000` มี 20 ตำบล กระจายอยู่ 2 อำเภอ) — ถ้าไม่กำกวมให้เติมอัตโนมัติเป็น text ปกติ ถ้ากำกวมให้เปลี่ยนเป็น `<select>` dropdown ให้ผู้ใช้เลือกเองแทนการเดา
- อำเภอกับตำบลกรองกันเอง 2 ทาง: เลือกอำเภอก่อน → ตำบลถูกกรองเหลือเฉพาะของอำเภอนั้น, หรือเลือกตำบลก่อน → อำเภอ/จังหวัดเติมอัตโนมัติจากตำบลที่เลือก
- ระดับความกำกวมของอำเภอตัดสินจาก "จำนวนอำเภอที่ไม่ซ้ำกัน" ไม่ใช่จำนวนตำบลทั้งหมด (ซิป 10130 มี 15 ตำบล แต่อยู่อำเภอเดียว → เติมอำเภอให้ตรงได้เลย ไม่ต้องมี dropdown)

**ทดสอบแล้ว** (ผ่านเบราว์เซอร์จริง): รหัสไม่กำกวม (10303, 10130) เติมครบอัตโนมัติ, รหัสกำกวม (30000, 10110) ขึ้น dropdown ให้เลือก, รหัสมั่ว (99999) ไม่เติมอะไร

### Fix #9 — แก้ค่าตำบล/อำเภอค้าง (stale) ข้ามรหัสไปรษณีย์

**ไฟล์:** `features/bookings/hooks/useThaiAddressAutofill.ts`

**ปัญหา:** เวอร์ชันแรกของ Fix #8 เวลารหัสไปรษณีย์ใหม่กำกวม จะ **คงค่าตำบล/อำเภอเดิม** ไว้แทนที่จะเคลียร์ ทำให้พิมพ์รหัส A (เติมอำเภอ X) แล้วเปลี่ยนเป็นรหัส B (กำกวม) จะได้ที่อยู่ขัดแย้งกันเอง เช่น "เมืองปราจีนบุรี นครราชสีมา 30000" (อำเภอกับจังหวัดคนละที่กัน)

**การแก้:** เปลี่ยนให้เคลียร์ค่าที่กำกวมเป็นค่าว่างแทนการคงค่าเดิม แล้วค่อยให้ผู้ใช้เลือกใหม่จาก dropdown

---

### Refactor — แยก DocumentFormModal.tsx ออกเป็นหลายไฟล์

**ไฟล์ที่แยกออกมาใหม่:** `SignaturePad.tsx`, `FField.tsx`, `useThaiAddressAutofill.ts`, `lib/utils/thaiDate.ts`

**ปัญหา:** `DocumentFormModal.tsx` ยาวเกินไป (1,001 บรรทัด) ปนกันหลาย concern: signature pad component, date formatter, generic input field, และ logic ของ Thai address ทั้งหมดอยู่ในไฟล์เดียว

**การแก้:** แยกตาม concern โดยไม่เปลี่ยนพฤติกรรมใด ๆ — `DocumentFormModal.tsx` เหลือ **561 บรรทัด** (ลดลง ~44%) เก็บไว้แค่ state หลักและการประกอบ component ย่อยเข้าด้วยกัน
