import React, { Suspense } from "react";
import type { Metadata } from "next";
import SpaceRentalIndexView from "@/features/space-rental/components/rental-space/SpaceRentalIndexView";

export const metadata: Metadata = {
  title: "จัดการพื้นที่เช่า & ร้านค้า | SUT Asset Management",
  description: "ระบบจัดการพื้นที่จัดสรรเชิงพาณิชย์ และรายชื่อผู้ประกอบการของมหาวิทยาลัย",
};

export default function SpaceRentalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f26522]" />
        </div>
      }
    >
      <SpaceRentalIndexView />
    </Suspense>
  );
}
