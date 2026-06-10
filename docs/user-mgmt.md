# User Management & Access Control

เอกสารสรุประบบจัดการผู้ใช้และการควบคุมสิทธิการเข้าถึงของ backend (`apps/backend`)
รวมผลการรีวิวความพร้อมใช้งาน และวิธีตั้งค่า route ใหม่

> อัปเดตล่าสุด: 2026-06-03

---

## 1. ภาพรวมระบบ

### 1.1 Authentication flow
- **Login** (`POST /api/v1/auth/login`) → คืน **access token** (อายุ 15 นาที) ใน response body
  และตั้ง **refresh token** เป็น cookie `refresh_token` (อายุ 7 วัน, `HttpOnly`, path `/api/v1/auth`)
- ทุก request ที่ต้องล็อกอิน แนบ access token ผ่าน header: `Authorization: Bearer <token>`
- **Refresh** (`POST /api/v1/auth/refresh`) → อ่าน refresh cookie แล้วออก token pair ใหม่ (rotation: ลบตัวเก่า สร้างตัวใหม่)
- **Logout** (`POST /api/v1/auth/logout`) → ลบ refresh token ออกจาก DB + เคลียร์ cookie

Refresh token เก็บใน DB เป็น **SHA-256 hash** (ไม่เก็บ token ดิบ) พร้อมวันหมดอายุ

### 1.2 Roles & Permissions
- **Roles**: `admin`, `staff`, `requester` (ความสัมพันธ์ user ↔ role เป็น many2many)
- **Permissions**: รูปแบบ `module:action`
  - modules: `user_mgmt`, `booking`, `payment`, `upload_doc`
  - actions: `create`, `read`, `update`, `delete`
- สิทธิผูกได้ 2 ทาง:
  - **ผ่าน role** (`role_permissions`) — `admin` ถูก seed ให้มีครบทุก permission
  - **ตรงตัว user** (`user_permissions`) — มอบให้รายบุคคล (เช่นให้ staff บางคน)
- `PermissionRepository.UserHasPermission` เช็คทั้งสองทาง: มีสิทธิตรงตัว **หรือ** มีผ่าน role ตัวใดตัวหนึ่ง → ผ่าน

### 1.3 Middleware (`internal/middleware`)
| Middleware | หน้าที่ | ใส่อะไรลง context |
|---|---|---|
| `AuthMiddleware(jwtSecret)` | ตรวจ `Bearer` token, validate signature/expiry, บังคับ `type=access` | `user_id`, `email`, `role` |
| `RequireRole(roles...)` | ผ่านถ้า role ใน token ตรงกับตัวใดตัวหนึ่ง | — |
| `RequirePermission(checker, module, action)` | query DB ว่า user มี permission นั้นไหม | — |

> **สำคัญ:** `RequireRole` / `RequirePermission` ต้องวาง **หลัง** `AuthMiddleware` เสมอ
> เพราะอาศัยค่า `user_id` / `role` ที่ `AuthMiddleware` ใส่ลง context

---

## 2. สรุปงานที่แก้ในรอบนี้ (2026-06-03)

| # | เรื่อง | ไฟล์ | สิ่งที่ทำ |
|---|---|---|---|
| 1 | Deactivate ไม่เพิกถอน session | `repositories/user.go` | `Deactivate` ตั้ง `is_active=false` **และ** ลบ refresh token ทั้งหมดของ user ใน transaction เดียว |
| 2 | Privilege/active ค้างใน refresh | `services/auth.go` | `Refresh` อ่าน user จาก DB ใหม่ → เช็ค `IsActive` (ถ้าถูกปิดบัญชี ลบ token + ปฏิเสธ) และใช้ role ปัจจุบันจาก DB ออก token แทน claim เดิม |
| 3 | RBAC ดูเหมือน dead code | — | ยืนยันว่าเป็น **scaffolding ที่ตั้งใจไว้** ไม่ใช่บั๊ก ทุก route จัดการผู้ใช้ตั้งใจให้ admin-only |
| 4 | JWT secret อ่อน + CORS `*`+credentials | `.env.example`, `config/config.go` | เปลี่ยน JWT secret ตัวอย่างเป็น placeholder; default CORS origin เป็น `http://localhost:3000`; เพิ่ม guard fail-fast ถ้าตั้ง `origins=*` คู่กับ `credentials=true` |

