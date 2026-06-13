"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Inbox,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listBroadcasts } from "../../services/email-broadcast.service";
import type { BroadcastSummary } from "../../types";

const POLL_MS = 4000;

// Derives a single overall badge state from per-recipient counts.
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

export default function BroadcastList() {
  const router = useRouter();
  const [items, setItems] = useState<BroadcastSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load once, then keep polling while any broadcast still has work in flight so
  // progress updates live. setState runs after the await (not in the effect body).
  useEffect(() => {
    let ignore = false;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const data = await listBroadcasts();
        if (ignore) return;
        setItems(data);
        setError(null);
        setLoading(false);
        if (data.some((b) => b.counts.pending + b.counts.sending > 0)) {
          timer = setTimeout(load, POLL_MS);
        }
      } catch (e) {
        if (ignore) return;
        setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
        setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {loading ? "กำลังโหลด..." : `ทั้งหมด ${items.length} ครั้ง`}
        </p>
        <Button asChild className="bg-brand-primary text-white hover:bg-brand-primary/90">
          <Link href="/admin/email-templates/send">
            <Plus className="h-4 w-4" />
            ส่งอีเมลใหม่
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/60 text-left text-xs text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">เทมเพลต / กลุ่มผู้รับ</th>
              <th className="px-4 py-3 font-medium">ผู้รับ</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium">เวลา</th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-3.5">
                    <div className="h-5 w-full animate-pulse rounded bg-gray-100" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <Inbox className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-gray-500">ยังไม่มีประวัติการส่ง</p>
                  <p className="mt-1 text-sm text-gray-400">
                    เริ่มส่งอีเมลถึงกลุ่มผู้รับเพื่อดูประวัติที่นี่
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    <Link href="/admin/email-templates/send">
                      <Plus className="h-4 w-4" />
                      ส่งอีเมล
                    </Link>
                  </Button>
                </td>
              </tr>
            ) : (
              items.map((b) => {
                const status = statusOf(b);
                const pct =
                  b.total_recipients > 0
                    ? Math.round((b.counts.sent / b.total_recipients) * 100)
                    : 0;
                const href = `/admin/email-templates/broadcasts/${b.id}`;
                return (
                  <tr
                    key={b.id}
                    onClick={() => router.push(href)}
                    className="cursor-pointer transition-colors hover:bg-gray-50/70"
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        href={href}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium text-gray-800 hover:text-brand-primary"
                      >
                        {b.template_key}
                      </Link>
                      <p className="mt-0.5 text-xs text-gray-400">{b.audience_desc}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-gray-700">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        {b.total_recipients.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                            status.className,
                          )}
                        >
                          {status.spinner ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          {status.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-brand-primary transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-gray-400">
                            {b.counts.sent}/{b.total_recipients}
                            {b.counts.failed > 0 && (
                              <span className="text-red-500"> · {b.counts.failed} ล้มเหลว</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-gray-400">{b.created_at}</td>
                    <td className="px-4 py-3.5 text-right">
                      <ChevronRight className="ml-auto h-4 w-4 text-gray-300" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
