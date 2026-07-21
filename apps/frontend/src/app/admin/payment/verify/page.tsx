"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getAllPayments,
  verifyPayment,
  PaymentTransactionDTO,
} from "@/features/payment/services/payment.service";
import AdminPaymentVerificationModal from "@/features/payment/component/admin/AdminPaymentVerificationModal";

type StatusFilter = "all" | "pending" | "confirmed" | "rejected";

const STATUS_STYLE: Record<
  string,
  { label: string; className: string }
> = {
  pending: { label: "รอตรวจสอบ", className: "bg-orange-100 text-orange-600" },
  slip_uploaded: { label: "อัปโหลดสลิปแล้ว", className: "bg-blue-100 text-blue-600" },
  auto_verified: { label: "ตรวจอัตโนมัติผ่าน", className: "bg-teal-100 text-teal-600" },
  mismatch: { label: "ข้อมูลไม่ตรง", className: "bg-amber-100 text-amber-600" },
  confirmed: { label: "อนุมัติแล้ว", className: "bg-green-100 text-green-600" },
  rejected: { label: "ปฏิเสธ", className: "bg-red-100 text-red-500" },
};

// "pending"/"slip_uploaded"/"auto_verified"/"mismatch" are all non-terminal
// states awaiting a staff decision; group them under the "pending" filter tab.
const NON_TERMINAL_STATUSES = ["pending", "slip_uploaded", "auto_verified", "mismatch"];

export default function AdminPaymentVerifyPage() {
  const [payments, setPayments] = useState<PaymentTransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [actioning, setActioning] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransactionDTO | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getAllPayments()
      .then((data) => setPayments(data ?? []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
    }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleVerify = useCallback(
    async (id: number, statusId: number) => {
      setActioning(id);
      try {
        const updated = await verifyPayment(id, { status_id: statusId });
        setPayments((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
        );
      } catch {
        // keep existing state on error
      } finally {
        setActioning(null);
      }
    },
    []
  );

  const filtered = payments.filter((p) => {
    if (filter === "all") return true;
    if (filter === "pending") return NON_TERMINAL_STATUSES.includes(p.status);
    return p.status === filter;
  });

  const stats = {
    total: payments.length,
    pending: payments.filter((p) => NON_TERMINAL_STATUSES.includes(p.status)).length,
    confirmed: payments.filter((p) => p.status === "confirmed").length,
    rejected: payments.filter((p) => p.status === "rejected").length,
  };

  const filters: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "ทั้งหมด", count: stats.total },
    { key: "pending", label: "รอตรวจสอบ", count: stats.pending },
    { key: "confirmed", label: "อนุมัติแล้ว", count: stats.confirmed },
    { key: "rejected", label: "ปฏิเสธ", count: stats.rejected },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ตรวจสอบการชำระเงิน
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            อนุมัติหรือปฏิเสธหลักฐานการชำระเงินจากผู้ใช้
          </p>
        </div>
        <Button
          variant="outline"
          onClick={load}
          disabled={loading}
          className="gap-2 border-gray-200 text-gray-600"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          รีเฟรช
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="ทั้งหมด" value={stats.total} valueClass="text-gray-900" />
        <StatCard
          label="รอตรวจสอบ"
          value={stats.pending}
          valueClass="text-orange-500"
          dotClass="bg-orange-400"
        />
        <StatCard
          label="อนุมัติแล้ว"
          value={stats.confirmed}
          valueClass="text-green-500"
          dotClass="bg-green-400"
        />
        <StatCard
          label="ปฏิเสธ"
          value={stats.rejected}
          valueClass="text-red-500"
          dotClass="bg-red-400"
        />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                filter === f.key
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                  filter === f.key
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
            <Loader2 size={18} className="animate-spin" />
            กำลังโหลด...
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-400 text-sm">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3 w-[90px]">
                    #รายการ
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                    ผู้จอง
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                    ห้อง/สถานที่
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 w-[110px]">
                    จำนวนเงิน
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 w-[100px]">
                    วิธีชำระ
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 w-[140px]">
                    สถานะ
                  </th>
                  <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3 w-[160px]">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-16 text-center text-gray-400 text-sm"
                    >
                      ไม่มีรายการ
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <PaymentRow
                      key={p.id}
                      payment={p}
                      onClick={() => setSelectedPayment(p)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminPaymentVerificationModal
        open={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        payment={selectedPayment}
        onVerified={() => {
          load();
        }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  valueClass,
  dotClass,
}: {
  label: string;
  value: number;
  valueClass: string;
  dotClass?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-2">
        {dotClass && <span className={cn("w-2 h-2 rounded-full", dotClass)} />}
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      <p className={cn("text-4xl font-bold tabular-nums", valueClass)}>
        {String(value).padStart(2, "0")}
        <span className="text-sm font-normal text-gray-400 ml-1.5">รายการ</span>
      </p>
    </div>
  );
}

function PaymentRow({
  payment,
  onClick,
}: {
  payment: PaymentTransactionDTO;
  onClick: () => void;
}) {
  const style = STATUS_STYLE[payment.status] ?? {
    label: payment.status,
    className: "bg-gray-100 text-gray-500",
  };
  const isPending = NON_TERMINAL_STATUSES.includes(payment.status);

  return (
    <tr 
      onClick={onClick}
      className="hover:bg-gray-50/60 transition-colors cursor-pointer group"
    >
      <td className="px-6 py-4 align-middle">
        <div className="flex flex-col">
          <span className="text-xs font-mono text-gray-400 group-hover:text-brand-primary transition-colors">#{payment.id}</span>
          <span className="text-xs text-gray-400 mt-0.5">
            BK-{payment.booking_id}
          </span>
        </div>
      </td>

      <td className="px-4 py-4 align-middle">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
            <CreditCard size={14} className="text-brand-primary" />
          </div>
          <span className="text-sm text-gray-700 truncate max-w-[140px]">
            {payment.user_name || "–"}
          </span>
        </div>
      </td>

      <td className="px-4 py-4 align-middle">
        <span className="text-sm text-gray-700">
          {payment.location_name || "–"}
        </span>
      </td>

      <td className="px-4 py-4 align-middle text-right">
        <span className="text-sm font-semibold text-gray-800">
          ฿{payment.amount_paid.toLocaleString()}
        </span>
      </td>

      <td className="px-4 py-4 align-middle">
        <span className="text-sm text-gray-600 capitalize">
          {payment.method || "–"}
        </span>
      </td>

      <td className="px-4 py-4 align-middle">
        <span
          className={cn(
            "text-xs font-semibold px-2.5 py-1 rounded-full",
            style.className
          )}
        >
          {style.label}
        </span>
      </td>

      <td className="px-6 py-4 align-middle">
        <div className="flex items-center justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-brand-primary hover:text-brand-primary hover:bg-brand-primary/10 w-full"
          >
            {isPending ? "ตรวจสอบ" : "ดูรายละเอียด"}
          </Button>
        </div>
      </td>
    </tr>
  );
}