---

## 3. ความพร้อมใช้งาน (Readiness)

### ✅ พร้อมใช้ (development / internal)
- Authentication: JWT + refresh rotation + token hashing — ครบและทำงานถูกต้อง
- การจำกัดสิทธิระดับ role บังคับใช้ที่ฝั่ง server จริง (`RequireRole("admin")` กั้น route จัดการผู้ใช้)
- ParseToken จำกัด signing เป็น HMAC เท่านั้น (กัน `alg:none`)
- ปิดบัญชี/เปลี่ยน role มีผลภายใน ≤15 นาที (รอบ refresh ถัดไป) — ช่องโหว่สิทธิค้างถูกปิดแล้ว

### ⚠️ ต้องทำก่อนขึ้น production (hardening checklist)
- [ ] **`COOKIE_SECURE=true`** เมื่อรันบน HTTPS (ปัจจุบัน default `false` สำหรับ dev)
- [ ] **`JWT_SECRET`** ต้องเป็นค่าสุ่มยาวจริง (`openssl rand -base64 48`) ไม่ใช่ค่าตัวอย่าง
- [ ] **`CORS_ALLOW_ORIGINS`** ระบุ origin จริงของ frontend (ห้าม `*` เพราะใช้ credentials — guard จะ fail ตั้งแต่ startup)
- [ ] กำหนด **`SameSite`** ของ refresh cookie ให้ชัด (ตอนนี้พึ่ง default ของ browser)
- [ ] เพิ่ม **rate limiting** ที่ `/auth/login` (กัน brute force)
- [ ] เพิ่ม **automated tests** สำหรับ auth/permission (ยังไม่มี)

### 📌 ข้อจำกัดที่ควรรู้ (by design / ยังไม่ทำ)
- ระบบ **permission ละเอียด** (`RequirePermission`, `user_permissions`, `AssignPermissions`) เป็น **scaffolding** — ยังไม่ถูกใช้กั้น resource จริง route จัดการผู้ใช้ทั้งหมดบังคับด้วย `RequireRole("admin")` เมื่อจะใช้ permission จริง ควรใช้กับ module ฝั่ง staff (booking/payment/upload_doc)
- รองรับ **1 user = 1 role** เป็นหลัก (`GetUserRole` ใช้ `Roles[0]`) ถ้าจะมีหลาย role ต้องปรับ logic
- การเพิกถอนสิทธิไม่ใช่ real-time แบบ per-request (มีหน้าต่าง ≤15 นาทีตามอายุ access token) — เป็น trade-off ที่ยอมรับได้เพื่อไม่ query DB ทุก request

**สรุป:** พร้อมใช้สำหรับการพัฒนา/ใช้งานภายใน ส่วนการขึ้น production ให้ทำตาม hardening checklist ด้านบนก่อน

---

## 4. วิธีตั้งค่า Route ใหม่

### 4.1 โครงสร้างไฟล์
```
internal/routes/
├── routes.go       # SetupRoutes — รวม group ทั้งหมดไว้ใต้ /api/v1
├── auth.go         # public (login/register/refresh/logout)
├── protected.go    # ต้องล็อกอิน (ทุก role)
├── admin.go        # admin-only (จัดการผู้ใช้/role/permission)
└── demo.go         # ตัวอย่าง/ทดสอบ permission
```

route ใหม่ทุกอันต้องถูก register ผ่านฟังก์ชัน `SetupXxxRoutes(rg, deps)` ที่ถูกเรียกใน `routes.go`:
```go
// routes.go
v1 := router.Group("/api/v1")
{
    SetupAuthRoutes(v1, deps)
    SetupProtectedRoutes(v1, deps)
    SetupAdminRoutes(v1, deps)
    SetupDemoRoutes(v1, deps)
}
```

### 4.2 เลือกระดับการป้องกันให้ถูก

