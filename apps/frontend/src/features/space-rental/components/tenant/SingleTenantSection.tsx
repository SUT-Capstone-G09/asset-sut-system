"use client";

import React, { useMemo, useState } from "react";
import { Calendar, User, CreditCard, FileText, Hash, Phone, Percent, ShieldCheck } from "lucide-react";
import { RentalSpace } from "@/features/space-rental/types/rental-space";
import { generateMockTenants, MockContract } from "@/features/space-rental/data/mock-tenants";
import { tenantAreaOptions } from "@/features/space-rental/data/tenant-areas";
import { HighlightCard } from "../shared/HighlightCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SingleTenantSectionProps {
  location: RentalSpace;
  onCreateContractClick?: () => void;
}

export default function SingleTenantSection({ 
  location,
  onCreateContractClick
}: SingleTenantSectionProps) {
  const [selectedContract, setSelectedContract] = useState<MockContract | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Load all mock tenants deterministic list
  const allTenants = useMemo(() => {
    return tenantAreaOptions.flatMap((area) =>
      generateMockTenants(area.id, area.subLocations)
    );
  }, []);

  // Find matching tenant based on tenantName in RentalSpace
  const tenant = useMemo(() => {
    if (!location.tenantName || location.tenantName === "-") return null;
    return allTenants.find((t) => t.name === location.tenantName) || null;
  }, [location.tenantName, allTenants]);

  const handleViewPdf = (contract: MockContract) => {
    setSelectedContract(contract);
    setIsPdfModalOpen(true);
  };

  if (!location.tenantName || location.tenantName === "-") {
    return (
      <div className="rounded-[7px] border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
        <p className="text-[13px] font-bold text-slate-400">ยังไม่มีการทำสัญญา (พื้นที่ว่าง)</p>
        <p className="text-[10px] text-slate-400 mt-1">สามารถทำการเพิ่มข้อมูลผู้เช่าได้โดยการมอบสิทธิ์ผู้ประกอบการ</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards & Main Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 h-full flex flex-col gap-3">
          <HighlightCard
            icon={Calendar}
            label="สิ้นสุดสัญญา"
            value={location.contractEndDate || "ไม่มีสัญญา"}
            subValue="วันหมดอายุ"
            theme="amber"
            className="w-full flex-1"
          />
          {tenant?.deposit && (
            <HighlightCard
              icon={ShieldCheck}
              label="เงินประกันสัญญา"
              value={`${tenant.deposit.toLocaleString()} ฿`}
              subValue="ค้ำประกันความเสียหาย"
              theme="blue"
              className="w-full flex-1"
            />
          )}
        </div>

        <div className="md:col-span-2 rounded-[7px] border border-slate-100 bg-[#f26522]/5 p-5 space-y-4 flex flex-col justify-between">
          {/* Row 1: Tenant & Owner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                ผู้ประกอบการ / ร้านค้า
              </span>
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-[4px] bg-white flex items-center justify-center border border-[#f26522]/10 shrink-0">
                  <User size={12} className="text-[#f26522]" />
                </div>
                <span className="text-[13px] font-bold text-slate-700 truncate">
                  {location.tenantName}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                เจ้าของสิทธิ์ / ผู้แทน
              </span>
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-[4px] bg-white flex items-center justify-center border border-[#f26522]/10 shrink-0">
                  <User size={12} className="text-[#f26522]" />
                </div>
                <span className="text-[13px] font-bold text-slate-700">
                  {tenant?.ownerName || "ไม่ระบุ"}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Row 2: Contact & Tax ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                เบอร์โทรศัพท์ติดต่อ
              </span>
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-[4px] bg-white flex items-center justify-center border border-[#f26522]/10 shrink-0">
                  <Phone size={12} className="text-[#f26522]" />
                </div>
                <span className="text-[13px] font-bold text-slate-700 truncate">
                  {tenant?.phone || "ไม่ระบุ"}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                เลขประจำตัวผู้เสียภาษี
              </span>
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-[4px] bg-white flex items-center justify-center border border-[#f26522]/10 shrink-0">
                  <CreditCard size={12} className="text-[#f26522]" />
                </div>
                <span className="text-[13px] font-bold text-slate-700">
                  {tenant?.taxId || "ไม่ระบุ"}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Row 3: Current Contract Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                ชื่อสัญญา / ประเภท
              </span>
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-[4px] bg-white flex items-center justify-center border border-[#f26522]/10 shrink-0">
                  <FileText size={12} className="text-[#f26522]" />
                </div>
                <span className="text-[13px] font-bold text-slate-700 truncate">
                  {location.contractName || "สัญญาจัดสรรพื้นที่เชิงพาณิชย์"}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                เลขที่สัญญาปัจจุบัน
              </span>
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-[4px] bg-white flex items-center justify-center border border-[#f26522]/10 shrink-0">
                  <Hash size={12} className="text-[#f26522]" />
                </div>
                <span className="text-[13px] font-bold text-slate-700 font-mono">
                  {location.contractNumber || "ไม่ระบุ"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contract History Section */}
      {tenant && tenant.contracts && tenant.contracts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FileText size={14} className="text-[#f26522]" />
            ประวัติการทำสัญญาเช่าพื้นที่ ({tenant.contracts.length})
          </h4>

          <div className="overflow-hidden border border-slate-100 rounded-[7px] bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                  <th className="px-4 py-3">เลขที่สัญญา</th>
                  <th className="px-4 py-3">ระยะเวลาเช่า</th>
                  <th className="px-4 py-3 text-right">ค่าเช่า / เดือน</th>
                  <th className="px-4 py-3 text-center">สถานะ</th>
                  <th className="px-4 py-3 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {tenant.contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">
                      {c.contractNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {c.startDate} ถึง {c.endDate}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-700">
                      {c.monthlyRental.toLocaleString()} ฿
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide",
                          c.status === "active" && "bg-emerald-50 text-emerald-600",
                          c.status === "expiring" && "bg-amber-50 text-amber-600",
                          c.status === "expired" && "bg-slate-100 text-slate-500",
                          c.status === "terminated" && "bg-rose-50 text-rose-600"
                        )}
                      >
                        {c.status === "active" && "กำลังใช้งาน"}
                        {c.status === "expiring" && "ใกล้หมดอายุ"}
                        {c.status === "expired" && "หมดสัญญาแล้ว"}
                        {c.status === "terminated" && "ยกเลิกสัญญา"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleViewPdf(c)}
                        className="text-[11px] font-bold text-[#f26522] hover:text-[#d8561d] transition-colors"
                      >
                        ดูเอกสารสัญญา
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PDF Simulation Viewer Dialog (z-index 130 overlay to display over drawer Sheet) */}
      <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
        <DialogContent className="!z-[130] sm:max-w-2xl bg-white max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-xl border border-slate-200 shadow-2xl">
          <DialogHeader className="px-6 py-4 border-b border-slate-100 shrink-0">
            <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileText size={18} className="text-[#f26522]" />
              ตัวอย่างเอกสารสัญญาจัดสรรพื้นที่เชิงพาณิชย์
            </DialogTitle>
          </DialogHeader>

          {/* Paper Document Simulation Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-100 flex justify-center">
            <div className="bg-white w-full max-w-[600px] border border-slate-200 p-8 sm:p-12 shadow-sm rounded-sm font-serif text-[13px] text-slate-800 space-y-6 leading-relaxed relative overflow-hidden min-h-[700px]">
              {/* SUT Header Simulation */}
              <div className="text-center space-y-2 pb-6 border-b border-double border-slate-300">
                <div className="w-12 h-12 rounded-full border-2 border-[#f26522] flex items-center justify-center mx-auto mb-2 bg-[#f26522]/5">
                  <span className="font-sans font-black text-sm text-[#f26522]">SUT</span>
                </div>
                <h3 className="text-base font-bold uppercase tracking-wide">มหาวิทยาลัยเทคโนโลยีสุรนารี</h3>
                <p className="text-[10px] text-slate-500 font-sans tracking-widest uppercase">Suranaree University of Technology</p>
                <p className="text-[11px] font-bold mt-2 font-sans">หนังสือสัญญาอนุญาตประกอบการค้าในพื้นที่มหาวิทยาลัย</p>
                <p className="text-[11px] font-sans">เลขที่สัญญา: <span className="font-mono">{selectedContract?.contractNumber}</span></p>
              </div>

              {/* Document Text */}
              <div className="space-y-4 text-justify">
                <p className="indent-12">
                  สัญญาฉบับนี้ทำขึ้น ณ มหาวิทยาลัยเทคโนโลยีสุรนารี ตั้งอยู่เลขที่ 111 ถนนมหาวิทยาลัย ตำบลสุรนารี อำเภอเมืองนครราชสีมา จังหวัดนครราชสีมา ระหว่าง <b>มหาวิทยาลัยเทคโนโลยีสุรนารี</b> ซึ่งต่อไปในสัญญานี้เรียกว่า "ผู้อนุญาต" ฝ่ายหนึ่ง กับ <b>{location.tenantName}</b> โดยมี <b>{tenant?.ownerName}</b> เป็นผู้แทนผู้รับอนุญาต ซึ่งต่อไปในสัญญานี้เรียกว่า "ผู้รับอนุญาต" อีกฝ่ายหนึ่ง
                </p>

                <p className="indent-12">
                  คู่สัญญาได้ตกลงข้อตกลงในการอนุญาตให้ประกอบกิจการในพื้นที่ส่วนงานเชิงพาณิชย์ โดยมีรายละเอียดข้อตกลงสำคัญดังต่อไปนี้:
                </p>

                <ol className="list-decimal pl-6 space-y-2">
                  <li>
                    <b>พื้นที่จัดสรร</b>: ผู้อนุญาตยินยอมให้ผู้รับอนุญาตเข้าใช้ประโยชน์ในพื้นที่ <b>{location.name} (รหัสห้อง {location.roomNumber})</b> ขนาดพื้นที่ประมาณ <b>{location.size}</b> เพื่อจัดทำและประกอบกิจการประเภท <b>{tenant?.businessType || "อาหารและเครื่องดื่ม"}</b> เท่านั้น
                  </li>
                  <li>
                    <b>ระยะเวลาสัญญา</b>: สัญญาฉบับนี้มีผลบังคับใช้นับตั้งแต่วันที่ <b>{selectedContract?.startDate}</b> และสิ้นสุดลงในวันที่ <b>{selectedContract?.endDate}</b> รวมระยะเวลากำหนดในสัญญา
                  </li>
                  <li>
                    <b>ผลประโยชน์และค่าเช่าพื้นที่</b>: ผู้รับอนุญาตตกลงที่จะชำระเงินค่าเช่ารายเดือนให้แก่ผู้อนุญาตในอัตราเดือนละ <b>{selectedContract?.monthlyRental.toLocaleString()} บาท (สามีไม่รวมภาษีมูลค่าเพิ่ม)</b> โดยกำหนดชำระภายในวันที่ 5 ของทุกเดือน
                  </li>
                  <li>
                    <b>หลักประกันสัญญา</b>: ในวันทำสัญญานี้ ผู้รับอนุญาตได้นำหลักประกันเป็นเงินสดจำนวน <b>{tenant?.deposit?.toLocaleString()} บาท</b> มอบให้แก่ผู้อนุญาตเพื่อค้ำประกันการปฏิบัติตามสัญญา
                  </li>
                  <li>
                    <b>ข้อบังคับการรักษาความสะอาด</b>: ผู้รับอนุญาตตกลงที่จะดูแลและรักษาความสะอาดพื้นที่ประกอบการ ตลอดจนปฏิบัติตามกฎระเบียบว่าด้วยสุขาภิบาลสิ่งแวดล้อมของมหาวิทยาลัยฯ อย่างเคร่งครัด
                  </li>
                </ol>

                <p className="indent-12">
                  หนังสือสัญญาฉบับนี้ทำขึ้นเป็นสองฉบับมีข้อความถูกต้องตรงกัน คู่สัญญาได้อ่านและเข้าใจข้อความโดยละเอียดตลอดแล้ว จึงได้ลงลายมือชื่อไว้เป็นสำคัญต่อหน้าพยาน
                </p>
              </div>

              {/* Signature Blocks */}
              <div className="pt-12 grid grid-cols-2 gap-8 text-center font-sans text-xs">
                <div className="space-y-4">
                  <p>ลงชื่อ...................................................... ผู้อนุญาต</p>
                  <p className="text-slate-500">( อธิการบดีมหาวิทยาลัยเทคโนโลยีสุรนารี )</p>
                </div>
                <div className="space-y-4">
                  <p>ลงชื่อ...................................................... ผู้รับอนุญาต</p>
                  <p className="text-slate-500">( {tenant?.ownerName} )</p>
                </div>
              </div>

              {/* Watermark simulation */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                <span className="text-[120px] font-sans font-black rotate-45 select-none tracking-widest text-[#f26522]">SUT</span>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
            <button
              onClick={() => setIsPdfModalOpen(false)}
              className="px-5 py-2 rounded-[7px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all"
            >
              ปิดหน้าต่างเอกสาร
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
