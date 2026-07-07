import { cn } from "@/lib/utils";
import { PaymentStatus } from "../../types/envelop";

const statusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  pending_payment: { label: "รอชำระ", className: "bg-slate-100 text-slate-600" },
  payment_submitted: { label: "รอตรวจสอบ", className: "bg-amber-100 text-amber-700" },
  paid: { label: "จ่ายแล้ว", className: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "ปฏิเสธ", className: "bg-red-100 text-red-600" },
  cancelled: { label: "ยกเลิก", className: "bg-red-100 text-red-600" },
  expired: { label: "หมดอายุ", className: "bg-slate-100 text-slate-600" },
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold", cfg.className)}>
      {cfg.label}
    </span>
  );
}
