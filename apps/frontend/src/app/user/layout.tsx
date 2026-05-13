// app/(user)/layout.tsx
"use client"
import { useAuthContext } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"
import UserSidebar from "@/components/layout/sidebar/userSidebar"
import DashboardTopbar from "@/components/layout/DashboardTopbar"

export default function UserLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthContext()
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