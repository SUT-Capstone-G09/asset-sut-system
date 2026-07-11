import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SpaceDetailInfoTab from "./SpaceDetailInfoTab";
import SpaceDetailTenantTab from "./SpaceDetailTenantTab";
import { useSpaceDetail } from "../../hooks/useSpaceDetail";
import { cn } from "@/lib/utils";

type TabValue = "info" | "tenant";

interface SpaceDetailViewProps {
  buildingId: number;
  spaceId: string;
}

export default function SpaceDetailView({ buildingId, spaceId }: SpaceDetailViewProps) {
  const router = useRouter();
  const { location, building, isLoading, handleUpdateLocation } = useSpaceDetail(
    buildingId,
    spaceId
  );

  const [activeTab, setActiveTab] = useState<TabValue>("info");

  const handleBack = () => {
    router.push(`/admin/space-rental/building/${buildingId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f26522]" />
      </div>
    );
  }

  if (!location || !building) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">ไม่พบข้อมูลพื้นที่เช่า</h2>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 text-sm font-semibold transition-all"
        >
          ย้อนกลับหน้าอาคาร
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header Section (Flat & Clean, matching other detail pages) */}
      <div className="border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          {location.name}
        </h1>
        <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-2">
          <span>ยูนิตพื้นที่เช่า</span>
          <span className="size-1 rounded-full bg-slate-300" />
          <span>ประเภท: {location.area}</span>
          <span className="size-1 rounded-full bg-slate-300" />
          <span>อาคาร: {building.name}</span>
          <span className="size-1 rounded-full bg-slate-300" />
          <span>ID: {location.id}</span>
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab("info")}
          className={cn(
            "flex items-center gap-2 px-6 pb-3 pt-1 text-sm font-semibold transition-colors cursor-pointer",
            activeTab === "info"
              ? "border-b-2 border-[#f26522] text-[#f26522]"
              : "border-b-2 border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          ข้อมูลพื้นที่
        </button>
        <button
          onClick={() => setActiveTab("tenant")}
          className={cn(
            "flex items-center gap-2 px-6 pb-3 pt-1 text-sm font-semibold transition-colors cursor-pointer",
            activeTab === "tenant"
              ? "border-b-2 border-[#f26522] text-[#f26522]"
              : "border-b-2 border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          ผู้เช่า & สัญญา
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "info" ? (
        <SpaceDetailInfoTab
          location={location}
          building={building}
          onUpdateLocation={handleUpdateLocation}
        />
      ) : (
        <SpaceDetailTenantTab
          location={location}
          onUpdateLocation={handleUpdateLocation}
        />
      )}
    </div>
  );
}
