"use client";

import { useAuthContext } from "@/lib/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

export default function BookingConfirmLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isMounted, router, pathname]);

  if (!isMounted) return null;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
