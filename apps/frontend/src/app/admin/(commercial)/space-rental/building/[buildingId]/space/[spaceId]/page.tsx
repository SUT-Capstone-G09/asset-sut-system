"use client"

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import SpaceDetailView from "@/features/space-rental/components/rental-space/SpaceDetailView";

export default function SpaceDetailPage() {
  const params = useParams();
  const buildingId = params.buildingId ? Number(params.buildingId) : 0;
  const spaceId = params.spaceId as string;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f26522]" />
        </div>
      }
    >
      <SpaceDetailView buildingId={buildingId} spaceId={spaceId} />
    </Suspense>
  );
}
