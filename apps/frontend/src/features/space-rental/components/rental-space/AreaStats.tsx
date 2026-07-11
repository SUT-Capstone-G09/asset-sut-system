import React from "react";
import { Building2, UserCheck, DoorOpen } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { RentalSpace } from "@/features/space-rental/types/rental-space";

interface AreaStatsProps {
  locations: RentalSpace[];
}

export default function AreaStats({ locations }: AreaStatsProps) {
  const total = locations.length;
  const occupied = locations.filter((l) => l.status === "occupied").length;
  const available = locations.filter((l) => l.status === "available").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total */}
      <StatCard
        icon={<Building2 size={20} />}
        label="TOTAL SPACES"
        value={total}
        unit="ยูนิต"
        description="จำนวนพื้นที่เช่า/ล็อกทั้งหมดในระบบ"
      />

      {/* Occupied */}
      <StatCard
        icon={<UserCheck size={20} />}
        label="OCCUPIED"
        value={occupied}
        unit="ยูนิต"
        description="พื้นที่ที่มีสัญญาเช่าและผู้ประกอบการดูแล"
      />

      {/* Available */}
      <StatCard
        icon={<DoorOpen size={20} />}
        label="AVAILABLE"
        value={available}
        unit="ยูนิต"
        description="พื้นที่ว่างพร้อมเข้าจัดสรรทำสัญญาใหม่"
      />
    </div>
  );
}
