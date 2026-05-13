// app/(operator)/layout.tsx
"use client"
import { useAuthContext } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"
import OperatorSidebar from "@/components/layout/sidebar/operatorSidebar"
import DashboardTopbar from "@/components/layout/DashboardTopbar"

export default function OperatorLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")        // ยังไม่ได้ login
      return
    }
    if (user?.role !== "operator") {
      router.push("/unauthorized") // login แล้วแต่ role ผิด
    }
  }, [isAuthenticated, user])

  if (!isAuthenticated || user?.role !== "operator") return null

  return (
    <div className="min-h-screen bg-slate-50/30">
      <OperatorSidebar />
      <DashboardTopbar searchPlaceholder="ค้นหาพื้นที่หรือการจองของคุณ..." />
      <main className="ml-64 pt-25 min-h-screen transition-all duration-300">
        {children}
      </main>
    </div>
  )
}