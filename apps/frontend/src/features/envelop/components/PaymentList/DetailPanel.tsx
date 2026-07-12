"use client";

import { useRef, useState } from "react";
import {
  CheckCircle2, XCircle, Circle, CheckCheck, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EnvelopPayment } from "../../types/envelop";
import { CHECKLIST_ITEMS } from "../../types/constants";
import { toast } from "sonner";
import { ReceiptSection } from "./ReceiptSection";

// ─── Shared UI Atoms ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{children}</p>
  );
}

function Spinner({ className }: { className?: string }) {
  return <span className={cn("size-4 rounded-full border-2 animate-spin", className)} />;
}

// ─── InfoRow ─────────────────────────────────────────────────────────────────

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

// ─── DetailPanel ─────────────────────────────────────────────────────────────

export interface DetailPanelProps {
  payment: EnvelopPayment;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export function DetailPanel({ payment, onApprove, onReject }: DetailPanelProps) {
  const [checked, setChecked] = useState<boolean[]>(CHECKLIST_ITEMS.map(() => false));
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const allChecked = checked.every(Boolean);
  const canApprove = allChecked && payment.status === "payment_submitted";

  const toggle = (i: number) =>
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  const handleApprove = async () => {
    setLoading("approve");
    await new Promise((r) => setTimeout(r, 800));
    onApprove(payment.id);
    toast.success("อนุมัติการชำระเงินเรียบร้อยแล้ว");
    setLoading(null);
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    setLoading("reject");
    await new Promise((r) => setTimeout(r, 600));
    onReject(payment.id, reason.trim());
    toast.error("ปฏิเสธคำขอเรียบร้อยแล้ว");
    setLoading(null);
    setShowReject(false);
    setReason("");
  };

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

      {/* Slip */}
      <div>
        <div className="flex items-center mb-2">
          <SectionLabel>สลิปการโอน</SectionLabel>
        </div>
        <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
          {payment.slipUrl ? (
            <img src={payment.slipUrl} alt="slip" className="h-full object-contain rounded-lg" />
          ) : (
            "ไม่มีสลิปแนบ"
          )}
        </div>
      </div>

      {/* Receipt Upload */}
      <ReceiptSection
        receiptFile={receiptFile}
        receiptUrl={payment.receiptUrl}
        onFileChange={setReceiptFile}
      />

      {/* Checklist & Actions — แสดงเฉพาะสถานะ รอตรวจสอบ */}
      {payment.status === "payment_submitted" && (
        <>
          {/* Checklist */}
          <div>
            <div className="flex items-center mb-2">
              <SectionLabel>Checklist ก่อนอนุมัติ</SectionLabel>
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
              <p className="mt-2 text-[11px] text-amber-600">* ต้องติ๊กครบทุกข้อก่อนกดอนุมัติ</p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            {/* Reject */}
            <div className="space-y-2">
              <button
                onClick={() => setShowReject((v) => !v)}
                disabled={loading !== null}
                className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                <XCircle size={16} />
                {showReject ? "ยกเลิก" : "ปฏิเสธคำขอ"}
              </button>

              {showReject && (
                <div className="space-y-2 rounded-xl border border-red-100 bg-red-50/40 p-3">
                  <p className="text-[11px] font-bold text-red-400 uppercase tracking-widest">ระบุเหตุผลการปฏิเสธ</p>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="ระบุเหตุผลการปฏิเสธ..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                  <button
                    onClick={handleReject}
                    disabled={!reason.trim() || loading !== null}
                    className="w-full rounded-lg bg-red-500 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading === "reject" ? (
                      <>
                        <Spinner className="border-white/40 border-t-white" />
                        กำลังดำเนินการ...
                      </>
                    ) : (
                      <>
                        <XCircle size={15} />
                        ยืนยันการปฏิเสธ
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Approve */}
            <button
              onClick={handleApprove}
              disabled={!canApprove || loading !== null}
              title={!allChecked ? "ต้องติ๊ก Checklist ครบก่อน" : ""}
              className={cn(
                "w-full rounded-lg py-2.5 text-sm font-bold text-white transition-all flex items-center justify-center gap-2",
                canApprove && loading === null
                  ? "bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-200"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              )}
            >
              {loading === "approve" ? (
                <>
                  <Spinner className="border-slate-300/40 border-t-slate-500" />
                  กำลังอนุมัติ...
                </>
              ) : (
                <>
                  <CheckCheck size={15} />
                  อนุมัติการชำระเงิน
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
