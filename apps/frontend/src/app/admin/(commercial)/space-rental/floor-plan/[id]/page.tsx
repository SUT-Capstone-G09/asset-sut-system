"use client"

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LayoutGrid, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloorPlanData } from "@/features/space-rental/types/floor-plan";
import { mockFloorPlans } from "@/features/space-rental/data/mock-floor-plans";
import { mockLocations } from "@/features/space-rental/data/mock-rental-spaces";
import { mockBuildings } from "@/features/space-rental/data/mock-buildings";
import FloorPlanEditor from "@/features/space-rental/components/floor-plan/FloorPlanEditor";

export default function FloorPlanEditorPage() {
  const params = useParams();
  const router = useRouter();
  const locationId = params.id as string;
  const [floorPlan, setFloorPlan] = useState<FloorPlanData | null>(null);
  const [locationName, setLocationName] = useState<string>("");

  useEffect(() => {
    if (!locationId) return;

    // ค้นหาชื่อสถานที่
    const loc = mockLocations.find((l) => l.id === locationId);
    if (loc) {
      setLocationName(loc.name);
    }

    // ดึงแผนผังจาก localStorage ก่อน
    const stored = localStorage.getItem("floor-plans");
    if (stored) {
      const all: FloorPlanData[] = JSON.parse(stored);
      const found = all.find((fp) => fp.locationId === locationId);
      if (found) {
        setFloorPlan(found);
        return;
      }
    }

    // Fallback ไปใช้ mock data
    const mock = mockFloorPlans.find((fp) => fp.locationId === locationId);
    if (mock) {
      setFloorPlan({
        ...mock,
        elements: mock.elements.map((el) => ({ ...el })),
        layers: mock.layers.map((ly) => ({ ...ly })),
      });
    }
  }, [locationId]);

  const handleSave = (updated: FloorPlanData) => {
    setFloorPlan(updated);
  };

  const handleBack = () => {
    router.push("/admin/space-rental");
  };

  const building = mockBuildings.find((b) => String(b.id) === locationId);

  if (!floorPlan) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <LayoutGrid size={48} className="text-slate-200 mx-auto animate-pulse" />
          <p className="text-sm font-bold text-slate-500">
            ไม่พบข้อมูลแปลนผังสำหรับสถานที่นี้
          </p>
          <Button 
            onClick={handleBack}
            className="bg-[#f26522] hover:bg-[#d8561d] text-white text-xs font-bold gap-2"
          >
            <ArrowLeft size={14} />
            ย้อนกลับ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-4 space-y-6 w-full">
      {/* Editor Component */}
      <FloorPlanEditor 
        initialData={floorPlan} 
        onSave={handleSave} 
        onBack={handleBack} 
        backgroundImageUrl={building?.blueprint_url}
      />
    </div>
  );
}

