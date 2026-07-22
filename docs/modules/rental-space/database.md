# Database Design: Rental Space Module

เอกสารนี้ระบุรายละเอียดการออกแบบฐานข้อมูล (Database Schema, Data Dictionary) สำหรับระบบพื้นที่เช่า แผนผังอาคาร เลเยอร์ และวัตถุบนแผนที่ โดยอ้างอิงตรงตามโมเดุล GORM Model ในระบบโครงการจริง

## Data Dictionary (โครงสร้างตารางหลัก)

### 1. `rental_spaces` (ตารางเก็บข้อมูลพื้นที่เช่า)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `integer` | PK, Serial | รหัสไอดีพื้นที่เช่า |
| `building_id` | `integer` | FK (buildings.id), Nullable | รหัสอาคารที่สังกัดอยู่ |
| `name` | `varchar(255)`| Not Null | ชื่อพื้นที่เช่า (เช่น Room A101) |
| `description` | `text` | Nullable | รายละเอียดคำอธิบายพื้นที่เช่า |
| `size` | `varchar(255)`| Nullable | ขนาดพื้นที่ (เช่น "50 sqm") |
| `area_code` | `varchar(255)`| Unique, Nullable | รหัสระบุโซน/รหัสพื้นที่ (เช่น "A-101") |
| `base_price` | `decimal(12,2)`| Nullable | ราคาเริ่มต้นของพื้นที่เช่า |
| `status` | `varchar(255)`| Not Null, Default `'vacant'`| สถานะการเช่า (เช่น `'vacant'`) |
| `created_at` | `timestamp` | | วันเวลาที่บันทึกข้อมูล |
| `updated_at` | `timestamp` | | วันเวลาที่อัปเดตข้อมูลล่าสุด |

### 2. `rental_space_images` (ตารางเก็บรูปภาพของพื้นที่เช่า)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `integer` | PK, Serial | รหัสรูปภาพ |
| `rental_space_id`| `integer`| FK (rental_spaces.id), Not Null| รหัสพื้นที่เช่าที่รูปภาพนี้สังกัดอยู่ |
| `url` | `text` | Not Null | ที่อยู่ URL ของรูปภาพ |
| `alt_text` | `text` | Nullable | ข้อความอธิบายรูปภาพ |
| `is_primary` | `boolean` | Not Null, Default `false`| เป็นรูปภาพหลักหรือไม่ |
| `sort_order` | `integer` | Not Null, Default `0`| ลำดับการเรียงรูปภาพ |

### 3. `rental_space_tags` (ตารางเก็บ Tag ของพื้นที่เช่า)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `rental_space_id`| `integer`| PK, FK (rental_spaces.id) | รหัสพื้นที่เช่า |
| `tag` | `varchar(255)`| PK | คำค้นหา/ป้ายระบุลักษณะพื้นที่ |

### 4. `floor_plans` (ตารางเก็บข้อมูลแผนผังอาคาร)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, Not Null | รหัสประจำแผนผัง (UUID) |
| `building_id` | `integer` | FK (buildings.id), Not Null, UniqueIndex | รหัสสิ่งปลูกสร้าง (ตึก) |
| `floor_number`| `integer` | Not Null, Default `1`, UniqueIndex | เลขชั้นของแผนผัง |
| `name` | `varchar(255)`| Not Null | ชื่อแผนผัง (เช่น "1st Floor Plan") |
| `width` | `integer` | Not Null | ความกว้างของภาพแผนผัง (พิกเซล) |
| `height` | `integer` | Not Null | ความสูงของภาพแผนผัง (พิกเซล) |
| `created_at` | `timestamp` | | วันเวลาที่บันทึกข้อมูล |
| `updated_at` | `timestamp` | | วันเวลาที่อัปเดตข้อมูลล่าสุด |

### 5. `map_layers` (ตารางเลเยอร์บนแผนผังอาคาร)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, Not Null | รหัสประจำเลเยอร์ (UUID) |
| `floor_plan_id`| `uuid` | FK (floor_plans.id), Not Null | รหัสแผนผังประจำเลเยอร์ |
| `name` | `varchar(255)`| Not Null | ชื่อเลเยอร์ (เช่น "Offices Layer") |
| `visible` | `boolean` | Not Null, Default `true` | การเปิด/ปิดการแสดงผล |
| `locked` | `boolean` | Not Null, Default `false`| การล็อกเลเยอร์เพื่อไม่ให้ขยับ |
| `color` | `varchar(255)`| Not Null | สีธีมหรือสีระบุกลุ่มของเลเยอร์ |

### 6. `map_elements` (ตารางวัตถุสิ่งของ/ร้านค้าที่วาดลงบนแผนผัง)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, Not Null | รหัสประจำวัตถุ (UUID) |
| `layer_id` | `uuid` | FK (map_layers.id), Not Null, Index | รหัสเลเยอร์ที่วัตถุนี้สังกัดอยู่ |
| `rental_space_id`| `integer`| FK (rental_spaces.id), Nullable | รหัสพื้นที่เช่าที่จับคู่ไว้ (ถ้ามี) |
| `canvas_element_id`| `varchar(255)`| Not Null | รหัส ID ของวัตถุบนตัววาด Canvas ของ Frontend |
| `name` | `varchar(100)`| Not Null | ชื่อวัตถุ (เช่น "Office 101 Rect") |
| `type` | `varchar(20)` | Not Null | รูปทรงของวัตถุ (เช่น `rect`, `polygon`) |
| `area_type` | `varchar(255)`| Nullable | ประเภทพื้นที่การจัดสรร |
| `custom_area_type`| `varchar(255)`| Nullable | ประเภทพื้นที่กำหนดเอง |
| `status` | `varchar(20)` | Not Null, Default `'open'` | สถานะวัตถุ (เช่น `'open'`) |
| `x` | `double precision`| Not Null | พิกัดแกน X |
| `y` | `double precision`| Not Null | พิกัดแกน Y |
| `width` | `double precision`| Not Null | ความกว้างวัตถุ |
| `height` | `double precision`| Not Null | ความสูงวัตถุ |
| `rotation` | `double precision`| Not Null, Default `0` | มุมองศาในการหมุนวัตถุ |
| `zone` | `varchar(255)`| Nullable | โซนจัดวาง |
| `tenant` | `varchar(255)`| Nullable | ชื่อผู้เช่าที่เกี่ยวข้อง |
| `description` | `text` | Nullable | คำอธิบายรายละเอียดวัตถุ |
| `tags` | `json` | Nullable | แท็กระบุลักษณะวัตถุในรูปแบบ JSON Array |
