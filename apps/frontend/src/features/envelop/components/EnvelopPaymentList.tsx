"use client";

import { useRef, useState } from "react";
import { Eye, CheckCircle2, XCircle, Circle, X, Upload, FileText, CheckCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockEnvelopPayments } from "../data/envelop";
import { EnvelopPayment, PaymentStatus } from "../types/envelop";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

// ─── Status Badge ────────────────────────────────────────────────────────────

const statusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  pending_payment: { label: "รอชำระ", className: "bg-slate-100 text-slate-600" },
  payment_submitted: { label: "รอตรวจสอบ", className: "bg-amber-100 text-amber-700" },
  paid: { label: "จ่ายแล้ว", className: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "ปฏิเสธ", className: "bg-red-100 text-red-600" },
  cancelled: { label: "ยกเลิก", className: "bg-red-100 text-red-600" },
  expired: { label: "หมดอายุ", className: "bg-slate-100 text-slate-600" },
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold", cfg.className)}>
      {cfg.label}
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

// ─── Toast Banner ────────────────────────────────────────────────────────────

type ToastType = "success" | "error";

function ToastBanner({ type, message }: { type: ToastType; message: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold animate-in slide-in-from-top-2 duration-300",
        type === "success"
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-red-50 text-red-700 border border-red-200"
      )}
    >
      {type === "success" ? (
        <CheckCheck size={16} className="shrink-0 text-emerald-500" />
      ) : (
        <AlertCircle size={16} className="shrink-0 text-red-500" />
      )}
      {message}
    </div>
  );
}

// ─── Detail Panel (content) ──────────────────────────────────────────────────

interface DetailPanelProps {
  payment: EnvelopPayment;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

function DetailPanel({ payment, onApprove, onReject }: DetailPanelProps) {
  const [checked, setChecked] = useState<boolean[]>(CHECKLIST_ITEMS.map(() => false));
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const allChecked = checked.every(Boolean);
  const canApprove = allChecked && payment.status === "payment_submitted";

  const toggle = (i: number) =>
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    if (file.type === "application/pdf") {
      setReceiptPreview("pdf");
    } else {
      const url = URL.createObjectURL(file);
      setReceiptPreview(url);
    }
  };

  const handleRemoveReceipt = () => {
    if (receiptPreview && receiptPreview !== "pdf") URL.revokeObjectURL(receiptPreview);
    setReceiptFile(null);
    setReceiptPreview(null);
    if (receiptInputRef.current) receiptInputRef.current.value = "";
  };

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async () => {
    setLoading("approve");
    // Simulate async API call
    await new Promise((r) => setTimeout(r, 800));
    onApprove(payment.id);
    showToast("success", "อนุมัติการชำระเงินเรียบร้อยแล้ว");
    setLoading(null);
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    setLoading("reject");
    await new Promise((r) => setTimeout(r, 600));
    onReject(payment.id, reason.trim());
    showToast("error", "ปฏิเสธคำขอเรียบร้อยแล้ว");
    setLoading(null);
    setShowReject(false);
    setReason("");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Toast */}
      {toast && <ToastBanner type={toast.type} message={toast.message} />}

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

      {/* Slip */}
      <div>
        <div className="flex items-center mb-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">สลิปการโอน</p>
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
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">ใบเสร็จรับเงิน</p>
          {receiptFile && (
            <button
              type="button"
              onClick={handleRemoveReceipt}
              className="text-[10px] font-semibold text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <X size={11} /> ลบไฟล์
            </button>
          )}
        </div>

        {receiptPreview ? (
          receiptPreview === "pdf" ? (
            <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 gap-2">
              <FileText size={28} className="text-purple-400" />
              <p className="text-[11px] text-slate-600 font-medium max-w-[90%] truncate">{receiptFile?.name}</p>
              <p className="text-[10px] text-slate-400">{receiptFile ? (receiptFile.size / 1024 / 1024).toFixed(2) + " MB" : ""}</p>
            </div>
          ) : (
            <div className="relative h-32 rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
              <img src={receiptPreview} alt="receipt preview" className="w-full h-full object-contain" />
            </div>
          )
        ) : payment.receiptUrl ? (
          <div className="relative h-32 rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
            <img src={payment.receiptUrl} alt="receipt" className="w-full h-full object-contain" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => receiptInputRef.current?.click()}
            className="flex h-32 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400 transition-all hover:border-purple-300 hover:bg-purple-50/30 group gap-2"
          >
            <Upload size={18} className="text-slate-300 group-hover:text-purple-400 transition-colors" />
            <div className="text-center">
              <p className="font-semibold text-slate-500 group-hover:text-purple-600 transition-colors">คลิกเพื่ออัปโหลดใบเสร็จ</p>
              <p className="text-slate-400 mt-0.5">PDF, PNG, JPG · ไม่เกิน 10MB</p>
            </div>
          </button>
        )}

        {receiptFile && (
          <button
            type="button"
            onClick={() => receiptInputRef.current?.click()}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-slate-200 text-[11px] text-slate-400 hover:border-purple-300 hover:text-purple-500 transition-all"
          >
            <Upload size={12} /> เปลี่ยนไฟล์
          </button>
        )}

        <input
          ref={receiptInputRef}
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleReceiptChange}
        />
      </div>

      {/* Checklist — แสดงเฉพาะสถานะ รอตรวจสอบ */}
      {payment.status === "payment_submitted" && (
        <div>
          <div className="flex items-center mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Checklist ก่อนอนุมัติ
            </p>
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
      {payment.status === "payment_submitted" && (
        <div className="space-y-3 border-t border-slate-100 pt-4">

          {/* Reject section */}
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
                      <span className="size-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
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
                <span className="size-4 rounded-full border-2 border-slate-300/40 border-t-slate-500 animate-spin" />
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
  const [payments, setPayments] = useState<EnvelopPayment[]>(mockEnvelopPayments);
  const [selected, setSelected] = useState<EnvelopPayment | null>(null);

  const handleClose = () => setSelected(null);

  const handleApprove = (id: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} น.`;
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: "paid" as const, paidAt: `วันนี้ เวลา ${timeStr}` }
          : p
      )
    );
    // Update selected to reflect new status
    setSelected((prev) =>
      prev?.id === id
        ? { ...prev, status: "paid" as const, paidAt: `วันนี้ เวลา ${timeStr}` }
        : prev
    );
  };

  const handleReject = (id: string, reason: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: "rejected" as const, rejectionReason: reason }
          : p
      )
    );
    setSelected((prev) =>
      prev?.id === id
        ? { ...prev, status: "rejected" as const, rejectionReason: reason }
        : prev
    );
  };

  return (
    <>
      {/* Table */}
      <div className="rounded-sm border border-slate-100 bg-white shadow-sm overflow-hidden">
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
            {payments.map((p) => (
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

      {/* Slide-in Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:max-w-[480px] p-0 border-none bg-white flex flex-col h-full shadow-2xl"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-[7px] bg-[#E9652B]/10 flex items-center justify-center shrink-0">
                  <Eye size={20} className="text-[#E9652B]" strokeWidth={2.5} />
                </div>
                <div>
                  <SheetTitle className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                    รายละเอียดการชำระเงิน
                  </SheetTitle>
                  <SheetDescription className="text-xs text-slate-400 mt-0.5">
                    {selected?.ref} · {selected?.tenantName}
                  </SheetDescription>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className="size-9 rounded-[7px] bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center group"
              >
                <X size={18} className="transition-transform group-hover:rotate-90" />
              </button>
            </SheetHeader>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {selected && (
                <DetailPanel
                  key={selected.id}
                  payment={selected}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
