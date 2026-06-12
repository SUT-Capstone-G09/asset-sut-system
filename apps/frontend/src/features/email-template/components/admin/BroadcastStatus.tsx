"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBroadcast } from "../../services/email-broadcast.service";
import type { BroadcastSummary } from "../../types";

const POLL_MS = 3000;

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
    return <div className="text-sm text-red-600">{error}</div>;
  }
  if (!b) {
    return <div className="py-12 text-center text-sm text-gray-400">กำลังโหลด...</div>;
  }

  const done = b.counts.sent + b.counts.failed;
  const inFlight = b.counts.pending + b.counts.sending;
  const pct = b.total_recipients > 0 ? Math.round((done / b.total_recipients) * 100) : 0;

  const stats = [
    { label: "ส่งแล้ว", value: b.counts.sent, color: "text-green-600" },
    { label: "กำลังส่ง/รอ", value: inFlight, color: "text-amber-600" },
    { label: "ล้มเหลว", value: b.counts.failed, color: "text-red-500" },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/admin/email-templates/broadcasts"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" /> ประวัติการส่ง
      </Link>

      <div className="rounded-xl border border-gray-100 bg-white p-6">
        <p className="text-sm text-gray-400">เทมเพลต</p>
        <p className="font-medium text-gray-800">{b.template_key}</p>
        <p className="mt-2 text-sm text-gray-500">
          {b.audience_desc} · ผู้รับ {b.total_recipients} คน
        </p>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-brand-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {done}/{b.total_recipients} ({pct}%)
          {inFlight > 0 ? " · กำลังส่ง อัปเดตอัตโนมัติ..." : " · เสร็จสิ้น"}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-gray-100 p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
