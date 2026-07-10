"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import SpaceRentalBuildingView from "@/features/space-rental/components/admin/views/SpaceRentalBuildingView";

function BuildingPageContent() {
  const params = useParams();
  const buildingId = params.buildingId ? Number(params.buildingId) : 0;

  return <SpaceRentalBuildingView buildingId={buildingId} />;
}

export default function BuildingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f26522]" />
        </div>
      }
    >
      <BuildingPageContent />
    </Suspense>
  );
}
