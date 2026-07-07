import React from "react";

interface ActiveContract {
  contractNumber: string;
  startDate: string;
  endDate: string;
  monthlyRental: number;
  deposit: number;
}

interface ActiveContractSummaryProps {
  activeContract: ActiveContract;
}

export default function ActiveContractSummary({ activeContract }: ActiveContractSummaryProps) {
  // Convert Date to Thai Date Format
  const formatThaiDate = (dateStr: string) => {
    const months = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-100 pb-3">
        สัญญาปัจจุบันที่กำลังใช้อยู่
      </span>

      <div className="space-y-1">
        <span className="text-xs font-black text-slate-400">หมายเลขสัญญา</span>
        <p className="text-lg font-black text-slate-850">{activeContract.contractNumber}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">วันเริ่มสัญญา</span>
          <span className="text-slate-800 text-sm font-black block">{formatThaiDate(activeContract.startDate)}</span>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">วันหมดสัญญา</span>
          <span className="text-slate-800 text-sm font-black block">{formatThaiDate(activeContract.endDate)}</span>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-650">
        <div className="flex justify-between">
          <span>ค่าบำรุงเช่ารายเดือน</span>
          <span className="font-bold text-slate-800">{activeContract.monthlyRental.toLocaleString()} บาท</span>
        </div>
        <div className="flex justify-between">
          <span>เงินประกันความเสียหาย</span>
          <span className="font-bold text-slate-800">{activeContract.deposit.toLocaleString()} บาท</span>
        </div>
      </div>
    </div>
  );
}
