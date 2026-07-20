# Space Rental Index — Advanced Filter & Architecture Documentation

## ภาพรวมสถาปัตยกรรมระบบตัวกรอง (Filter Architecture)

ระบบตัวกรองของพื้นที่เช่าพาณิชย์ (`/admin/space-rental`) ถูกออกแบบใหม่ด้วยสถาปัตยกรรม **Hybrid Controlled/Uncontrolled Controller Pattern (URL-driven Single Source of Truth)** 

```
                       [ URL Search Params ]
                     (Single Source of Truth)
                            /       \
              (อ่าน/เขียน URL)     (อ่าน URL)
                          /           \
               <AreaFilters />      <SpaceRentalIndexView />
           (Self-contained Controller)   (View Result Layer)
```

| โหมด | ตัวกรอง | พฤติกรรมและผลลัพธ์ |
|---|---|---|
| **Building View Mode** | ไม่มีตัวกรอง หรือกรองเฉพาะกลุ่มอาคาร (`type`) | แสดงผลเป็น **BuildingCard Grid** รวมกลุ่มตามอาคาร |
| **Space View Mode** | เลือกอาคารเจาะจง (`building`), ประเภทธุรกิจ (`businessType`), หรือ สถานะ (`status`) | สลับเป็น **SpaceCard Flat List** แสดงยูนิตย่อยทั้งหมดที่ตรงเงื่อนไขข้ามอาคาร |

---

## 12 ประเภทธุรกิจเชิงพาณิชย์ (Business Categories)

ระบบรองรับหมวดหมู่ผู้ประกอบการและประเภทพื้นที่เช่ารวม **12 ประเภท** (11 ประเภทตามข้อกำหนดของมหาวิทยาลัย + 1 หมวดอื่นๆ):

```ts
export type CommercialCategoryType = 
  | 'fresh_coffee_beverage_snacks'   // 1. กาแฟสด เครื่องดื่ม อาหารว่าง (Coffee)
  | 'convenience_store_minimart'     // 2. ร้านสะดวกซื้อ/มินิมาร์ท (ShoppingBag)
  | 'vending_machine'                // 3. ตู้จำหน่ายสินค้าอัตโนมัติ (Box)
  | 'washing_machine_service'        // 4. ให้บริการเครื่องซักผ้าอัตโนมัติ (Shirt)
  | 'atm_service'                    // 5. ให้บริการติดตั้งตู้ ATM (CreditCard)
  | 'telecom_network'                // 6. เครือข่ายโทรคมนาคม (Radio)
  | 'it_equipment_sales'             // 7. จำหน่ายอุปกรณ์ IT (Monitor)
  | 'billboard_media'                // 8. ป้ายและสื่อประชาสัมพันธ์ (Tv)
  | 'printing_document_service'      // 9. เครื่องพิมพ์เอกสาร (Printer)
  | 'space_usage'                    // 10. ใช้พื้นที่ (MapPin)
  | 'canteen'                        // 11. โรงอาหาร (Utensils)
  | 'other';                         // 12. อื่นๆ (Building2)
```

---

## Use Cases & Component Interactions

### UC-1: Filter by Building (กรองตามอาคาร)
- **Trigger:** เลือก dropdown "อาคาร" (เช่น โรงอาหารพราวแสดทอง)
- **Flow:** ระบบอัปเดต URL `?building=1` สลับเข้าสู่ **Space View Mode** แสดงรายการยูนิตย่อย 15 สตอลล์ภายในอาคารนั้นทันที

### UC-2: Filter by Business Type (กรองตามประเภทธุรกิจ)
- **Trigger:** เลือก dropdown "ประเภทธุรกิจ" (เช่น กาแฟสด เครื่องดื่ม อาหารว่าง)
- **Flow:** ระบบอัปเดต URL `?businessType=fresh_coffee_beverage_snacks` สลับเข้าสู่ **Space View Mode** แสดงพื้นที่เช่าของทุกอาคารที่มีหมวดหมู่นี้

### UC-3: Filter by Status (กรองตามสถานะพื้นที่)
- **Trigger:** เลือก dropdown "สถานะ" (เช่น ว่างอยู่ `available`)
- **Flow:** ระบบอัปเดต URL `?status=available` สลับเข้าสู่ **Space View Mode** แสดงเฉพาะยูนิตย่อยที่ว่างข้ามทุกอาคาร

---

## การออกแบบ Clean Code & Performance

### 1. `AreaFilters.tsx` (Smart Default Controller)
- ถูกปรับให้ใช้งานบนหน้าหลักแบบ **0 Props** (`<AreaFilters />`) อ่าน/เขียน State ผ่าน URL ชนิดไร้ Prop Drilling
- รองรับ Optional Props (`props.field ?? dashboard.field`) เพื่อให้ Unit Test และ Modal อื่นสามารถส่ง Controlled Props เข้ามา override ได้ทันทีโดยไม่กระทบ URL

### 2. `stall-resolver.ts` (Centralized Utility)
- รวมศูนย์ฟังก์ชันแตกแผงลอยย่อย `resolveBuildingStallSpaces(buildingId, buildingName)` จาก Floor Plan canvas
- รวมศูนย์ฟังก์ชันแปลงข้อความสัญญาเป็นหมวดหมู่ `mapBusinessCategoryName(name)` 
- รวมศูนย์ฟังก์ชันค้นหา `matchSpaceSearch(space, query)`

### 3. Breadcrumb Route Sanitization (`Breadcrumb.tsx`)
- เพิ่มการกรองข้าม segment `'building'` และ `'type'` จาก URL และ `sessionStorage` เพื่อป้องกันการเกิดลิงก์ Breadcrumb ลอยๆ บนเส้นทางที่ไม่มีหน้าเพจอยู่จริง (`/admin/space-rental/building` และ `/admin/space-rental/type`)

---

## โครงสร้างไฟล์หลักในโมดูล

| ไฟล์ | หน้าที่และความรับผิดชอบ |
|---|---|
| [`useAreasDashboard.ts`](../../apps/frontend/src/features/space-rental/hooks/useAreasDashboard.ts) | State management หลัก อ่าน URL Search Params คำนวณ visibleSpaces & visibleCards |
| [`SpaceFilters.tsx`](../../apps/frontend/src/features/space-rental/components/rental-space/SpaceFilters.tsx) | Smart Controller Component แสดงผลและควบคุม Search Bar & Filter Dropdowns |
| [`SpaceRentalIndexView.tsx`](../../apps/frontend/src/features/space-rental/components/rental-space/SpaceRentalIndexView.tsx) | View Composition ประจำหน้า Index (เรียก `<AreaFilters />` 0 props) |
| [`stall-resolver.ts`](../../apps/frontend/src/features/space-rental/utils/stall-resolver.ts) | Centralized Stall Resolver & Search Matcher |
| [`constants/index.ts`](../../apps/frontend/src/features/space-rental/constants/index.ts) | `COMMERCIAL_CATEGORIES` (12 ประเภท) & `DEFAULT_RENTAL_SPACE_CONFIG` |
| [`Breadcrumb.tsx`](../../apps/frontend/src/components/layout/Breadcrumb.tsx) | Dynamic Breadcrumb Navigation พร้อม Route Sanitization |
