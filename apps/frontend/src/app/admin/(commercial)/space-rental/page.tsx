"use client"

import React, { Suspense } from "react";
import SpaceRentalIndexView from "@/features/space-rental/components/rental-space/SpaceRentalIndexView";

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
