"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getEmailTemplates } from "../../services/email-template.service";
import {
  getAudienceOptions,
  previewAudience,
  searchRecipients,
  sendBroadcast,
  extractTemplateVariables,
} from "../../services/email-broadcast.service";
import type {
  AudienceOptions,
  AudienceSpec,
  AudienceType,
  EmailTemplate,
  Recipient,
} from "../../types";

const AUDIENCE_LABELS: Record<AudienceType, string> = {
  all: "ผู้ใช้ทั้งหมด",
  roles: "ตาม Role",
  requester_types: "ตามประเภทผู้ขอ",
  users: "เลือกรายคน",
};

export default function BroadcastComposer() {
  const router = useRouter();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [options, setOptions] = useState<AudienceOptions | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [templateKey, setTemplateKey] = useState("");
  const [audienceType, setAudienceType] = useState<AudienceType>("all");
  const [roles, setRoles] = useState<string[]>([]);
  const [typeIds, setTypeIds] = useState<number[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Recipient[]>([]);
  const [data, setData] = useState<Record<string, string>>({});

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Recipient[]>([]);

  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewSample, setPreviewSample] = useState<Recipient[]>([]);
  const [previewing, setPreviewing] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getEmailTemplates().then(setTemplates).catch(() => {});
    getAudienceOptions().then(setOptions).catch(() => {});
  }, []);

  // Live recipient search: debounce keystrokes, and clear results the moment the
  // box is emptied so a stale previous query never lingers. The ignore flag drops
  // responses from superseded queries.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    let ignore = false;
    const handle = setTimeout(async () => {
      try {
        const res = await searchRecipients(q);
        if (!ignore) setResults(res);
      } catch {
        /* ignore transient search errors */
      }
    }, 300);
    return () => {
      ignore = true;
      clearTimeout(handle);
    };
  }, [query]);

  const selectedTemplate = templates.find((t) => t.key === templateKey);
  const variables = useMemo(
    () =>
      selectedTemplate
        ? extractTemplateVariables(selectedTemplate.subject, selectedTemplate.compiled_html)
        : [],
    [selectedTemplate],
  );

  // Reset the resolved-count whenever the audience changes — it no longer applies.
  const resetPreview = () => {
    setPreviewCount(null);
    setPreviewSample([]);
  };

  const buildAudience = (): AudienceSpec => {
    switch (audienceType) {
      case "roles":
        return { type: "roles", roles };
      case "requester_types":
        return { type: "requester_types", requester_type_ids: typeIds };
      case "users":
        return { type: "users", user_ids: selectedUsers.map((u) => u.user_id) };
      default:
        return { type: "all" };
    }
  };

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

  const addUser = (r: Recipient) => {
    if (!selectedUsers.some((u) => u.user_id === r.user_id)) {
      setSelectedUsers((prev) => [...prev, r]);
      resetPreview();
    }
  };

  const handlePreview = async () => {
    setError(null);
    setPreviewing(true);
    try {
      const res = await previewAudience(buildAudience());
      setPreviewCount(res.count);
      setPreviewSample(res.sample);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ดูจำนวนผู้รับไม่สำเร็จ");
    } finally {
      setPreviewing(false);
    }
  };

  const handleSend = async () => {
    setError(null);
    if (!templateKey) {
      setError("กรุณาเลือกเทมเพลต");
      return;
    }
    setSending(true);
    try {
      const res = await sendBroadcast({
        template_key: templateKey,
        audience: buildAudience(),
        data,
      });
      router.push(`/admin/email-templates/broadcasts/${res.broadcast_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ส่งไม่สำเร็จ");
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 1. Template */}
      <section className="space-y-2">
        <Label>1. เลือกเทมเพลต</Label>
        <select
          value={templateKey}
          onChange={(e) => {
            setTemplateKey(e.target.value);
            setData({});
          }}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">— เลือกเทมเพลต —</option>
          {templates.map((t) => (
            <option key={t.id} value={t.key}>
              {t.name} ({t.key}){t.is_active ? "" : " — ปิดอยู่"}
            </option>
          ))}
        </select>
      </section>

      {/* 2. Audience */}
      <section className="space-y-3">
        <Label>2. กลุ่มผู้รับ</Label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(AUDIENCE_LABELS) as AudienceType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setAudienceType(t);
                resetPreview();
              }}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                audienceType === t
                  ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50",
              )}
            >
              {AUDIENCE_LABELS[t]}
            </button>
          ))}
        </div>

        {audienceType === "roles" && (
          <div className="flex flex-wrap gap-3 rounded-lg border border-gray-100 p-3">
            {options?.roles.map((r) => (
              <label key={r} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={roles.includes(r)}
                  onChange={() => {
                    setRoles((prev) => toggle(prev, r));
                    resetPreview();
                  }}
                />
                {r}
              </label>
            ))}
          </div>
        )}

        {audienceType === "requester_types" && (
          <div className="flex flex-wrap gap-3 rounded-lg border border-gray-100 p-3">
            {options?.requester_types.map((rt) => (
              <label key={rt.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={typeIds.includes(rt.id)}
                  onChange={() => {
                    setTypeIds((prev) => toggle(prev, rt.id));
                    resetPreview();
                  }}
                />
                {rt.type}
              </label>
            ))}
          </div>
        )}

        {audienceType === "users" && (
          <div className="space-y-3 rounded-lg border border-gray-100 p-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="พิมพ์เพื่อค้นหาชื่อหรืออีเมล"
            />
            {results.length > 0 && (
              <ul className="max-h-40 space-y-1 overflow-y-auto text-sm">
                {results.map((r) => (
                  <li key={r.user_id}>
                    <button
                      type="button"
                      onClick={() => addUser(r)}
                      className="w-full rounded px-2 py-1 text-left hover:bg-gray-50"
                    >
                      {r.name} <span className="text-gray-400">· {r.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                {selectedUsers.map((u) => (
                  <span
                    key={u.user_id}
                    className="flex items-center gap-1 rounded-full bg-brand-primary/10 px-3 py-1 text-xs text-brand-primary"
                  >
                    {u.name}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUsers((prev) => prev.filter((x) => x.user_id !== u.user_id));
                        resetPreview();
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. Static variables */}
      {variables.length > 0 && (
        <section className="space-y-3">
          <Label>3. กรอกค่าตัวแปร (ใช้ค่าเดียวกับทุกคน)</Label>
          <p className="text-xs text-gray-400">
            {"{{.userName}}"} ระบบเติมชื่อผู้รับให้อัตโนมัติ — กรอกเฉพาะตัวแปรด้านล่าง
          </p>
          {variables.map((v) => (
            <div key={v} className="flex items-center gap-3">
              <code className="w-40 shrink-0 text-xs text-gray-500">{`{{.${v}}}`}</code>
              <Input
                value={data[v] ?? ""}
                onChange={(e) => setData((prev) => ({ ...prev, [v]: e.target.value }))}
                placeholder={`ค่าของ ${v}`}
              />
            </div>
          ))}
        </section>
      )}

      {/* Preview + send */}
      <section className="space-y-3 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={handlePreview} disabled={previewing}>
            <Users className="h-4 w-4" />
            {previewing ? "กำลังนับ..." : "ดูจำนวนผู้รับ"}
          </Button>
          {previewCount !== null && (
            <span className="text-sm text-gray-600">
              ผู้รับ <strong className="text-brand-primary">{previewCount}</strong> คน
              {previewSample.length > 0 && (
                <span className="text-gray-400">
                  {" "}
                  · เช่น {previewSample.map((s) => s.name).join(", ")}
                </span>
              )}
            </span>
          )}
        </div>

        <Button
          type="button"
          onClick={handleSend}
          disabled={sending || !templateKey || previewCount === 0}
        >
          <Send className="h-4 w-4" />
          {sending ? "กำลังส่ง..." : "ส่งอีเมล"}
        </Button>
      </section>
    </div>
  );
}
