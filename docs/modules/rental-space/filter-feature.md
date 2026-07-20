# Space Rental Index — Advanced Filter Feature

## ภาพรวม

หน้า `/admin/space-rental` ต้องการระบบ filter 2 โหมดที่ทำงานต่างกันโดยพื้นฐาน:

| โหมด | ตัวกรอง | ผลลัพธ์ |
|---|---|---|
| **Filter by Building** | เลือกอาคารหรือประเภทอาคาร | แสดงพื้นที่ภายในอาคารนั้น |
| **Filter by Business Type** | เลือกประเภทธุรกิจ | แสดงพื้นที่ทุกแห่งที่มี business type นั้น ข้ามอาคาร |

---

## Use Cases

### UC-1: Filter by Building (กรองตามอาคาร)

**Actor:** Admin  
**เป้าหมาย:** ดูพื้นที่ย่อยทั้งหมดในอาคารหรือกลุ่มอาคารที่สนใจ

**Trigger:** Admin เปิด dropdown "อาคาร" แล้วเลือกรายการ

**Flow:**
1. Admin เลือกอาคาร เช่น "โรงอาหารพราวแสดทอง"
2. ระบบสลับเข้าสู่ **Space View Mode** ทันทีในหน้าเดิม
3. แสดงรายการ **การ์ดพื้นที่เช่าย่อย (SpaceCard)** ทั้งหมดของอาคารนั้นทันที (ไม่ต้องคลิกการ์ดอาคารซ้ำ)
4. Admin กด "ล้างตัวกรอง" → กลับสู่การแสดงผลปกติ (Building Cards Grid)

**Variants:**
- เลือกประเภทอาคาร เช่น "โรงอาหาร" → แสดงทุก BuildingCard ในกลุ่มโรงอาหาร
- เลือกอาคารเดี่ยว เช่น "โรงอาหารพราวแสดทอง" → ดึง `SpaceCard` ของตึกนั้นขึ้นมาแสดงทันที

**Data Source:** `RentalSpace.building` / `RentalSpace.id`

---

### UC-2: Filter by Business Type (กรองตามประเภทธุรกิจ ข้ามอาคาร)

**Actor:** Admin  
**เป้าหมาย:** ค้นหาพื้นที่ที่มีผู้ประกอบธุรกิจประเภทหนึ่ง โดยไม่สนว่าอยู่อาคารไหน

**Trigger:** Admin เปิด dropdown "ประเภทธุรกิจ" แล้วเลือกรายการ

**Flow:**
1. Admin เลือก business type เช่น "อาหารและเครื่องดื่ม"
2. ระบบเปลี่ยนโหมดการแสดงผล จาก **BuildingCard grid** → **SpaceCard flat list**
3. แสดงพื้นที่ทุกรายการที่มี `locationCategory` หรือ `area` ตรงกับ business type ที่เลือก
4. แต่ละ SpaceCard แสดง badge ชื่ออาคารต้นสังกัดด้วย
5. Admin กด "ล้างตัวกรอง" → กลับสู่ BuildingCard grid ปกติ

**Data Source:** `RentalSpace.locationCategory[]` หรือ `RentalSpace.area`

---

### UC-3: ใช้ Filter ร่วมกัน (Combined Filter)

**Flow:**
- Filter by Building + Search: แสดงพื้นที่ในอาคารนั้น แล้วค้นชื่อเพิ่ม
- Filter by Business Type + Search: แสดง business type นั้น แล้วค้นชื่อเพิ่ม
- Building Filter + Business Type Filter พร้อมกัน: **ไม่รองรับ** (mutual exclusive) — ถ้าเลือก Business Type จะ reset Building filter อัตโนมัติ และในทางกลับกัน

---

## การเปลี่ยนแปลง UI ตาม Mode

### Default Mode (ไม่มี filter หรือ filter by building)
```
┌─────────────────────────────────────────┐
│  [Search] [Building ▼] [Status ▼]       │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐             │
│  │โรงอาหาร │  │ อาคารเรียน│            │
│  │  6 ยูนิต │  │  2 ยูนิต │            │
│  └──────────┘  └──────────┘             │
└─────────────────────────────────────────┘
```

### Business Type Mode (เมื่อเลือก business type)
```
┌─────────────────────────────────────────┐
│  [Search] [Business Type ▼] [Status ▼]  │
│   กรองตาม "อาหารและเครื่องดื่ม" (3)   │
├─────────────────────────────────────────┤
│  ┌────────────────────────────────────┐ │
│  │ กาแฟพันธุ์ไทย    [อาคารเรียนรวม 1]│ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ ร้านอาหาร A01     [โรงอาหารพราวฯ] │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## การเปลี่ยนแปลงที่ต้องทำ

### 1. `SpaceFilters.tsx` (UI Component)
- เพิ่ม dropdown **"ประเภทธุรกิจ"** (Business Type) แยกจาก dropdown ประเภทอาคาร
- ใช้ค่าจาก `AREA_CATEGORIES` (อาหารและเครื่องดื่ม, ร้านค้าและบริการ, ฯลฯ)
- เมื่อเลือก business type → reset building type filter อัตโนมัติ

### 2. `useAreasDashboard.ts` (Hook)
- เพิ่ม state: `selectedBusinessTypeFilter`
- เพิ่ม logic ใน `visibleCards`:
  - ถ้า `selectedBusinessTypeFilter !== "all"` → เปลี่ยนเป็น flat list mode
  - filter `mockLocations` ตาม `locationCategory` ที่ตรงกัน
- เพิ่ม return: `selectedBusinessTypeFilter`, `setSelectedBusinessTypeFilter`, `isBusinessTypeMode`

### 3. `SpaceRentalIndexView.tsx` (View)
- เพิ่ม prop ไปยัง `<AreaFilters />`
- เพิ่ม conditional rendering:
  - ถ้า `isBusinessTypeMode === true` → render `SpaceCard flat list` แทน `BuildingCard grid`
  - แสดง result count + reset button

---

## Business Type Mapping

```ts
// locationCategory ใน RentalSpace → Label ที่แสดงใน filter
const BUSINESS_TYPE_LABELS: Record<CommercialCategoryType, string> = {
  food_beverage:       "อาหารและเครื่องดื่ม",
  retail_services:     "ร้านค้าและบริการ",
  automated_services:  "บริการตู้อัตโนมัติ",
  wireless_connectivity: "อินเทอร์เน็ตไร้สาย",
};
```

---

## ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | หน้าที่ |
|---|---|
| [`useAreasDashboard.ts`](../hooks/useAreasDashboard.ts) | State management + filter logic |
| [`SpaceFilters.tsx`](./SpaceFilters.tsx) | UI Filter bar |
| [`SpaceRentalIndexView.tsx`](./SpaceRentalIndexView.tsx) | View composition |
| [`SpaceCard.tsx`](./SpaceCard.tsx) | Card แสดงผล flat list mode |
| [`../constants/index.ts`](../../constants/index.ts) | `AREA_CATEGORIES` constant |
