"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import MyBookingsView from "@/features/bookings/components/my-bookings/MyBookingsView";
import { useAuthContext } from "@/lib/context/auth-context";

export default function MyBookingsPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role !== "requester") {
      router.replace("/admin/dashboard");
    }
  }, [mounted, user, router]);

  if (!mounted) return null;
  if (!user || user.role !== "requester") return null;

  return (
    <PageContainer>
      <MyBookingsView />
    </PageContainer>
  );
}
