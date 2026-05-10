// lib/services/auth.service.ts
import { MOCK_USERS } from "../mock/users"

export async function login(email: string, password: string) {
  // simulate network delay
  await new Promise(r => setTimeout(r, 500))

  const found = MOCK_USERS.find(
    u => u.email === email && u.password === password
  )
  if (!found) throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง")

  // return เหมือน JWT response จริง
  return {
    token: `mock-token-${found.id}`,
    user: { id: found.id, name: found.name, role: found.role, shopId: found.shopId },
  }
}