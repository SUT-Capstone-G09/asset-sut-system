"use client"

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import SpaceRentalTypeView from "@/features/space-rental/components/rental-space/SpaceRentalTypeView";

export default function CategoryPage() {
  const params = useParams();
  const typeName = params.typeName ? decodeURIComponent(params.typeName as string) : "";

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f26522]" />
        </div>
      }
    >
      <SpaceRentalTypeView typeName={typeName} />
    </Suspense>
  );
}
