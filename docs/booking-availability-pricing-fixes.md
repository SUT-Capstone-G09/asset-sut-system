# Booking Availability & Pricing — Bug Fixes

**Branch:** `space-availability-check`
**ขอบเขต:** การจอง (booking creation), การเช็คช่วงเวลาว่าง (availability lock), และการคำนวณราคา office/off-peak

ทุกจุดผ่าน `go build` / `go vet -tags=integration` / `go test` (unit tests) และ `tsc --noEmit` แล้ว — ยกเว้น integration test ตัวจริง (`booking_concurrency_test.go`) ที่ยังไม่ได้รันเพราะ Docker ปิดอยู่ตอนแก้ (ดูหัวข้อสุดท้าย)

---

## แก้แล้ว

### Fix #1 — ราคาห้องผิดเพราะ timezone ไม่ตรงกัน (critical, กระทบรายได้)

**ไฟล์:** `apps/frontend/src/features/bookings/components/confirm/BookingConfirmView.tsx`, `apps/frontend/src/features/booking/hooks/useBookingFilters.ts`, `apps/backend/internal/services/booking.go`

**ปัญหา:** ฝั่ง frontend สร้างเวลาแบบ `new Date(...).toISOString()` ซึ่งตีความ string ว่าเป็นเวลา local ของ browser แล้วแปลงเป็น UTC ก่อนส่งไป backend แต่ backend เทียบ `Hour()`/`Minute()` ตรงๆ เพื่อตัดสินว่าเป็นช่วง office hours (08:30–16:30) หรือ off-peak — ผลคือจอง 09:00 เวลาไทย กลายเป็น 02:00 ที่ backend เห็น เลยคิดราคาผิดเป็น off-peak เกือบทุกการจอง

**การแก้:** เปลี่ยนให้ frontend ส่งเวลาพร้อม offset `+07:00` ตรงๆ แทนการพึ่งพา `toISOString()` ของ browser ทั้งสองจุดที่สร้าง booking (หน้า confirm ปกติ และอีกจุดที่เจอเพิ่มตอนแก้ ซึ่งไม่ได้อยู่ใน diff เดิมของ branch นี้)

### Fix #2 — Off-peak tier ราคา 0 บาท โดยไม่ตั้งใจ (critical, กระทบรายได้)

**ไฟล์:** `apps/frontend/src/features/booking/services/locationService.ts`

**ปัญหา:** ฟอร์มห้อง/โถง default ค่า off-peak rate เป็น 0 เสมอ (ไม่ใช่ "ไม่ได้กรอก") ทำให้ `savePricingTiers` สร้าง tier ราคา 0 ให้ทุกห้องโดยอัตโนมัติ ซึ่งไปทับ logic fallback ของ backend ที่ตั้งใจไว้ว่า "ถ้าไม่มี off-peak tier ให้คิดราคาปกติแทน" —ผลคือทุกห้องที่ไม่เคยตั้ง off-peak rate จริงจัง จะคิดราคา ฿0 สำหรับเวลานอกช่วง office hours

**การแก้:** สร้าง off-peak tier เฉพาะตอนที่แอดมินตั้งราคาไว้จริง (> 0) เท่านั้น — ห้องที่ไม่ได้ตั้งจะไม่มี tier แล้วกลับไปใช้ fallback ตามที่ตั้งใจไว้เดิม

### Fix #3 — `isRatesConfigured` ไม่รวม off-peak fields

**ไฟล์:** `apps/frontend/src/features/booking/components/rooms/forms/RoomFormFields.tsx`, `apps/frontend/src/features/halls/components/admin/forms/HallFormFields.tsx`

**ปัญหา:** ห้อง/โถงที่ตั้งเฉพาะราคา off-peak (ราคาอื่นเป็น 0 หมด) จะโชว์ในหน้าแอดมินว่า "ยังไม่ตั้งราคา" ทั้งที่มีการตั้งค่าจริง

**การแก้:** เพิ่มเงื่อนไขตรวจ off-peak fields เข้าไปในเช็คด้วย

### Fix #4 — เช็คห้องว่างข้ามวันผิด (cross-date false positive)

**ไฟล์:** `apps/backend/internal/repositories/timeslot.go`

**ปัญหา:** query เช็คห้องว่าง (`LockOverlapping`) เทียบแค่ `start_time`/`end_time` (เก็บเป็น column แบบ `time` — เวลาอย่างเดียว ไม่มีวันที่) โดยไม่เช็ค `date` เลย ทำให้การจอง 10:00–12:00 วันที่ 1 ส.ค. กับการจอง 10:00–12:00 วันที่ 15 ก.ย. (คนละวันกันเลย) ถูกมองว่า "ชนกัน" ทั้งที่ไม่เกี่ยวข้องกัน — ปฏิเสธการจองที่ถูกต้องโดยไม่จำเป็น

**การแก้:** เพิ่มเงื่อนไข `date = ?` เข้าไปใน query ด้วย พร้อมลบ `IsSlotTaken` (โค้ดเก่าที่ไม่มีใครเรียกใช้แล้ว แต่มีบั๊กเดียวกันซ้ำอยู่)

### Fix #5 — จองช่วงเวลาทับกันเองในคำขอเดียวกันหลุดผ่านได้

**ไฟล์:** `apps/backend/internal/services/booking.go`

