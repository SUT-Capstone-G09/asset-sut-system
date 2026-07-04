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

**ปัญหา:** ถ้า user เปิด URL confirm โดยตรงโดยไม่ผ่านหน้า calendar จะไม่มี draft ใน sessionStorage หน้าจะแสดงข้อมูลว่างเปล่าเงียบๆ โดยไม่มี error หรือ redirect

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
| `features/bookings/components/confirm/DocumentFormModal.tsx` | Fix #3, #5 |
| `app/bookings/[roomId]/page.tsx` | Fix #6, #7 |
| `app/bookings/[roomId]/confirm/page.tsx` | Fix #6, #7 |
| `features/bookings/hooks/useRoom.ts` *(ใหม่)* | Fix #7 |
