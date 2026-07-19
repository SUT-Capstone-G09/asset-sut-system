# เอกสารคู่มือ API: ระบบพื้นที่เช่า แผนผังอาคาร และเลเยอร์แผนที่

เอกสารนี้อธิบายข้อกำหนดการใช้งาน API สำหรับโมดูลพื้นที่เช่า (Rental Spaces), แผนผังอาคาร (Floor Plans), เลเยอร์แผนที่ (Map Layers) และวัตถุบนแผนที่ (Map Elements)

## 1. API ระบบพื้นที่เช่า (Rental Spaces)

### ดึงข้อมูลรายการพื้นที่เช่าทั้งหมด
ดึงข้อมูลพื้นที่เช่าทั้งหมด พร้อมตัวเลือกในการกรองข้อมูลค้นหา

* **URL:** `/api/v1/rental-spaces`
* **Method:** `GET`
* **Auth Required:** Optional
* **Query Parameters:**
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `building_id` | `integer` | No | GORM Query Parameter สำหรับรหัสสิ่งปลูกสร้าง (ตึก) |
  | `status` | `string` | No | กรองตามสถานะ (`available`, `occupied`, `maintenance`) |
  | `keyword` | `string` | No | ค้นหาจากชื่อ คำอธิบาย หรือรหัสพื้นที่ |
  | `min_price` | `number` | No | กรองพื้นที่ที่ราคาเริ่มต้นมากกว่าหรือเท่ากับค่านี้ |
  | `max_price` | `number` | No | กรองพื้นที่ที่ราคาเริ่มต้นน้อยกว่าหรือเท่ากับค่านี้ |

* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "building_id": 2,
        "building_name": "Building A",
        "name": "Room A101",
        "description": "Premium corner office space",
        "size": "50 sqm",
        "area_code": "A-101",
        "base_price": 15000.00,
        "status": "available",
        "images": [
          {
            "id": 5,
            "url": "https://example.com/image1.jpg",
            "alt_text": "Room View",
            "is_primary": true,
            "sort_order": 1
          }
        ],
        "tags": ["Corner", "Window"],
        "created_at": "2026-07-19T10:00:00Z",
        "updated_at": "2026-07-19T10:30:00Z"
      }
    ]
  }
  ```

---

### ดึงข้อมูลพื้นที่เช่าตาม ID
* **URL:** `/api/v1/rental-spaces/:id`
* **Method:** `GET`
* **Auth Required:** Optional
* **Response (200 OK):** Same single object payload as listed in the array above.
* **Response (404 Not Found):**
  ```json
  {
    "success": false,
    "error": "rental space not found"
  }
  ```

---

### สร้างพื้นที่เช่าใหม่
* **URL:** `/api/v1/rental-spaces`
* **Method:** `POST`
* **Auth Required:** Yes (Roles: staff, admin)
* **Request Body Example:**
  ```json
  {
    "building_id": 2,
    "name": "Room A102",
    "description": "Standard conference room",
    "size": "30 sqm",
    "area_code": "A-102",
    "base_price": 8000.00,
    "status": "available"
  }
  ```
* **Response (201 Created):** ส่งออบเจกต์พื้นที่เช่าที่สร้างขึ้นใหม่กลับมาใน data envelope

---

### อัปเดตข้อมูลพื้นที่เช่า
แก้ไขข้อมูลบางส่วนของพื้นที่เช่า

* **URL:** `/api/v1/rental-spaces/:id`
* **Method:** `PUT`
* **Auth Required:** Yes (Roles: staff, admin)
* **Request Body Example:**
  ```json
  {
    "name": "Room A102 - Updated",
    "base_price": 9500.00,
    "status": "maintenance"
  }
  ```
* **Response (200 OK):** ส่งออบเจกต์พื้นที่เช่าที่อัปเดตใหม่กลับมา

---

### ลบพื้นที่เช่า
ทำการลบพื้นที่เช่า (Soft-delete)

* **URL:** `/api/v1/rental-spaces/:id`
* **Method:** `DELETE`
* **Auth Required:** Yes (Roles: admin)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "message": "rental space deleted successfully"
    }
  }
  ```

---

## 2. API ระบบแผนผังอาคาร (Floor Plans)

### ดึงข้อมูลรายการแผนผังอาคารทั้งหมด
* **URL:** `/api/v1/buildings/:buildingId/floor-plans`
* **Method:** `GET`
* **Auth Required:** Optional
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "e0b23d92-1c2f-410a-8bfb-c6b7ef9a5bc6",
        "building_id": 2,
        "name": "1st Floor Plan",
        "width": 1200.00,
        "height": 800.00,
        "layers": [],
        "updated_at": "2026-07-19T10:00:00Z"
      }
    ]
  }
  ```

---

### ดึงรายละเอียดแผนผังอาคารตาม ID
ดึงรายละเอียดแผนผังอาคารรวมถึงเลเยอร์และวัตถุทั้งหมดด้านใน

* **URL:** `/api/v1/floor-plans/:id`
* **Method:** `GET`
* **Auth Required:** Optional
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "e0b23d92-1c2f-410a-8bfb-c6b7ef9a5bc6",
      "building_id": 2,
      "name": "1st Floor Plan",
      "width": 1200.00,
      "height": 800.00,
      "layers": [
        {
          "id": "a9a3b8cd-f00e-4361-b4ef-fbc213cd74e2",
          "name": "Offices Layer",
          "visible": true,
          "locked": false,
          "color": "#FF5733",
          "elements": [
            {
              "id": "d2ef5601-52f1-432a-bc82-de5502cdd105",
              "canvas_element_id": "rect-1",
              "rental_space_id": 1,
              "name": "Office 101 Rect",
              "type": "rect",
              "status": "open",
              "x": 150.00,
              "y": 200.00,
              "width": 100.00,
              "height": 120.00,
              "rotation": 0.00
            }
          ]
        }
      ],
      "updated_at": "2026-07-19T10:30:00Z"
    }
  }
  ```