| ต้องการ | ใส่ middleware | ตัวอย่างที่มีอยู่ |
|---|---|---|
| ใครก็เรียกได้ (public) | — | `auth.go` |
| ล็อกอินก็พอ (role ใดก็ได้) | `AuthMiddleware` | `protected.go` → `/me` |
| เฉพาะบาง role | `AuthMiddleware` + `RequireRole(...)` | `admin.go`, `protected.go` → `/me/admin` |
| เฉพาะคนที่มี permission | `AuthMiddleware` + `RequirePermission(...)` | `demo.go` → `/demo/booking` |

**HTTP verb → action ที่แนะนำให้ map** (ถ้าใช้ permission):
`GET → read`, `POST → create`, `PUT/PATCH → update`, `DELETE → delete`

### 4.3 ตัวอย่าง: เพิ่ม module ใหม่ (เช่น `booking`) แบบ permission-gated

สร้างไฟล์ `internal/routes/booking.go`:
```go
package routes

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupBookingRoutes(rg *gin.RouterGroup, deps *Dependencies) {
	secret := deps.Config.JWT.Secret
	pc := deps.PermissionChecker

	booking := rg.Group("/bookings")
	booking.Use(middleware.AuthMiddleware(secret)) // ต้องล็อกอินก่อน
	{
		booking.GET("",
			middleware.RequirePermission(pc, "booking", "read"),
			deps.BookingController.GetAll)

		booking.POST("",
			middleware.RequirePermission(pc, "booking", "create"),
			deps.BookingController.Create)

		booking.DELETE("/:id",
			middleware.RequirePermission(pc, "booking", "delete"),
			deps.BookingController.Delete)
	}
}
```

จากนั้น register ใน `routes.go`:
```go
v1 := router.Group("/api/v1")
{
    // ...
    SetupBookingRoutes(v1, deps)   // <- เพิ่มบรรทัดนี้
}
```

> **หมายเหตุ:** `admin` มี permission ครบทุกตัวจาก seed อยู่แล้ว → admin ผ่าน route แบบ permission-gated โดยอัตโนมัติ ไม่ต้อง special-case

### 4.4 ถ้า controller เป็นของใหม่ ต้อง wire เพิ่ม 2 จุด

**(ก)** เพิ่ม field ใน `Dependencies` (`routes.go`):
```go
type Dependencies struct {
	// ...
	BookingController *controllers.BookingController
}
```

**(ข)** สร้าง repo/service/controller แล้วใส่ลง `Dependencies` ใน `cmd/serve/main.go`:
```go
bookingCtrl := controllers.NewBookingController(bookingService)

routes.SetupRoutes(r, &routes.Dependencies{
	// ...
	BookingController: bookingCtrl,
})
```

### 4.5 การตอบกลับใน handler (ใช้ helper จาก `internal/pkg/response`)
```go
response.OK(ctx, data)             // 200
response.Created(ctx, data)        // 201
response.BadRequest(ctx, msg)      // 400
response.Unauthorized(ctx, msg)    // 401
response.Forbidden(ctx, msg)       // 403
response.NotFound(ctx, msg)        // 404
response.InternalError(ctx, msg)   // 500
```
ค่าผู้ใช้ที่ดึงได้ใน handler หลังผ่าน `AuthMiddleware`:
```go
userID := ctx.GetUint("user_id")
email  := ctx.GetString("email")
role   := ctx.GetString("role")
```

### 4.6 Checklist เพิ่ม route ใหม่
1. [ ] เลือกระดับการป้องกัน (public / authenticated / role / permission)
2. [ ] วาง `AuthMiddleware` ก่อน `RequireRole`/`RequirePermission` เสมอ
3. [ ] ถ้าใช้ permission ใหม่ → เพิ่มลง `allowPermissions` ใน `cmd/init-db/seed_data/role_permission.go` และ re-seed
4. [ ] route ที่เป็น governance (มอบสิทธิ/จัดการ role/admin) → กั้นด้วย `RequireRole("admin")` เท่านั้น อย่าเปิดให้ permission-gated (กัน privilege escalation)
5. [ ] register ฟังก์ชัน `SetupXxxRoutes` ใน `routes.go`
6. [ ] ถ้ามี controller ใหม่ → เพิ่มใน `Dependencies` + wire ใน `main.go`
7. [ ] `go build ./...` ผ่าน
```
