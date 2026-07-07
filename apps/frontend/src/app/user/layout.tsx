// app/(user)/layout.tsx
"use client"
import { useAuthContext } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState, ReactNode } from "react"
import UserSidebar from "@/components/layout/sidebar/userSidebar"
import DashboardTopbar from "@/components/layout/DashboardTopbar"

export default function UserLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthContext()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      if (!isAuthenticated) {
        router.push("/login")        // ยังไม่ได้ login
        return
      }
      if (user?.role !== "user" && user?.role !== "requester") {
        router.push("/unauthorized") // login แล้วแต่ role ผิด
      }
    }
  }, [isAuthenticated, user, isMounted, router])

  if (!isMounted) return null
  if (!isAuthenticated || (user?.role !== "user" && user?.role !== "requester")) return null

  return (
    <div className="min-h-screen bg-slate-50/30">
      <UserSidebar />
      <DashboardTopbar searchPlaceholder="ค้นหาบริการหรือประวัติของคุณ..." />
      <main className="md:ml-64 pt-25 min-h-screen transition-all duration-300">
        {children}
      </main>
    </div>
  )
}