// app/(user)/layout.tsx
"use client"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"

export default function UserLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")        // ยังไม่ได้ login
      return
    }
    if (user?.role !== "user") {
      router.push("/unauthorized") // login แล้วแต่ role ผิด
    }
  }, [isAuthenticated, user])

  if (!isAuthenticated || user?.role !== "user") return null

  return <>{children}</>
}