---

### สร้างแผนผังอาคารใหม่
* **URL:** `/api/v1/buildings/:buildingId/floor-plans`
* **Method:** `POST`
* **Auth Required:** Yes (Roles: staff, admin)
* **Request Body Example:**
  ```json
  {
    "name": "1st Floor Map Plan",
    "width": 1000.00,
    "height": 800.00
  }
  ```
* **Response (201 Created):** ส่งออบเจกต์แผนผังอาคารที่สร้างเสร็จกลับมา

---

### อัปเดตข้อมูลแผนผังอาคาร
* **URL:** `/api/v1/floor-plans/:id`
* **Method:** `PUT`
* **Auth Required:** Yes (Roles: staff, admin)
* **Request Body Example:**
  ```json
  {
    "name": "1st Floor Plan - Updated Dimensions",
    "width": 1100.00
  }
  ```
* **Response (200 OK):** ส่งออบเจกต์แผนผังอาคารที่อัปเดตใหม่กลับมา

---

### ลบแผนผังอาคาร
* **URL:** `/api/v1/floor-plans/:id`
* **Method:** `DELETE`
* **Auth Required:** Yes (Roles: admin)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "message": "floor plan deleted successfully"
    }
  }
  ```

---

## 3. API ระบบเลเยอร์แผนที่ (Map Layers)

### สร้างเลเยอร์แผนที่ใหม่
* **URL:** `/api/v1/floor-plans/:floorPlanId/layers`
* **Method:** `POST`
* **Auth Required:** Yes (Roles: staff, admin)
* **Request Body Example:**
  ```json
  {
    "name": "Exhibitions Layer",
    "visible": true,
    "locked": false,
    "color": "#33C3FF"
  }
  ```
* **Response (201 Created):** ส่งออบเจกต์เลเยอร์ที่สร้างเสร็จกลับมา

---

### อัปเดตข้อมูลเลเยอร์แผนที่
* **URL:** `/api/v1/layers/:id`
* **Method:** `PUT`
* **Auth Required:** Yes (Roles: staff, admin)
* **Request Body Example:**
  ```json
  {
    "visible": false,
    "color": "#57FF33"
  }
  ```
* **Response (200 OK):** ส่งออบเจกต์เลเยอร์ที่อัปเดตใหม่กลับมา

---

### ลบเลเยอร์แผนที่
ลบเลเยอร์แผนที่รวมถึงลบวัตถุทั้งหมดด้านในโดยอัตโนมัติ

* **URL:** `/api/v1/layers/:id`
* **Method:** `DELETE`
* **Auth Required:** Yes (Roles: staff, admin)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "message": "map layer deleted successfully"
    }
  }
  ```

---

## 4. API ระบบวัตถุบนแผนที่ (Map Elements)

### สร้างวัตถุบนแผนที่ใหม่
สร้างวัตถุ (เช่น สี่เหลี่ยมหรือโพลิกอน) ภายในเลเยอร์แผนที่

* **URL:** `/api/v1/layers/:layerId/elements`
* **Method:** `POST`
* **Auth Required:** Yes (Roles: staff, admin)
* **Request Body Example:**
  ```json
  {
    "canvas_element_id": "rect-2",
    "rental_space_id": 1,
    "name": "Room A101 Polygon",
    "type": "rect",
    "status": "open",
    "x": 250.00,
    "y": 120.00,
    "width": 80.00,
    "height": 90.00,
    "rotation": 15.00
  }
  ```
* **Response (201 Created):** ส่งออบเจกต์วัตถุบนแผนที่ที่สร้างเสร็จกลับมา

---

### อัปเดตข้อมูลวัตถุบนแผนที่
* **URL:** `/api/v1/elements/:id`
* **Method:** `PUT`
* **Auth Required:** Yes (Roles: staff, admin)
* **Request Body Example:**
  ```json
  {
    "x": 260.00,
    "y": 125.00,
    "rotation": 0.00
  }
  ```
* **Response (200 OK):** ส่งออบเจกต์วัตถุบนแผนที่ที่อัปเดตใหม่กลับมา

---

### ลบวัตถุบนแผนที่
* **URL:** `/api/v1/elements/:id`
* **Method:** `DELETE`
* **Auth Required:** Yes (Roles: staff, admin)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "message": "map element deleted successfully"
    }
  }
  ```
