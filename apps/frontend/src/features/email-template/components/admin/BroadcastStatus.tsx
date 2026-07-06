"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { getBroadcast } from "../../services/email-broadcast.service";
import type { BroadcastSummary } from "../../types";
import BroadcastRecipients from "./BroadcastRecipients";

const POLL_MS = 3000;

function statusOf(b: BroadcastSummary) {
  const inFlight = b.counts.pending + b.counts.sending;
  if (inFlight > 0)
    return { label: "กำลังส่ง", className: "bg-amber-50 text-amber-700", spinner: true };
  if (b.counts.sent === 0 && b.counts.failed > 0)
    return { label: "ล้มเหลว", className: "bg-red-50 text-red-600", spinner: false };
  if (b.counts.failed > 0)
    return { label: "เสร็จ (บางส่วนล้มเหลว)", className: "bg-amber-50 text-amber-700", spinner: false };
  return { label: "สำเร็จ", className: "bg-green-50 text-green-700", spinner: false };
}

function BackLink() {
  return (
    <Link
      href="/admin/email-templates/broadcasts"
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
    >
      <ArrowLeft className="h-4 w-4" /> ประวัติการส่ง
    </Link>
  );
}

export default function BroadcastStatus({ id }: { id: number }) {
  const [b, setB] = useState<BroadcastSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const tick = async () => {
      try {
        const res = await getBroadcast(id);
        if (stopped) return;
        setB(res);
        // Keep polling only while some recipients are still in flight.
        if (res.counts.pending + res.counts.sending > 0) {
          timer = setTimeout(tick, POLL_MS);
        }
      } catch (e) {
        if (!stopped) setError(e instanceof Error ? e.message : "โหลดสถานะไม่สำเร็จ");
      }
    };

    tick();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <BackLink />
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!b) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <BackLink />
        <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-6" aria-hidden="true">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-2 w-full" />
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const done = b.counts.sent + b.counts.failed;
  const inFlight = b.counts.pending + b.counts.sending;
  const pct = b.total_recipients > 0 ? Math.round((done / b.total_recipients) * 100) : 0;
  const status = statusOf(b);

  const meta = [
    { icon: Tag, value: b.audience_desc },
    { icon: Users, value: `${b.total_recipients.toLocaleString()} คน` },
    { icon: Clock, value: b.created_at },
  ];

  const stats = [
    { label: "ส่งแล้ว", value: b.counts.sent, icon: CheckCircle2, className: "bg-green-50 text-green-700" },
    { label: "กำลังส่ง / รอ", value: inFlight, icon: Loader2, className: "bg-amber-50 text-amber-700" },
    { label: "ล้มเหลว", value: b.counts.failed, icon: XCircle, className: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <BackLink />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="rounded-xl border border-gray-100 bg-white p-7 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-gray-400">เทมเพลต</p>
            <h2 className="truncate text-xl font-semibold text-gray-800">{b.template_key}</h2>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
              status.className,
            )}
          >
            {status.spinner ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            {status.label}
          </span>
        </div>

        {/* Meta */}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
          {meta.map((m, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <m.icon className="h-4 w-4 text-gray-400" />
              {m.value}
            </span>
          ))}
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="mb-1.5 flex items-end justify-between">
            <span className="text-sm text-gray-500">ความคืบหน้า</span>
            <span className="text-2xl font-bold text-brand-primary">{pct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-brand-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
            {inFlight > 0 ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> ส่งแล้ว {done}/{b.total_recipients} ·
                อัปเดตอัตโนมัติ
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3 text-green-500" /> เสร็จสิ้น {done}/
                {b.total_recipients}
              </>
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((s) => (
            <div key={s.label} className={cn("rounded-xl p-4", s.className)}>
              <s.icon className="h-5 w-5 opacity-70" />
              <p className="mt-2 text-3xl font-bold">{s.value.toLocaleString()}</p>
              <p className="mt-0.5 text-xs opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
        </div>

        {/* Per-recipient delivery status */}
        <BroadcastRecipients
          broadcastId={b.id}
          counts={b.counts}
          totalRecipients={b.total_recipients}
          refreshKey={done}
        />
      </div>
    </div>
  );
}
