import React from "react";
import { CheckCircle, AlertTriangle, Clock, Ban, Store, MoreHorizontal, Eye, Pencil, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContractItem } from "@/features/contracts/types/contract";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ContractTableProps {
  contracts: ContractItem[];
  onViewTenant: (areaId: string, tenantId: string) => void;
  onManageContract: (tenantId: string, contractId: string, action?: "renew" | "terminate") => void;
  onCreateClick: () => void;
}

export default function ContractTable({ contracts, onViewTenant, onManageContract, onCreateClick }: ContractTableProps) {
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
    <div className="bg-white rounded-[7px] border border-slate-100 shadow-sm overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">รายการสัญญาทั้งหมด</h2>
        </div>
        <Button
          size="sm"
          onClick={onCreateClick}
          className="gap-1.5 bg-[#f26522] text-xs text-white hover:bg-[#d8561d] rounded-[7px] shadow-sm transition-all h-9 px-4 cursor-pointer"
        >
          <Plus size={14} strokeWidth={2.5} />
          สร้างสัญญาใหม่
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50 hover:bg-transparent">
              <TableHead className="py-3 pl-4 pr-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-left">
                เลขที่สัญญา
              </TableHead>
              <TableHead className="px-3 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-left">
                คู่สัญญา / ผู้ประกอบการ
              </TableHead>
              <TableHead className="px-3 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-left">
                สถานที่เช่า
              </TableHead>
              <TableHead className="px-3 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-left">
                ประเภทธุรกิจ
              </TableHead>
              <TableHead className="px-3 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-left">
                ระยะเวลาสัญญา
              </TableHead>
              <TableHead className="px-3 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-left">
                ค่าบำรุงการใช้สถานที่
              </TableHead>
              <TableHead className="px-3 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center">
                สถานะ
              </TableHead>
              <TableHead className="py-3 pl-3 pr-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center">
                ดำเนินการ
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100/70 text-sm font-medium text-slate-700">
            {contracts.length > 0 ? (
              contracts.map((contract) => {
                return (
                  <TableRow
                    key={contract.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50/60"
                  >
                    <TableCell className="py-3.5 pl-4 pr-3">
                      <span className="text-sm font-medium text-slate-800">{contract.contractNumber}</span>
                    </TableCell>

                    <TableCell className="px-3 py-3.5">
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium text-slate-800 block">{contract.tenantName}</span>
                        <span className="text-slate-400 text-xs flex items-center gap-1">
                          <Store size={12} className="shrink-0" />
                          {contract.shopName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-3.5">
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium text-slate-700 block">{contract.areaName}</span>
                        <span className="text-slate-400 text-xs block">{contract.subLocation}</span>
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-3.5">
                      <span className="text-xs font-medium bg-slate-100/80 text-slate-600 px-2.5 py-1 rounded-[7px]">
                        {contract.businessType}
                      </span>
                    </TableCell>

                    <TableCell className="px-3 py-3.5">
                      <span className="text-sm text-slate-500">
                        {formatThaiDate(contract.startDate)} - {formatThaiDate(contract.endDate)}
                      </span>
                    </TableCell>

                    <TableCell className="px-3 py-3.5 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-slate-700">
                        {contract.monthlyRental.toLocaleString()} บ.
                      </span>
                    </TableCell>

                    <TableCell className="px-3 py-3.5 text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs border h-auto",
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
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3.5 pl-3 pr-4 text-center">
                      <div className="flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              type="button"
                              className="size-8 p-0 rounded-[7px] text-slate-400 hover:bg-slate-100/80 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                              title="ดำเนินการ"
                            >
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-white border border-slate-150 shadow-md rounded-[7px] p-1 z-120">
                            <DropdownMenuItem 
                              onClick={() => onViewTenant(contract.areaId, contract.tenantId)}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 rounded-[7px] hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <Eye size={14} className="text-slate-400" />
                              <span>ดูรายละเอียด</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onManageContract(contract.tenantId, contract.id, "renew")}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 rounded-[7px] hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <Pencil size={14} className="text-slate-400" />
                              <span>จัดการสัญญา</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-sm text-slate-400 font-bold">
                  ไม่พบข้อมูลสัญญาเช่าที่ตรงตามเงื่อนไขการค้นหา
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
