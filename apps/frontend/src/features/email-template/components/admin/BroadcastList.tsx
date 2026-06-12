"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listBroadcasts } from "../../services/email-broadcast.service";
import type { BroadcastSummary } from "../../types";

export default function BroadcastList() {
  const [items, setItems] = useState<BroadcastSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listBroadcasts()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-sm text-gray-400">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/60 text-left text-xs text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">เทมเพลต</th>
              <th className="px-4 py-3 font-medium">กลุ่มผู้รับ</th>
              <th className="px-4 py-3 font-medium">ผู้รับ</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium">เวลา</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  ยังไม่มีประวัติการส่ง
                </td>
              </tr>
            ) : (
              items.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/email-templates/broadcasts/${b.id}`}
                      className="font-medium text-brand-primary hover:underline"
                    >
                      {b.template_key}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{b.audience_desc}</td>
                  <td className="px-4 py-3 text-gray-700">{b.total_recipients}</td>
                  <td className="px-4 py-3">
                    <span className="text-green-600">{b.counts.sent} ส่งแล้ว</span>
                    {b.counts.pending + b.counts.sending > 0 && (
                      <span className="text-amber-600"> · {b.counts.pending + b.counts.sending} รอ</span>
                    )}
                    {b.counts.failed > 0 && (
                      <span className="text-red-500"> · {b.counts.failed} ล้มเหลว</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{b.created_at}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