**ปัญหา:** ระบบเช็คห้องว่างโดยเทียบกับข้อมูลใน DB เท่านั้น แต่ถ้าผู้ใช้ส่ง timeslot 2 ช่วงที่ทับกันเองมาในคำขอเดียวกัน (เช่น 10:00–12:00 กับ 11:00–13:00 ห้องเดียวกัน) ทั้งคู่จะผ่านเพราะยังไม่มีอันไหนอยู่ใน DB ตอนเช็ค — สร้างการจองที่ทับกันเองสำเร็จ

**การแก้:** เพิ่มการเช็คทับกันเองระหว่าง timeslot ในคำขอเดียวกัน (ไม่ใช่แค่เทียบกับ DB)

### Fix #6 — ราคา full-day ไม่สม่ำเสมอกับกรณี > 4 ชั่วโมง

**ไฟล์:** `apps/backend/internal/services/booking.go`

**ปัญหา:** การหาราคาสำหรับ full-day booking กับการจอง > 4 ชั่วโมง ใช้ logic คนละแบบ — full-day เช็คแค่ requester type ตรงเป๊ะเท่านั้น (ไม่มี fallback) ส่วน >4 ชม. มี fallback ไปใช้ tier ของ requester type อื่นถ้าไม่มี tier ตรงกัน ทำให้การจองเต็มวันของ admin (ไม่มี requester type ตรง) เผลอตกไปคิดราคาแบบรายชั่วโมงแทนราคาเหมาแบบเต็มวัน

**การแก้:** ให้ full-day branch ใช้ helper function เดียวกัน (`findTierPrice`) แบบเดียวกับกรณี > 4 ชม.

---

## ยังไม่ได้แก้ / ต้องแก้ต่อ

รายการนี้เป็น bug/risk ที่เจอระหว่างรีวิว แต่ยังไม่ได้แก้ในรอบนี้ เพราะ severity ต่ำกว่า หรือต้องตัดสินใจเชิง design ก่อน:

### 1. Hardcode `rate_type_id: 4` สำหรับ off-peak tier

**ไฟล์:** `apps/frontend/src/features/booking/services/locationService.ts`

ค่านี้อ้างอิงจากลำดับการ seed ข้อมูล (`apps/backend/cmd/init-db/seed_data/lookup_tables.go`) ไม่ได้ query จริงจาก backend — ถ้าลำดับ seed เปลี่ยน หรือ DB มีข้อมูลเดิมอยู่ก่อนในลำดับต่างกัน จะเขียนราคาผิด rate type แบบเงียบๆ **วิธีแก้ที่ถูกต้อง:** ต้องเพิ่ม backend endpoint `GET /rate-types` แล้วให้ frontend query id จากชื่อ แทนการ hardcode ตัวเลข (ยังไม่มี endpoint นี้อยู่จริง — เป็นงานเพิ่มฟีเจอร์ ไม่ใช่แค่ bug fix)

### 2. ช่อง input off-peak rate โชว์ค่า 0 เป็นค่าว่าง

**ไฟล์:** `apps/frontend/src/features/booking/components/rooms/RoomRateModal.tsx`

`value={rates.hourlyOffPeakInternal || ""}` ทำให้ถ้าแอดมินตั้งราคาเป็น 0 จริงๆ (ตั้งใจให้ฟรี) ช่องจะโชว์ว่าง ดูเหมือนยังไม่ได้กรอก — เป็น pattern เดิมที่มีอยู่ทุกช่อง rate ในไฟล์นี้อยู่แล้ว (ไม่ใช่บั๊กใหม่จาก branch นี้) ควรแก้เป็น `?? ""` ทั้งไฟล์พร้อมกันทีเดียว

### 3. ราคา preview กับราคาจริงไม่ตรงกันในกรณีเวลาที่กลับด้าน

**ไฟล์:** `apps/frontend/src/features/bookings/utils/pricing.ts` vs `apps/backend/internal/services/booking.go`

ถ้า end time ไม่มากกว่า start time (edge case ผิดปกติ) frontend โชว์ราคา ฿0 แต่ backend คิดราคาเต็มชั่วโมงแทน — โอกาสเกิดจริงต่ำ แต่ควรทำให้ logic ตรงกัน

### 4. ตัวแปร repo ใน `BookingService` เป็น dead code ที่ซ่อนความเสี่ยง

**ไฟล์:** `apps/backend/internal/services/booking.go`

`s.timeslotRepo`, `s.locationRepo`, `s.requesterRepo` ไม่ได้ใช้แล้วเพราะ `Create()` สร้าง repo ใหม่ผูกกับ transaction เอง (ตัวแปรชื่อซ้ำกันซ้อนทับ/shadow กันอยู่) ถ้าใครแก้โค้ดแล้วพิมพ์ผิดไปเรียก `s.xxxRepo` แทนตัวแปร local จะ compile ผ่านแต่ทำงานนอก transaction เงียบๆ ควรลบ field ที่ไม่ใช้ออก หรือเปลี่ยนชื่อตัวแปร local ให้ไม่ชนกัน

### 5. Integration test ยังไม่ได้รันจริง

**ไฟล์:** `apps/backend/internal/services/booking_concurrency_test.go`

โค้ดผ่าน `go vet -tags=integration` แล้ว (compile ถูกต้อง) แต่ยังไม่ได้รันจริงกับ Postgres เพราะ Docker ปิดอยู่ตอนแก้ — ควรรันก่อน merge เข้า `dev` เพราะ test นี้ทดสอบ concurrency lock ที่เกี่ยวกับ Fix #4/#5 โดยตรง:

```bash
cd apps/backend
docker compose -f docker-compose.test.yml up -d --wait
go test -tags=integration ./internal/services/... -run TestBookingCreate_Concurrent -v
docker compose -f docker-compose.test.yml down -v
```
