import React from "react";

interface ContractStatsProps {
  stats: {
    total: number;
    active: number;
    expiring: number;
    expired: number;
    terminated: number;
  };
}

export default function ContractStats({ stats }: ContractStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total */}
      <div className="bg-card rounded-[7px] p-6 border border-border/80 shadow-xs space-y-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">สัญญาเช่าทั้งหมด</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-855">{stats.total}</span>
          <span className="text-xs text-muted-foreground font-bold">ฉบับ</span>
        </div>
      </div>

      {/* Active */}
      <div className="bg-card rounded-[7px] p-6 border border-border/80 shadow-xs space-y-2">
        <span className="text-[10px] font-bold text-success-500 uppercase tracking-widest block">กำลังใช้งานปกติ</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-success-500">{stats.active}</span>
          <span className="text-xs text-success-500 font-bold">ฉบับ</span>
        </div>
      </div>

      {/* Expiring */}
      <div className="bg-card rounded-[7px] p-6 border border-border/80 shadow-xs space-y-2">
        <span className="text-[10px] font-bold text-warning-600 uppercase tracking-widest block">ใกล้หมดสัญญา</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-warning-600">{stats.expiring}</span>
          <span className="text-xs text-warning-600 font-bold">ฉบับ</span>
        </div>
      </div>

      {/* Expired */}
      <div className="bg-card rounded-[7px] p-6 border border-border/80 shadow-xs space-y-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">หมดอายุแล้ว</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-500">{stats.expired}</span>
          <span className="text-xs text-muted-foreground font-bold">ฉบับ</span>
        </div>
      </div>

      {/* Terminated */}
      <div className="bg-card rounded-[7px] p-6 border border-border/80 shadow-xs space-y-2">
        <span className="text-[10px] font-bold text-error-500 uppercase tracking-widest block">บอกเลิก/ยกเลิก</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-error-500">{stats.terminated}</span>
          <span className="text-xs text-error-500 font-bold">ฉบับ</span>
        </div>
      </div>
    </div>
  );
}
