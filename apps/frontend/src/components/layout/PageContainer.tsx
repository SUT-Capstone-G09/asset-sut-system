"use client";

import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  withPadding?: boolean; // เลือกว่าจะเว้นระยะ Navbar (pt-20)
  withScrollbar?: boolean; // เลือกว่าจะใช้ custom-scrollbar
}

export default function PageContainer({
  children,
  className,
  withPadding = true,
  withScrollbar = true,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "flex-1 w-full",
        // ถ้าต้องการ Scroll แยกเฉพาะส่วน
        withScrollbar && "h-screen overflow-y-auto custom-scrollbar",
        // ถ้าต้องการเว้นระยะ Navbar
        withPadding && "pt-20",
        className
      )}
    >
      {children}
    </div>
  );
}
