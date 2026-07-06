import React from "react";
import { Search, X } from "lucide-react";

interface ContractFiltersProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedArea: string;
  onAreaChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedBusinessType: string;
  onBusinessTypeChange: (value: string) => void;
  selectedYear: string;
  onYearChange: (value: string) => void;
  onResetFilters: () => void;
  areaOptions: { id: string; name: string }[];
}

export default function ContractFilters({
  searchTerm,
  onSearchTermChange,
  selectedArea,
  onAreaChange,
  selectedStatus,
  onStatusChange,
  selectedBusinessType,
  onBusinessTypeChange,
  selectedYear,
  onYearChange,
  onResetFilters,
  areaOptions,
}: ContractFiltersProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 pointer-events-none">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="ค้นหาเลขที่สัญญา, ชื่อผู้ประกอบการ, แบรนด์..."
            className="w-full pl-11 pr-4 py-3 rounded-[7px] border border-slate-200 bg-slate-50/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-medium text-slate-800 transition-all placeholder:text-slate-400"
          />
        </div>

        <button
          onClick={onResetFilters}
          className="w-full md:w-auto bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-[7px] px-4 py-3 text-xs font-black transition-all flex items-center justify-center gap-1.5"
        >
          <X size={14} />
          ล้างตัวกรองทั้งหมด
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
        {/* Area */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">พื้นที่ (Areas)</label>
          <select
            value={selectedArea}
            onChange={(e) => onAreaChange(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-[7px] px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="all">ทั้งหมด ทุกพื้นที่</option>
            {areaOptions.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">สถานะสัญญา</label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-[7px] px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="active">ใช้งานปกติ (Active)</option>
            <option value="expiring">ใกล้หมดสัญญา (Expiring)</option>
            <option value="expired">หมดอายุ (Expired)</option>
            <option value="terminated">ยกเลิกแล้ว (Terminated)</option>
          </select>
        </div>

        {/* Business Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ประเภทสัญญา (ธุรกิจ)</label>
          <select
            value={selectedBusinessType}
            onChange={(e) => onBusinessTypeChange(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-[7px] px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="all">ทุกประเภทธุรกิจ</option>
            <option value="อาหารและเครื่องดื่ม">อาหารและเครื่องดื่ม</option>
            <option value="ขนมหวาน">ขนมหวาน</option>
            <option value="ร้านสะดวกซื้อ">ร้านสะดวกซื้อ</option>
            <option value="เครื่องดื่ม">เครื่องดื่ม</option>
            <option value="บริการ">บริการ</option>
          </select>
        </div>

        {/* Year */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ปีเริ่มต้นสัญญา</label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-[7px] px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="all">ทุกปีเริ่มต้น</option>
            <option value="2023">2023 (พ.ศ. 2566)</option>
            <option value="2024">2024 (พ.ศ. 2567)</option>
            <option value="2025">2025 (พ.ศ. 2568)</option>
            <option value="2026">2026 (พ.ศ. 2569)</option>
            <option value="2027">2027 (พ.ศ. 2570)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
