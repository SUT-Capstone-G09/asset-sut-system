"use client";

import { 
  AlertTriangle, 
  FileText, 
  Store, 
  Calendar, 
  Building, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  User,
  FileCheck,
  Ban
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MockTenant, MockContract } from "@/features/space-rental/data/mock-tenants";
import { RenewalRequest } from "../../data/mockContractStore";

interface OperatorContractTabProps {
  activeTenant: MockTenant;
  activeContract: MockContract;
  areaName: string;
  hasPendingRequest: boolean;
  hasApprovedRequest: boolean;
  requestsList: RenewalRequest[];
  formatThaiDate: (dateStr: string) => string;
  onOpenRenewalModal: () => void;
}

export default function OperatorContractTab({
  activeTenant,
  activeContract,
  areaName,
  hasPendingRequest,
  hasApprovedRequest,
  requestsList,
  formatThaiDate,
  onOpenRenewalModal,
}: OperatorContractTabProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Expiring Alert Banner */}
      {activeContract.status === "expiring" && !hasPendingRequest && !hasApprovedRequest && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-[7px] p-5 flex items-start gap-4 animate-in slide-in-from-top-2 duration-300">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={24} />
          <div className="space-y-1.5 flex-1">
            <span className="text-sm font-bold text-amber-800 block">
              สัญญาเช่ากำลังจะสิ้นสุดอายุการใช้งาน
            </span>
            <p className="text-xs text-amber-700 leading-relaxed font-semibold">
              สัญญาเช่าแผงร้านค้าของคุณเลขที่ <strong className="text-amber-900">{activeContract.contractNumber}</strong> กำลังจะสิ้นสุดในวันที่ <strong>{formatThaiDate(activeContract.endDate)}</strong> (เหลือเวลาไม่ถึง 3 เดือน) 
              ท่านสามารถกดยื่นขอความประสงค์ต่ออายุสัญญาเช่าเข้ามาในระบบเพื่อความสะดวกและรวดเร็ว
            </p>
            <div className="pt-2">
              <Button
                onClick={onOpenRenewalModal}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-[7px] py-1.5 h-auto px-4 cursor-pointer"
              >
                ยื่นขอต่อสัญญาเช่าทันที
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Detail Card */}
      <div className="bg-white rounded-[7px] border border-slate-100 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-[7px] bg-[#f26522]/10 flex items-center justify-center">
              <FileText size={20} className="text-[#f26522]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">สัญญาเช่าที่ใช้งานอยู่</h2>
              <p className="text-xs text-slate-400 mt-0.5">เลขที่สัญญา: {activeContract.contractNumber}</p>
            </div>
          </div>
          <div>
            <span className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border",
              activeContract.status === "expiring"
                ? "bg-amber-50 text-amber-500 border-amber-200"
                : "bg-emerald-50 text-emerald-500 border-emerald-200"
            )}>
              <span className={cn("size-2 rounded-full", activeContract.status === "expiring" ? "bg-amber-400 animate-pulse" : "bg-emerald-400")} />
              {activeContract.status === "expiring" ? "ใกล้หมดสัญญา" : "ปกติ"}
            </span>
          </div>
        </div>

        {/* Card Content Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <Store size={18} className="text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">ชื่อร้านค้า / แบรนด์</span>
                <span className="text-sm font-semibold text-slate-800">{activeTenant.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <Calendar size={18} className="text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">ระยะเวลาสัญญาเช่า</span>
                <span className="text-sm font-semibold text-slate-800">
                  {formatThaiDate(activeContract.startDate)} — {formatThaiDate(activeContract.endDate)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building size={18} className="text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">พื้นที่ประกอบการค้า</span>
                <span className="text-sm font-semibold text-slate-800">{activeTenant.subLocation} ({areaName})</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:border-l md:border-slate-100 md:pl-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <DollarSign size={18} className="text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">ค่าบำรุงการใช้สถานที่รายเดือน</span>
                <span className="text-sm font-bold text-slate-800">{activeContract.monthlyRental.toLocaleString()} บาท</span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <DollarSign size={18} className="text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">เงินหลักประกันสัญญา</span>
                <span className="text-sm font-bold text-slate-800">{activeContract.deposit.toLocaleString()} บาท</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign size={18} className="text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">เงินสนับสนุนการศึกษา (รายปี)</span>
                <span className="text-sm font-bold text-slate-800">{activeContract.scholarship.toLocaleString()} บาท</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="border-t border-slate-100 p-6 bg-slate-50/50 flex justify-between items-center gap-4">
          <p className="text-xs text-slate-400">
            * สัญญาฉบับเดิมของท่านจะหมดอายุในอีก {Math.max(1, Math.round((new Date(activeContract.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)))} เดือน
          </p>
          <div className="flex gap-2">
            {hasApprovedRequest ? (
              <div className="flex items-center gap-2 text-success-500 font-bold text-xs bg-success-50 border border-success-100 rounded-[7px] px-4 py-2">
                <CheckCircle size={14} />
                <span>คำร้องได้รับการอนุมัติแล้ว (ระบบได้รับการต่ออายุแล้ว)</span>
              </div>
            ) : hasPendingRequest ? (
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs bg-amber-50 border border-amber-100 rounded-[7px] px-4 py-2">
                <Clock size={14} className="animate-spin" />
                <span>ยื่นคำร้องแล้ว (รอแอดมินอนุมัติ)</span>
              </div>
            ) : (
              <Button
                disabled={activeContract.status !== "expiring"}
                onClick={onOpenRenewalModal}
                className="bg-[#f26522] hover:bg-[#d8561d] text-white font-bold text-xs rounded-[7px] px-5 py-2.5 shadow-md shadow-[#f26522]/15 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>ยื่นคำร้องขอต่ออายุสัญญา</span>
                <ArrowRight size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Renewal Request History Section */}
      <div className="bg-white rounded-[7px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-bold text-slate-900">ประวัติการยื่นคำร้องขอต่ออายุสัญญา</h3>
          <p className="text-xs text-slate-400 mt-0.5">รายการคำร้องต่อสัญญาเช่าของคุณในระบบ</p>
        </div>

        <div className="p-0">
          {requestsList.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400 font-bold">
              ยังไม่เคยมีประวัติการยื่นคำร้องขอต่ออายุสัญญาเช่าในระบบ
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    <th className="py-3 px-6">เลขที่สัญญา</th>
                    <th className="py-3 px-4">วันที่ยื่น</th>
                    <th className="py-3 px-4">ประเภทผู้ประกอบการ</th>
                    <th className="py-3 px-4">เอกสารแนบ</th>
                    <th className="py-3 px-4 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                  {requestsList.map((req) => (
                    <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-6 text-slate-800 font-semibold">{req.contractNo}</td>
                      <td className="py-4 px-4 text-slate-500">{req.date}</td>
                      <td className="py-4 px-4 text-slate-600">
                        <span className="flex items-center gap-1.5">
                          {req.tenantType === "juristic" ? (
                            <>
                              <Building size={14} className="text-indigo-400" />
                              <span>นิติบุคคล</span>
                            </>
                          ) : (
                            <>
                              <User size={14} className="text-emerald-400" />
                              <span>บุคคลธรรมดา</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {req.tenantType === "juristic" ? (
                          <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-[7px] font-semibold flex items-center gap-1 w-fit max-w-[200px] truncate" title={req.documentName}>
                            <FileCheck size={12} className="shrink-0" />
                            {req.documentName}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-xs",
                          req.status === "approved"
                            ? "bg-success-50 text-success-500 border-success-100"
                            : req.status === "rejected"
                            ? "bg-error-50 text-error-500 border-error-100"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                        )}>
                          {req.status === "approved" && <CheckCircle size={10} />}
                          {req.status === "rejected" && <Ban size={10} />}
                          {req.status === "pending" && <Clock size={10} className="animate-spin" />}
                          {req.status === "approved" ? "อนุมัติแล้ว" : req.status === "rejected" ? "ปฏิเสธ" : "รอตรวจสอบ"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
