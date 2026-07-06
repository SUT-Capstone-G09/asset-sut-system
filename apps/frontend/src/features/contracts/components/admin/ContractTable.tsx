import React from "react";
import { CheckCircle, AlertTriangle, Clock, Ban, Store, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContractItem } from "@/features/contracts/types/contract";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface ContractTableProps {
  contracts: ContractItem[];
  onViewTenant: (areaId: string, tenantId: string) => void;
  onManageContract: (tenantId: string, contractId: string, action?: "renew" | "terminate") => void;
}

export default function ContractTable({ contracts, onViewTenant, onManageContract }: ContractTableProps) {
  // Convert Date to Thai format
  const formatThaiDate = (dateStr: string) => {
    const months = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = (date.getFullYear() + 543).toString().substring(2);
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-400 border-b border-slate-100 text-xs font-bold uppercase tracking-wider">
              <th className="py-5 px-6 font-bold text-left">เลขที่สัญญา</th>
              <th className="py-5 px-4 font-bold text-left">คู่สัญญา / ผู้ประกอบการ</th>
              <th className="py-5 px-4 font-bold text-left">สถานที่เช่า</th>
              <th className="py-5 px-4 font-bold text-left">ประเภทธุรกิจ</th>
              <th className="py-5 px-4 font-bold text-left">ระยะเวลาสัญญา</th>
              <th className="py-5 px-4 font-bold text-left">ค่าเช่ารายเดือน</th>
              <th className="py-5 px-6 font-bold text-left">สถานะ</th>
              <th className="py-5 px-6 font-bold text-left">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/70 text-sm font-medium text-slate-700">
            {contracts.length > 0 ? (
              contracts.map((contract) => {
                return (
                  <tr
                    key={contract.id}
                    className={cn(
                      "hover:bg-slate-50/50 transition-colors group"
                    )}
                  >
                    <td className="py-4.5 px-6">
                      <span className="text-sm font-medium text-slate-800 block">
                        {contract.contractNumber}
                      </span>
                    </td>

                    <td className="py-4.5 px-4">
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium text-slate-800 block">{contract.tenantName}</span>
                        <span className="text-slate-400 text-xs flex items-center gap-1">
                          <Store size={12} className="shrink-0" />
                          {contract.shopName}
                        </span>
                      </div>
                    </td>

                    <td className="py-4.5 px-4">
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium text-slate-700 block">{contract.areaName}</span>
                        <span className="text-slate-400 text-xs block">{contract.subLocation}</span>
                      </div>
                    </td>

                    <td className="py-4.5 px-4">
                      <span className="text-xs font-medium bg-slate-100/80 text-slate-600 px-2.5 py-1 rounded-lg">
                        {contract.businessType}
                      </span>
                    </td>

                    <td className="py-4.5 px-4">
                      <span className="text-sm font-medium text-slate-500">
                        {formatThaiDate(contract.startDate)} - {formatThaiDate(contract.endDate)}
                      </span>
                    </td>

                    <td className="py-4.5 px-4 text-right text-sm font-medium text-slate-800">
                      {contract.monthlyRental.toLocaleString()} บ.
                    </td>

                    <td className="py-4.5 px-6 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-xs",
                          contract.status === "active"
                            ? "bg-white-50 text-success-500 border-slate-100"
                            : contract.status === "expiring"
                            ? "bg-white-50 text-warning-600 border-slate-100"
                            : contract.status === "expired"
                            ? "bg-neutral-100 text-neutral-500 border-neutral-202"
                            : "bg-white-50 text-error-500 border-slate-100"
                        )}
                      >
                        {contract.status === "active" && <CheckCircle size={10} />}
                        {contract.status === "expiring" && <AlertTriangle size={10} />}
                        {contract.status === "expired" && <Clock size={10} />}
                        {contract.status === "terminated" && <Ban size={10} />}

                        {contract.status === "active" && "ปกติ"}
                        {contract.status === "expiring" && "ใกล้หมดสัญญา"}
                        {contract.status === "expired" && "หมดอายุ"}
                        {contract.status === "terminated" && "ยกเลิกแล้ว"}
                      </span>
                    </td>

                    <td className="py-4.5 px-6 text-center">
                      <div className="flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="size-8 rounded-lg text-slate-400 hover:bg-slate-100/80 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                              title="ดำเนินการ"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-white border border-slate-150 shadow-md rounded-xl p-1 z-120">
                            <DropdownMenuItem 
                              onClick={() => onViewTenant(contract.areaId, contract.tenantId)}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <Eye size={14} className="text-slate-400" />
                              <span>ดูรายละเอียด</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onManageContract(contract.tenantId, contract.id, "renew")}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <Pencil size={14} className="text-slate-400" />
                              <span>จัดการสัญญา</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                  ไม่พบข้อมูลสัญญาเช่าที่ตรงตามเงื่อนไขการค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
