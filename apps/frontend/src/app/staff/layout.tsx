"use client";

import { useAuthContext } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import StaffSidebar from "@/components/layout/sidebar/staffSidebar";
import DashboardTopbar from "@/components/layout/DashboardTopbar";
import Breadcrumb from "@/components/layout/Breadcrumb";

export default function StaffLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      if (user?.role === "admin") {
        router.push("/admin/dashboard");
        return;
      }
      if (user?.role !== "staff") {
        router.push("/");
      }
    }
  }, [isAuthenticated, user, isMounted, router]);

  if (!isMounted) return null;
  if (!isAuthenticated || user?.role !== "staff") return null;

  return (
    <div className="min-h-screen bg-slate-50/30">
      <StaffSidebar />
      <DashboardTopbar searchPlaceholder="ค้นหาตามชื่อ, หรือรหัสห้อง..." />
      <main className="ml-64 pt-25 min-h-screen">
        <div className="px-6 pt-3 pb-1">
          <Breadcrumb />
        </div>
        {children}
      </main>
    </div>
  );
}
