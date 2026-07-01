# Asset SUT System

ระบบบริหารจัดการสินทรัพย์ของมหาวิทยาลัยเทคโนโลยีสุรนารี (SUT)
พัฒนาโดย Capstone Group 09 และ 02

---

## โครงสร้างโปรเจค

```
asset-sut-system/                  ← Monorepo root
├── apps/
│   ├── backend/                   ← Go REST API (Gin + GORM)
│   │   ├── cmd/
│   │   │   ├── serve/main.go      ← Entry point รัน HTTP server
│   │   │   └── init-db/main.go    ← Migrate + Seed ฐานข้อมูล
│   │   └── internal/
│   │       ├── config/            ← โหลด env และ config struct
│   │       ├── controllers/       ← HTTP handler (auth, admin, staff, requester, role)
│   │       ├── database/          ← เชื่อมต่อ PostgreSQL ผ่าน GORM
│   │       ├── dto/               ← Request / Response struct
│   │       ├── middleware/        ← AuthMiddleware, RequireRole
│   │       ├── models/            ← GORM model (Users, Admins, Staffs, ...)
│   │       ├── pkg/
│   │       │   ├── hash/          ← bcrypt password
│   │       │   ├── jwt/           ← GenerateTokenPair, ParseToken
│   │       │   └── response/      ← Helper ส่ง JSON response มาตรฐาน
│   │       ├── repositories/      ← Query ฐานข้อมูล (GORM)
│   │       └── services/          ← Business logic
│   │
│   └── frontend/                  ← Next.js 16 App Router
│       └── src/
│           ├── app/               ← Pages และ Layouts (App Router)
│           │   ├── admin/         ← หน้า Admin portal
│           │   └── login/         ← หน้า Login / Register
│           ├── components/
│           │   ├── layout/        ← Sidebar, Topbar, Navbar
│           │   └── ui/            ← shadcn/ui base components
│           ├── features/          ← Business feature modules
│           │   └── user-management/
│           │       ├── components/
│           │       ├── hooks/
│           │       ├── services/
│           │       └── types/
│           └── lib/
│               ├── context/       ← AuthContext (React Context)
│               └── services/      ← api-client, auth.service
├── .env                           ← Environment variables (ไม่อยู่ใน git)
├── .env.example                   ← ตัวอย่าง env
└── docker-compose.yml             ← PostgreSQL สำหรับ dev
```

---

## Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Backend | Go 1.25, Gin, GORM, PostgreSQL |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| Auth | JWT (access token) + HttpOnly Cookie (refresh token) |
| Database | PostgreSQL 15 |

---

## การติดตั้งและรัน

### ข้อกำหนดเบื้องต้น

- Go 1.21+
- Node.js 20+
- Docker Desktop (สำหรับ PostgreSQL)

---

### 1. ตั้งค่า Environment Variables

คัดลอก `.env.example` เป็น `.env` แล้วแก้ค่าให้ตรงกับเครื่อง:

```bash
cp .env.example .env
```

ค่าสำคัญที่ต้องตั้ง:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=mydb

# JWT
JWT_SECRET=your-secret-key-here   # เปลี่ยนเป็น key ที่แข็งแรง

# CORS (ระบุ origin ของ frontend)
CORS_ALLOW_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_ALLOW_CREDENTIALS=true
```

---

### 2. รัน PostgreSQL ด้วย Docker

```bash
docker-compose up -d
```

---

### 3. รัน Backend

```bash
cd apps/backend

# Migrate ตาราง + Seed ข้อมูลเริ่มต้น (ทำครั้งแรกครั้งเดียว)
go run ./cmd/init-db

# รัน API Server
go run ./cmd/serve
```

Server จะรันที่ `http://localhost:8080`

ทดสอบว่า backend ทำงาน:
```bash
curl http://localhost:8080/health
# → {"status":"ok"}
```

---

### 4. รัน Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

Frontend จะรันที่ `http://localhost:3001` (หรือ 3000 ถ้าว่าง)

---

## ผู้ใช้งานเริ่มต้น (หลัง Seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin |
| Staff | staff@example.com | 12345678 |
| Requester | user@gmail.com | 12345678 |

---

## ระบบ Authentication

### ภาพรวม

ระบบใช้ **Dual Token Strategy** เพื่อความปลอดภัย:

```
Login
  ↓
Backend สร้าง 2 token:
  ├── Access Token  (JWT, หมดอายุ 15 นาที)
  └── Refresh Token (JWT, หมดอายุ 7 วัน)
```

---

### Access Token

| รายละเอียด | ค่า |
|-----------|-----|
| รูปแบบ | JWT (JSON Web Token) |
| อายุ | 15 นาที |
| เก็บที่ | `localStorage` ใน browser (`key: "auth"`) |
| ใช้งาน | ส่งทุก request ผ่าน Header `Authorization: Bearer <token>` |

