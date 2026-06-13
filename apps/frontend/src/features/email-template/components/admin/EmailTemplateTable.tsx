"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getEmailTemplates,
  updateEmailTemplate,
  deleteEmailTemplate,
} from "../../services/email-template.service";
import type { EmailTemplate } from "../../types";

export default function EmailTemplateTable() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Search is queried server-side. Debounce keystrokes; the empty query (initial
  // load) fires immediately. setState lives in the async callback, not the effect
  // body, per react-hooks rules.
  useEffect(() => {
    const q = query.trim();
    let ignore = false;
    const handle = setTimeout(
      async () => {
        setLoading(true);
        try {
          const data = await getEmailTemplates(q);
          if (!ignore) {
            setError(null);
            setTemplates(data);
          }
        } catch (e) {
          if (!ignore)
            setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
        } finally {
          if (!ignore) setLoading(false);
        }
      },
      q ? 300 : 0,
    );
    return () => {
      ignore = true;
      clearTimeout(handle);
    };
  }, [query]);

  const toggleActive = async (t: EmailTemplate) => {
    setBusyId(t.id);
    setError(null);
    try {
      const updated = await updateEmailTemplate(t.id, {
        is_active: !t.is_active,
      });
      setTemplates((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (t: EmailTemplate) => {
    if (!confirm(`ลบ template "${t.name}" ?`)) return;
    setBusyId(t.id);
    setError(null);
    try {
      await deleteEmailTemplate(t.id);
      setTemplates((prev) => prev.filter((x) => x.id !== t.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "ลบไม่สำเร็จ");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาจากชื่อ, key หรือหัวข้อ"
            className="pl-9"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
          )}
        </div>
        <Button asChild className="bg-brand-primary hover:bg-brand-primary/90">
          <Link href="/admin/email-templates/new">
            <Plus className="h-4 w-4 " />
            สร้าง Template
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/60 text-left text-xs text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">ชื่อ</th>
              <th className="px-4 py-3 font-medium">Key</th>
              <th className="px-4 py-3 font-medium">หัวข้อ</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 text-right font-medium">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && templates.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-gray-400"
                >
                  กำลังโหลด...
                </td>
              </tr>
            ) : templates.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-gray-400"
                >
                  {query.trim()
                    ? `ไม่พบ template ที่ตรงกับ "${query.trim()}"`
                    : 'ยังไม่มี template — กด "สร้าง Template" เพื่อเริ่ม'}
                </td>
              </tr>
            ) : (
              templates.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {t.name}
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                      {t.key}
                    </code>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-500">
                    {t.subject}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busyId === t.id}
                      onClick={() => toggleActive(t)}
                      className="flex items-center gap-2 disabled:opacity-50"
                      title="คลิกเพื่อสลับสถานะ"
                    >
                      <span
                        className={cn(
                          "inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
                          t.is_active ? "bg-brand-primary" : "bg-gray-300",
                        )}
                      >
                        <span
                          className={cn(
                            "ml-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                            t.is_active ? "translate-x-4" : "translate-x-0",
                          )}
                        />
                      </span>
                      <span
                        className={cn(
                          "text-xs",
                          t.is_active ? "text-brand-primary" : "text-gray-400",
                        )}
                      >
                        {t.is_active ? "เปิด" : "ปิด"}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon-sm">
                        <Link href={`/admin/email-templates/${t.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={busyId === t.id}
                        onClick={() => remove(t)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
