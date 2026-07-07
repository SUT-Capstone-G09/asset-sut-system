import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { EnvelopPayment } from "../../types/envelop";
import { StatusBadge } from "./StatusBadge";
import { TABLE_HEADERS } from "../../types/constants";

interface PaymentTableProps {
  payments: EnvelopPayment[];
  selected: EnvelopPayment | null;
  onSelect: (payment: EnvelopPayment) => void;
}

export function PaymentTable({ payments, selected, onSelect }: PaymentTableProps) {
  return (
    <div className="rounded-sm border border-slate-100 bg-white shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {TABLE_HEADERS.map((h) => (
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
                  onClick={() => onSelect(p)}
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
  );
}
