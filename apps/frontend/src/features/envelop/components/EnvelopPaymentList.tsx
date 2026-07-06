"use client";

import { useState } from "react";
import { Eye, X } from "lucide-react";
import { mockEnvelopPayments } from "../data/envelop";
import { EnvelopPayment } from "../types/envelop";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { StatusBadge } from "./PaymentList/StatusBadge";
import { DetailPanel } from "./PaymentList/DetailPanel";
import { PaymentTable } from "./PaymentList/PaymentTable";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPaidAt(): string {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  return `วันนี้ เวลา ${h}:${m} น.`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EnvelopPaymentList() {
  const [payments, setPayments] = useState<EnvelopPayment[]>(mockEnvelopPayments);
  const [selected, setSelected] = useState<EnvelopPayment | null>(null);

  /** อัปเดต payments list และ selected พร้อมกันด้วย patch เดียว */
  const updatePayment = (id: string, patch: Partial<EnvelopPayment>) => {
    const apply = (p: EnvelopPayment) => (p.id === id ? { ...p, ...patch } : p);
    setPayments((prev) => prev.map(apply));
    setSelected((prev) => (prev?.id === id ? apply(prev) : prev));
  };

  const handleApprove = (id: string) =>
    updatePayment(id, { status: "paid", paidAt: formatPaidAt() });

  const handleReject = (id: string, reason: string) =>
    updatePayment(id, { status: "rejected", rejectionReason: reason });

  return (
    <>
      {/* Table */}
      <PaymentTable
        payments={payments}
        selected={selected}
        onSelect={setSelected}
      />

      {/* Slide-in Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
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

              {/* Status Badge */}
              {selected && <StatusBadge status={selected.status} />}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelected(null)}
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
