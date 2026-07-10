// 1. React
import React, { useState } from "react";

// 2. Third-party libraries
import { Building2, FileText, User } from "lucide-react";

// 3. Feature Components
import CanteenStallsSection from "../../drawers/sections/CanteenStallsSection";
import SingleTenantSection from "../../drawers/sections/SingleTenantSection";
import AssignTenantDrawer from "../../drawers/AssignTenantDrawer";
import CreateContractDrawer from "../../drawers/CreateContractDrawer";

// 4. Types & Helpers
import { RentalSpace } from "../../../../types/rental-space";
import { getCanteenStallStats } from "../../../../utils/stall-helpers";
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

  const isCanteen = location.area === "โรงอาหาร";

  const {
    stalls,
    occupied: occupiedStallsCount,
    vacant: vacantStallsCount,
    inactive: inactiveStallsCount,
    total: totalStallsCount,
    occupancyPercent,
  } = getCanteenStallStats(location.id);

  return (
    <div className="space-y-6 max-w-3xl">
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
          <SingleTenantSection
            location={location}
            onCreateContractClick={() => setIsCreateContractOpen(true)}
          />

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              การดำเนินการด้านผู้เช่า & สัญญา
            </span>
            {location.status === "available" &&
              (!location.tenantName || location.tenantName === "-") && (
                <AdminActionButton
                  label="มอบสิทธิ์ผู้เช่า"
                  icon={User}
                  variant="primary"
                  className="w-full"
                  onClick={() => setIsAssignTenantOpen(true)}
                />
              )}

            {(!location.contractNumber || location.contractNumber === "") &&
              location.tenantName &&
              location.tenantName !== "-" && (
                <AdminActionButton
                  label="สร้างสัญญาเช่าพื้นที่"
                  icon={FileText}
                  variant="primary"
                  className="w-full"
                  onClick={() => setIsCreateContractOpen(true)}
                />
              )}

            {location.status === "occupied" && (
              <div className="grid grid-cols-2 gap-3">
                <AdminActionButton
                  label="แก้ไขผู้เช่า"
                  icon={User}
                  variant="secondary"
                  onClick={() => setIsAssignTenantOpen(true)}
                />
                <AdminActionButton
                  label="จัดการเอกสารสัญญา"
                  icon={FileText}
                  variant="secondary"
                  onClick={() => setIsCreateContractOpen(true)}
                />
              </div>
            )}
          </div>
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

// Local helper component to stay independent
interface AdminActionButtonProps {
  label: string;
  icon: React.ElementType;
  variant: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
}

function AdminActionButton({
  label,
  icon: Icon,
  variant,
  className,
  onClick,
}: AdminActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-12 px-4 inline-flex items-center justify-center gap-3 rounded-[7px] border transition-all text-[13px] font-bold active:scale-[0.98]",
        variant === "primary"
          ? "bg-[#f26522] border-[#f26522] text-white shadow-lg shadow-[#f26522]/20 hover:bg-[#d8561d]"
          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
        className
      )}
    >
      <Icon size={16} strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );
}