**Payload ที่อยู่ใน token:**
```json
{
  "user_id": 1,
  "email": "admin@sut.ac.th",
  "role": "admin",
  "exp": 1234567890
}
```

---

### Refresh Token

| รายละเอียด | ค่า |
|-----------|-----|
| รูปแบบ | JWT |
| อายุ | 7 วัน |
| เก็บที่ | **HttpOnly Cookie** ชื่อ `refresh_token` |
| JavaScript อ่านได้ไหม | ❌ ไม่ได้ (ป้องกัน XSS) |
| ดูได้ที่ | DevTools → Application → Cookies → `http://localhost:8080` |

**ความปลอดภัยเพิ่มเติม:**
- Backend เก็บ **SHA-256 hash** ของ refresh token ในฐานข้อมูล ไม่เก็บ token ตรงๆ
- เมื่อใช้ refresh แล้วจะ **หมุน token** (Refresh Token Rotation) — token เก่าถูกลบทันที

---

### Cookie vs localStorage

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Storage                       │
│                                                         │
│  localStorage (localhost:3001)                          │
│  └── "auth" = { token: "<access_token>", user: {...} } │
│                                                         │
│  Cookies (localhost:8080)                               │
│  └── refresh_token = "<refresh_token>"  [HttpOnly]     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Flow การ Login

```
1. ผู้ใช้กรอก email + password → POST /api/v1/auth/login

2. Backend ตรวจสอบ:
   ├── หา user จาก email
   ├── ตรวจสอบ is_active
   ├── เทียบ password กับ bcrypt hash
   └── ดึง role จากฐานข้อมูล

3. Backend ตอบกลับ:
   ├── Set-Cookie: refresh_token=<token>; HttpOnly; Path=/; MaxAge=604800
   └── Body: { access_token, user: { id, email, role, first_name, last_name } }

4. Frontend เก็บ:
   └── localStorage.setItem("auth", { token: access_token, user })
```

---

### Flow การ Refresh Token

เมื่อ access token หมดอายุ (15 นาที):

```
1. Frontend เรียก POST /api/v1/auth/refresh
   └── Browser ส่ง refresh_token cookie อัตโนมัติ (credentials: include)

2. Backend ตรวจสอบ:
   ├── Parse JWT ใน cookie
   ├── เทียบ SHA-256 hash กับที่เก็บใน DB
   └── ตรวจสอบว่ายังไม่หมดอายุ

3. Backend ตอบกลับ:
   ├── ลบ token เก่าออกจาก DB
   ├── Set-Cookie: refresh_token=<token_ใหม่>; HttpOnly
   └── Body: { access_token_ใหม่, user }
```

---

### Flow การ Logout

```
1. Frontend เรียก POST /api/v1/auth/logout
   └── Browser ส่ง refresh_token cookie ไปด้วย

2. Backend:
   ├── ลบ refresh token hash ออกจาก DB
   └── Set-Cookie: refresh_token=; MaxAge=-1  (ลบ cookie)

3. Frontend:
   └── localStorage.removeItem("auth")
   └── redirect → /login
```

---

### Role และสิทธิ์

| Role | คำอธิบาย | สามารถทำอะไรได้ |
|------|----------|----------------|
| `admin` | เจ้าหน้าที่บริหารสินทรัพย์ | จัดการผู้ใช้ทั้งหมด, กำหนดสิทธิ์ Staff |
| `staff` | เจ้าหน้าที่ประจำสถานที่ | ทำได้ตามสิทธิ์ที่ Admin กำหนด |
| `requester` | ผู้ขอใช้บริการ | สมัครเอง, จองสถานที่ |

**Permission ของ Staff** แบ่งตาม Module และ Action:

```
Module: user_mgmt, booking, payment, upload_doc
Action: create, read, update, delete
```

---

## API Endpoints หลัก

```
POST   /api/v1/auth/login              ← เข้าสู่ระบบ
POST   /api/v1/auth/register           ← สมัครสมาชิก (requester)
POST   /api/v1/auth/refresh            ← ต่ออายุ token
POST   /api/v1/auth/logout             ← ออกจากระบบ

GET    /api/v1/me                      ← ข้อมูล user ปัจจุบัน [auth]

GET    /api/v1/admins                  ← รายชื่อ admin ทั้งหมด [admin]
POST   /api/v1/admins                  ← สร้าง admin [admin]
PUT    /api/v1/admins/:id              ← แก้ไข admin [admin]
DELETE /api/v1/admins/:id              ← ลบ admin [admin]

GET    /api/v1/staffs                  ← รายชื่อ staff ทั้งหมด [admin]
POST   /api/v1/staffs                  ← สร้าง staff [admin]
PUT    /api/v1/staffs/:id/permissions  ← กำหนดสิทธิ์ staff [admin]

GET    /api/v1/requesters              ← รายชื่อผู้ขอใช้บริการ [admin]
GET    /api/v1/permissions             ← รายการ permission ทั้งหมด [admin]
```
