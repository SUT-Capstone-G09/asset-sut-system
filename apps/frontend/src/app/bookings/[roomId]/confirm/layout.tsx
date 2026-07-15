"use client";

import { useAuthContext } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

export default function BookingConfirmLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isMounted, router]);

  if (!isMounted) return null;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
