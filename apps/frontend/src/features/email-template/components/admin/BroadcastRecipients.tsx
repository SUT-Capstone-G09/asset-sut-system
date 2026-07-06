"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getBroadcastRecipients } from "../../services/email-broadcast.service";
import type { BroadcastCounts, BroadcastRecipient, OutboxStatus } from "../../types";

type FilterKey = "failed" | "sent" | "all";

const STATUS_META: Record<
  OutboxStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  sent: { label: "ส่งแล้ว", icon: CheckCircle2, className: "text-green-600" },
  failed: { label: "ล้มเหลว", icon: XCircle, className: "text-red-600" },
  pending: { label: "รอส่ง", icon: Clock, className: "text-amber-600" },
  sending: { label: "กำลังส่ง", icon: Loader2, className: "text-amber-600" },
};

export default function BroadcastRecipients({
  broadcastId,
  counts,
  totalRecipients,
  refreshKey,
}: {
  broadcastId: number;
  counts: BroadcastCounts;
  totalRecipients: number;
  // Bump to refetch while the broadcast is still being delivered.
  refreshKey: number;
}) {
  // Default to the failures — that is the reason an admin opens this view.
  const [filter, setFilter] = useState<FilterKey>(counts.failed > 0 ? "failed" : "all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Results are tagged with the filter context they answer for, so loading can be
  // derived during render (no synchronous setState in the effect). A refreshKey
  // bump within the same filter keeps the stale rows on screen — no skeleton flash.
  const ctxKey = `${broadcastId}:${filter}`;
  const [result, setResult] = useState<{ ctx: string; rows: BroadcastRecipient[] } | null>(null);

  useEffect(() => {
    let ignore = false;
    const status = filter === "all" ? undefined : filter;
    getBroadcastRecipients(broadcastId, status)
      .then((res) => {
        if (!ignore) {
          setResult({ ctx: `${broadcastId}:${filter}`, rows: res });
          setError(null);
        }
      })
      .catch((e) => {
        if (!ignore) setError(e instanceof Error ? e.message : "โหลดรายชื่อไม่สำเร็จ");
      });
    return () => {
      ignore = true;
    };
  }, [broadcastId, filter, refreshKey]);

  const rows = useMemo(
    () => (result?.ctx === ctxKey ? result.rows : []),
    [result, ctxKey],
  );
  const loading = result?.ctx !== ctxKey && !error;

  const tabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "failed", label: "ล้มเหลว", count: counts.failed },
    { key: "sent", label: "ส่งแล้ว", count: counts.sent },
    { key: "all", label: "ทั้งหมด", count: totalRecipients },
  ];

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.to_email.toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-7 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800">รายชื่อผู้รับ</h3>
      <p className="mt-0.5 text-sm text-gray-400">
        ตรวจสอบสถานะการส่งรายคน — ดูว่าใครยังไม่ได้รับอีเมลและเพราะอะไร
      </p>

      {/* Filter tabs */}
      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = filter === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40",
                active
                  ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs font-medium",
                  active ? "bg-brand-primary/20" : "bg-gray-100 text-gray-500",
                  t.key === "failed" && t.count > 0 && !active && "bg-red-50 text-red-600",
                )}
              >
                {t.count.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search by email */}
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาอีเมล..."
          aria-label="ค้นหาอีเมลผู้รับ"
          className="h-10 pl-9"
        />
      </div>

      {/* List */}
      <div className="mt-4">
        {error ? (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : loading ? (
          <div className="space-y-2" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-400">
            {search.trim()
              ? `ไม่พบอีเมลที่ตรงกับ "${search.trim()}"`
              : filter === "failed"
                ? "ไม่มีผู้รับที่ส่งล้มเหลว 🎉"
                : "ไม่มีรายชื่อในกลุ่มนี้"}
          </p>
        ) : (
          <ul className="max-h-[28rem] divide-y divide-gray-50 overflow-y-auto rounded-lg border border-gray-100">
            {visible.map((r) => {
              const meta = STATUS_META[r.status];
              const Icon = meta.icon;
              return (
                <li key={r.id} className="flex items-start gap-3 px-4 py-3">
                  <Icon
                    className={cn(
                      "mt-0.5 h-5 w-5 shrink-0",
                      meta.className,
                      r.status === "sending" && "animate-spin",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm text-gray-800">{r.to_email}</span>
                      <span className={cn("shrink-0 text-xs font-medium", meta.className)}>
                        {meta.label}
                      </span>
                    </div>
                    {r.status === "failed" && r.last_error && (
                      <p className="mt-1 break-words text-xs text-red-500">
                        สาเหตุ: {r.last_error}
                        {r.attempts > 0 && ` (ลองส่ง ${r.attempts} ครั้ง)`}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
