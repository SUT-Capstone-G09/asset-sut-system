// 1. React
import React, { useState } from "react";

// 2. Third-party libraries
import { Building2, FileText, User } from "lucide-react";

// 3. Feature Components
import CanteenStallsSection from "../tenant/CanteenStallsSection";
import AdminTenantDetailView from "../tenant/AdminTenantDetailView";
import AssignTenantDrawer from "../tenant/AssignTenantDrawer";
import CreateContractDrawer from "../tenant/CreateContractDrawer";

// 4. Types & Helpers
import { RentalSpace } from "../../types/rental-space";
import { getCanteenStallStats } from "../../utils/stall-helpers";
import { cn } from "@/lib/utils";

interface SpaceDetailTenantTabProps {
  location: RentalSpace;
  onUpdateLocation: (updatedLoc: RentalSpace) => void;
}

export default function SpaceDetailTenantTab({
  location,
  onUpdateLocation,
}: SpaceDetailTenantTabProps) {
  const [isAssignTenantOpen, setIsAssignTenantOpen] = useState(false);
  const [isCreateContractOpen, setIsCreateContractOpen] = useState(false);

  const isCanteen = location.area === "โรงอาหาร" && !location.id.includes("-");

  const {
    stalls,
    occupied: occupiedStallsCount,
    vacant: vacantStallsCount,
    inactive: inactiveStallsCount,
    total: totalStallsCount,
    occupancyPercent,
  } = getCanteenStallStats(location.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
        {isCanteen ? (
          <>
            <Building2 size={14} className="text-[#f26522]" />
            ผังแผงร้านค้าย่อยภายในโรงอาหาร
          </>
        ) : (
          <>
            <FileText size={14} className="text-[#f26522]" />
            ข้อมูลสัญญาเช่าและผู้ประกอบการ
          </>
        )}
      </h3>

      {isCanteen ? (
        <CanteenStallsSection
          location={location}
          stalls={stalls}
          occupiedStallsCount={occupiedStallsCount}
          vacantStallsCount={vacantStallsCount}
          inactiveStallsCount={inactiveStallsCount}
          totalStallsCount={totalStallsCount}
          occupancyPercent={occupancyPercent}
        />
      ) : (
        <div className="space-y-6">
          <AdminTenantDetailView
            location={location}
            onCreateContractClick={() => setIsCreateContractOpen(true)}
            onAssignTenantClick={() => setIsAssignTenantOpen(true)}
          />
        </div>
      )}

      {/* Action Drawers */}
      <AssignTenantDrawer
        location={location}
        open={isAssignTenantOpen}
        onClose={() => setIsAssignTenantOpen(false)}
        onSave={onUpdateLocation}
      />

      <CreateContractDrawer
        location={location}
        open={isCreateContractOpen}
        onClose={() => setIsCreateContractOpen(false)}
        onSave={onUpdateLocation}
      />
    </div>
  );
}
