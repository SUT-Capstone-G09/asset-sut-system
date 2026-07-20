"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  Ban,
  Clock,
  FileText,
  Building,
  User,
  Download,
  MoreHorizontal,
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
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

interface RenewalRequest {
  id: string;
  contractNo: string;
  shopName: string;
  ownerName: string;
  tenantType: "individual" | "juristic";
  documentName: string;
  status: "pending" | "approved" | "rejected";
  date: string;
  note?: string;
}

import { mockContractStore } from "../../data/mockContractStore";

export default function ContractRenewalRequestsTable() {
  const [requests, setRequests] = useState<RenewalRequest[]>([]);

  const reloadRequests = () => {
    setRequests(mockContractStore.getRenewalRequests());
  };

  useEffect(() => {
    reloadRequests();
    window.addEventListener("storage", reloadRequests);
    const interval = setInterval(reloadRequests, 1000);
    return () => {
      window.removeEventListener("storage", reloadRequests);
      clearInterval(interval);
    };
  }, []);

  const updateRequestStatus = (id: string, newStatus: "approved" | "rejected") => {
    mockContractStore.updateRequestStatus(id, newStatus);
    reloadRequests();

    if (newStatus === "approved") {
      toast.success("อนุมัติคำร้องสำเร็จ", {
        description: "สถานะคำร้องถูกเปลี่ยนเป็นอนุมัติแล้ว และระยะเวลาสัญญาเช่าได้รับการขยายเวลาในระบบ",
      });
    } else {
      toast.error("ปฏิเสธคำร้องแล้ว", {
        description: "ระบบได้บันทึกการปฏิเสธคำขอต่ออายุสัญญานี้เรียบร้อยแล้ว",
      });
    }
  };

  const handleDownloadMockPDF = (docName: string) => {
    // Generate a mock PDF download
    toast.info("ดาวน์โหลดเอกสารสำเร็จ", {
      description: `กำลังดาวน์โหลดไฟล์เอกสาร "${docName}" เข้าเครื่องของคุณ...`,
    });
  };

  return (
    <div className="bg-white rounded-[7px] border border-slate-100 shadow-sm overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">คำร้องขอต่ออายุสัญญาเช่า</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50 hover:bg-transparent">
              <TableHead className="py-3 pl-6 pr-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-left">
                เลขที่สัญญาเดิม
              </TableHead>
              <TableHead className="px-3 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-left">
                คู่สัญญา / ร้านค้า
              </TableHead>
              <TableHead className="px-3 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-left">
                ประเภทผู้ประกอบการ
              </TableHead>
              <TableHead className="px-3 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-left">
                วันที่ยื่นคำขอ
              </TableHead>
              <TableHead className="px-3 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-left">
                เอกสารแนบประกอบ
              </TableHead>
              <TableHead className="px-3 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center">
                สถานะคำร้อง
              </TableHead>
              <TableHead className="py-3 pl-3 pr-6 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center">
                ดำเนินการพิจารณา
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100/70 text-sm font-medium text-slate-700">
            {requests.length > 0 ? (
              requests.map((req) => (
                <TableRow key={req.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/60">
                  <TableCell className="py-4 pl-6 pr-3 font-semibold text-slate-800">
                    {req.contractNo}
                  </TableCell>

                  <TableCell className="px-3 py-4">
                    <div className="space-y-0.5">
                      <span className="text-sm font-bold text-slate-800 block">{req.shopName}</span>
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <User size={12} className="shrink-0 text-slate-350" />
                        ผู้ยื่น: {req.ownerName}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-3 py-4">
                    <span className="flex items-center gap-1.5 text-xs text-slate-650 font-bold">
                      {req.tenantType === "juristic" ? (
                        <>
                          <Building size={14} className="text-indigo-500" />
                          <span>นิติบุคคล</span>
                        </>
                      ) : (
                        <>
                          <User size={14} className="text-emerald-500" />
                          <span>บุคคลธรรมดา</span>
                        </>
                      )}
                    </span>
                  </TableCell>

                  <TableCell className="px-3 py-4 text-slate-500">
                    {req.date}
                  </TableCell>

                  <TableCell className="px-3 py-4">
                    {req.tenantType === "juristic" ? (
                      <button
                        onClick={() => handleDownloadMockPDF(req.documentName)}
                        className="text-xs font-bold text-indigo-650 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 px-2.5 py-1.5 rounded-[7px] transition-all flex items-center gap-1 cursor-pointer max-w-[200px] truncate"
                        title="คลิกเพื่อดาวน์โหลดเอกสาร PDF"
                      >
                        <Download size={12} className="shrink-0" />
                        <span className="truncate">{req.documentName}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">ไม่ต้องแนบเอกสาร (บุคคลธรรมดา)</span>
                    )}
                  </TableCell>

                  <TableCell className="px-3 py-4 text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs border h-auto",
                        req.status === "approved"
                          ? "bg-success-50 text-success-500 border-success-100"
                          : req.status === "rejected"
                            ? "bg-error-50 text-error-500 border-error-100"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                      )}
                    >
                      {req.status === "approved" && <CheckCircle size={10} />}
                      {req.status === "rejected" && <Ban size={10} />}
                      {req.status === "pending" && <Clock size={10} className="animate-spin" />}
                      {req.status === "approved" ? "อนุมัติแล้ว" : req.status === "rejected" ? "ปฏิเสธแล้ว" : "รอตรวจสอบ"}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4 pl-3 pr-6 text-center">
                    {req.status === "pending" ? (
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateRequestStatus(req.id, "rejected")}
                          className="h-8 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-[7px] px-3 cursor-pointer"
                        >
                          ปฏิเสธ
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateRequestStatus(req.id, "approved")}
                          className="h-8 text-xs font-bold bg-[#f26522] hover:bg-[#d8561d] text-white rounded-[7px] px-3 cursor-pointer shadow-sm shadow-[#f26522]/15"
                        >
                          อนุมัติ
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">ดำเนินการพิจารณาเสร็จสิ้น</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-slate-400 font-bold">
                  ไม่มีคำร้องขอต่ออายุสัญญาที่ค้างรอพิจารณาในระบบ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
