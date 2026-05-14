"use client";

import { useState } from "react";
import { Eye, CheckCircle2, XCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockEnvelopPayments } from "../data/envelop";
import { EnvelopPayment, PaymentStatus } from "../types/envelop";

// ─── Status Badge ────────────────────────────────────────────────────────────

const statusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  รอชำระ:     { label: "รอชำระ",     className: "bg-slate-100 text-slate-600" },
  รอตรวจสอบ: { label: "รอตรวจสอบ", className: "bg-amber-100 text-amber-700" },
  จ่ายแล้ว:  { label: "จ่ายแล้ว",  className: "bg-emerald-100 text-emerald-700" },
  ปฏิเสธ:    { label: "ปฏิเสธ",    className: "bg-red-100 text-red-600" },
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold", cfg.className)}>
      {cfg.label}
    </span>
  );
}

function RoleBadge({ role, className }: { role: string; className?: string }) {
  return (
    <span className={cn("ml-2 inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ring-1 ring-inset", className)}>
      {role}
    </span>
  );
}

// ─── Checklist ───────────────────────────────────────────────────────────────

const CHECKLIST_ITEMS = [
  "จำนวนเงินตรงกับที่กำหนด",
  "ชื่อผู้โอนตรงกับข้อมูลผู้เช่า",
  "วันที่โอนอยู่ในช่วงเวลาที่กำหนด",
  "สลิปชัดเจน อ่านได้ครบถ้วน",
  "อัปใบเสร็จแล้ว",
];

// ─── Detail Panel ────────────────────────────────────────────────────────────

function DetailPanel({ payment }: { payment: EnvelopPayment }) {
  const [checked, setChecked] = useState<boolean[]>(CHECKLIST_ITEMS.map(() => false));
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const allChecked = checked.every(Boolean);
  const canApprove = allChecked && payment.status === "รอตรวจสอบ";

  const toggle = (i: number) =>
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            REF {payment.ref}
          </p>
          <h3 className="mt-1 text-base font-bold text-slate-900">{payment.tenantName}</h3>
        </div>
        <StatusBadge status={payment.status} />
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4 text-sm">
        <InfoRow label="สถานที่" value={payment.location} />
        <InfoRow label="จำนวนเงิน" value={`${payment.amount.toLocaleString()} บาท`} />
        <InfoRow label="วันที่" value={payment.date} />
        {payment.paidAt && <InfoRow label="ชำระเมื่อ" value={payment.paidAt} />}
        {payment.rejectionReason && (
          <div className="col-span-2">
            <InfoRow label="เหตุผลปฏิเสธ" value={payment.rejectionReason} highlight="red" />
          </div>
        )}
      </div>

      {/* Slip placeholder */}
      <div>
        <div className="flex items-center mb-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">สลิปการโอน</p>
          <RoleBadge role="Tenant" className="bg-blue-50 text-blue-600 ring-blue-500/20" />
        </div>
        <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
          {payment.slipUrl ? (
            <img src={payment.slipUrl} alt="slip" className="h-full object-contain rounded-lg" />
          ) : (
            "ไม่มีสลิปแนบ"
          )}
        </div>
      </div>

      {/* Receipt placeholder */}
      <div>
        <div className="flex items-center mb-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">ใบเสร็จรับเงิน</p>
          <RoleBadge role="Admin Finance" className="bg-purple-50 text-purple-600 ring-purple-500/20" />
        </div>
        <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400 transition-colors hover:border-purple-300 hover:bg-purple-50/30 group cursor-pointer">
          {payment.receiptUrl ? (
            <img src={payment.receiptUrl} alt="receipt" className="h-full object-contain rounded-lg" />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Eye size={16} className="text-slate-300 group-hover:text-purple-400" />
              <span>คลิกเพื่ออัปโหลดใบเสร็จ</span>
            </div>
          )}
        </div>
      </div>

      {/* Checklist — แสดงเฉพาะสถานะ รอตรวจสอบ */}
      {payment.status === "รอตรวจสอบ" && (
        <div>
          <div className="flex items-center mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Checklist ก่อนอนุมัติ
            </p>
            <RoleBadge role="Admin Asset" className="bg-emerald-50 text-emerald-600 ring-emerald-500/20" />
          </div>
          <div className="space-y-2">
            {CHECKLIST_ITEMS.map((item, i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-50"
              >
                {checked[i] ? (
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
                ) : (
                  <Circle size={18} className="shrink-0 text-slate-300" />
                )}
                <span className={cn("text-sm", checked[i] ? "text-slate-800 font-medium" : "text-slate-500")}>
                  {item}
                </span>
              </button>
            ))}
          </div>
          {!allChecked && (
            <p className="mt-2 text-[11px] text-amber-600">
              * ต้องติ๊กครบทุกข้อก่อนกดอนุมัติ
            </p>
          )}
        </div>
      )}

      {/* Actions — แสดงเฉพาะสถานะ รอตรวจสอบ */}
      {payment.status === "รอตรวจสอบ" && (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          {/* Reject section */}
          <div className="space-y-2">
            <button
              onClick={() => setShowReject((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
            >
              <XCircle size={16} />
              {showReject ? "ยกเลิก" : "ปฏิเสธคำขอ"}
            </button>
            {showReject && (
              <div className="space-y-2">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="ระบุเหตุผลการปฏิเสธ..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                />
                <button
                  disabled={!reason.trim()}
                  className="w-full rounded-lg bg-red-500 py-2 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ยืนยันการปฏิเสธ
                </button>
              </div>
            )}
          </div>

          {/* Approve */}
          <button
            disabled={!canApprove}
            title={!allChecked ? "ต้องติ๊ก Checklist ครบก่อน" : ""}
            className={cn(
              "w-full rounded-lg py-2.5 text-sm font-bold text-white transition-all",
              canApprove
                ? "bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-200"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            ✓ อนุมัติการชำระเงิน
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: "red" }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={cn("text-sm font-medium", highlight === "red" ? "text-red-600" : "text-slate-800")}>
        {value}
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EnvelopPaymentList() {
  const [selected, setSelected] = useState<EnvelopPayment | null>(mockEnvelopPayments[0]);

  return (
    <div className="flex rounded-sm border border-slate-100 bg-white shadow-sm overflow-hidden">

      {/* Left: Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {["REF", "ผู้เช่า", "จำนวนเงิน", "วันที่", "สถานะ", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockEnvelopPayments.map((p) => (
              <tr
                key={p.id}
                className={cn(
                  "border-b border-slate-100 transition-colors",
                  selected?.id === p.id ? "bg-orange-50" : "hover:bg-slate-50/60"
                )}
              >
                <td className="px-4 py-3 text-xs font-mono font-semibold text-slate-500 whitespace-nowrap">
                  {p.ref}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-800 whitespace-nowrap">
                  {p.tenantName}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                  {p.amount.toLocaleString()} ฿
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                  {p.date}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => setSelected(p)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                      selected?.id === p.id
                        ? "bg-[#E9652B] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    <Eye size={13} />
                    ดู
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Divider */}
      <div className="w-px bg-slate-100 self-stretch shrink-0" />

      {/* Right: Detail Panel */}
      <div className="w-[420px] shrink-0 overflow-y-auto p-5">
        {selected ? (
          <DetailPanel key={selected.id} payment={selected} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            เลือกรายการเพื่อดูรายละเอียด
          </div>
        )}
      </div>

    </div>
  );
}
