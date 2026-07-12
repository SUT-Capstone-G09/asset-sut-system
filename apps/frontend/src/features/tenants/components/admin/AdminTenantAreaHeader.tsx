import { tenantAreaSummary } from "@/features/tenants/data/tenant-areas";
import { StatCard } from "@/components/ui/StatCard";
import { MapPin, Store, Building2 } from "lucide-react";

export default function AdminTenantAreaHeader() {
  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Title */}
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            เลือกพื้นที่ประกอบการ
          </h1>
          <p className="max-w-xl text-sm md:text-base font-medium leading-relaxed text-slate-500">
            เลือกพื้นที่หลักที่ต้องการตรวจสอบรายชื่อผู้ประกอบการและสถานะสัญญาปัจจุบัน
            เพื่อดำเนินการจัดการข้อมูลเชิงลึก
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<MapPin size={20} />}
          label="สถานที่หลัก"
          value={tenantAreaSummary.areaCount}
          unit="แห่ง"
          description="จำนวนสถานที่ประกอบการหลักในระบบ"
        />
        <StatCard
          icon={<Building2 size={20} />}
          label="พื้นที่จัดสรรทั้งหมด"
          value={tenantAreaSummary.subLocationCount}
          unit="แห่ง"
          description="จำนวนพื้นที่ประกอบการย่อยในระบบ"
        />
        <StatCard
          icon={<Store size={20} />}
          label="ผู้ประกอบการทั้งหมด"
          value={tenantAreaSummary.tenantCount}
          unit="ราย"
          description="ผู้ประกอบการที่ทำสัญญาเช่าพื้นที่"
        />
      </div>
    </div>
  );
}
