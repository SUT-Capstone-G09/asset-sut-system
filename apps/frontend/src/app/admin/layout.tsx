// app/(admin)/layout.tsx
"use client";
import { useAuthContext } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import AdminSidebar from "@/components/layout/sidebar/adminSidebar";
import DashboardTopbar from "@/components/layout/DashboardTopbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
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
      if (user?.role !== "admin" && user?.role !== "staff") {
        router.push("/unauthorized");
      }
    }
  }, [isAuthenticated, user, isMounted, router]);

  if (!isMounted) return null;

  if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "staff"))
    return null;

  return (
    <div className="min-h-screen bg-slate-50/30">
      <AdminSidebar />
      <DashboardTopbar searchPlaceholder="ค้นหาตามชื่อ, เลขสัญญา, หรือชื่อร้าน..." />
      <main className="ml-64 pt-25 min-h-screen">{children}</main>
    </div>
  );
}
