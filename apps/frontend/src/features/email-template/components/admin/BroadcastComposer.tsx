"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Users,
  X,
  Search,
  Loader2,
  Globe,
  Shield,
  Tag,
  UserPlus,
  Info,
  AlertCircle,
  FileText,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const AUDIENCE_META: Record<
  AudienceType,
  { label: string; desc: string; icon: React.ElementType }
> = {
  all: { label: "ผู้ใช้ทั้งหมด", desc: "ทุกคนในระบบ", icon: Globe },
  roles: { label: "ตาม Role", desc: "เลือกตามบทบาท", icon: Shield },
  requester_types: { label: "ตามประเภทผู้ขอ", desc: "เลือกตามประเภท", icon: Tag },
  users: { label: "เลือกรายคน", desc: "ระบุเป็นรายบุคคล", icon: UserPlus },
};

function makeAudience(
  type: AudienceType,
  roles: string[],
  typeIds: number[],
  userIds: number[],
): AudienceSpec {
  switch (type) {
    case "roles":
      return { type: "roles", roles };
    case "requester_types":
      return { type: "requester_types", requester_type_ids: typeIds };
    case "users":
      return { type: "users", user_ids: userIds };
    default:
      return { type: "all" };
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

// ── Reusable step shell ───────────────────────────────
function Step({
  n,
  title,
  desc,
  active,
  children,
}: {
  n: number;
  title: string;
  desc?: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-7 shadow-sm">
      <header className="mb-5 flex items-start gap-4">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-semibold",
            active
              ? "bg-brand-primary text-white"
              : "bg-gray-100 text-gray-400",
          )}
        >
          {n}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          {desc && <p className="mt-0.5 text-sm text-gray-400">{desc}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

export default function BroadcastComposer() {
  const router = useRouter();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [options, setOptions] = useState<AudienceOptions | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [templateKey, setTemplateKey] = useState("");
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateQuery, setTemplateQuery] = useState("");
  const [audienceType, setAudienceType] = useState<AudienceType>("all");
  const [roles, setRoles] = useState<string[]>([]);
  const [typeIds, setTypeIds] = useState<number[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Recipient[]>([]);
  const [data, setData] = useState<Record<string, string>>({});

  const [query, setQuery] = useState("");
  // Results are tagged with the query they belong to, so display/searching state
  // can be derived during render (no setState-in-effect).
  const [resultData, setResultData] = useState<{ q: string; items: Recipient[] }>({
    q: "",
    items: [],
  });

  // Server-resolved preview, tagged with the audience key it answers for.
  const [serverPreview, setServerPreview] = useState<{
    key: string;
    count: number;
    sample: Recipient[];
  } | null>(null);
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    getEmailTemplates().then(setTemplates).catch(() => {});
    getAudienceOptions().then(setOptions).catch(() => {});
  }, []);

  // Live recipient search: debounce keystrokes; store results tagged with their
  // query. Empty query fetches nothing — display is derived below.
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    let ignore = false;
    const handle = setTimeout(async () => {
      try {
        const items = await searchRecipients(q);
        if (!ignore) setResultData({ q, items });
      } catch {
        /* ignore transient search errors */
      }
    }, 300);
    return () => {
      ignore = true;
      clearTimeout(handle);
    };
  }, [query]);

  // Auto-preview: resolve the recipient count whenever a server-backed audience
  // changes. The "users" audience is known locally and skips the round-trip.
  useEffect(() => {
    if (audienceType === "users") return;
    const key = JSON.stringify(makeAudience(audienceType, roles, typeIds, []));
    let ignore = false;
    const handle = setTimeout(async () => {
      try {
        const res = await previewAudience(makeAudience(audienceType, roles, typeIds, []));
        if (!ignore) setServerPreview({ key, count: res.count, sample: res.sample });
      } catch {
        /* leave previous preview; a later change retries */
      }
    }, 350);
    return () => {
      ignore = true;
      clearTimeout(handle);
    };
  }, [audienceType, roles, typeIds]);

  // ── Derived display state (kept out of effects per react-hooks rules) ──
  const trimmedQuery = query.trim();
  const results = resultData.q === trimmedQuery ? resultData.items : [];
  const searching = trimmedQuery !== "" && resultData.q !== trimmedQuery;

  const audienceKey = JSON.stringify(makeAudience(audienceType, roles, typeIds, []));
  const serverReady = serverPreview?.key === audienceKey;
  const previewCount =
    audienceType === "users"
      ? selectedUsers.length
      : serverReady
        ? serverPreview!.count
        : null;
  const previewSample =
    audienceType === "users"
      ? selectedUsers.slice(0, 5)
      : serverReady
        ? serverPreview!.sample
        : [];
  const previewing = audienceType !== "users" && !serverReady;

  const selectedTemplate = templates.find((t) => t.key === templateKey);
  const filteredTemplates = useMemo(() => {
    const q = templateQuery.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) => t.name.toLowerCase().includes(q) || t.key.toLowerCase().includes(q),
    );
  }, [templates, templateQuery]);

  const variables = useMemo(
    () =>
      selectedTemplate
        ? extractTemplateVariables(selectedTemplate.subject, selectedTemplate.compiled_html)
        : [],
    [selectedTemplate],
  );

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

  const addUser = (r: Recipient) => {
    if (!selectedUsers.some((u) => u.user_id === r.user_id)) {
      setSelectedUsers((prev) => [...prev, r]);
    }
  };

  // Validate, then open the confirmation dialog (replaces the native confirm()).
  const openConfirm = () => {
    setError(null);
    if (!templateKey) {
      setError("กรุณาเลือกเทมเพลตก่อนส่ง");
      return;
    }
    if (!previewCount) {
      setError("ยังไม่มีผู้รับสำหรับกลุ่มที่เลือก");
      return;
    }
    setConfirmOpen(true);
  };

  const confirmSend = async () => {
    setSending(true);
    try {
      const res = await sendBroadcast({
        template_key: templateKey,
        audience: makeAudience(audienceType, roles, typeIds, selectedUsers.map((u) => u.user_id)),
        data,
      });
      router.push(`/admin/email-templates/broadcasts/${res.broadcast_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ส่งไม่สำเร็จ");
      setSending(false);
      setConfirmOpen(false);
    }
  };

  const missingVars = variables.filter((v) => !data[v]?.trim());
  const canSend = !!templateKey && !!previewCount && !sending;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      {/* ── Main column ───────────────────────────── */}
      <div className="space-y-6">
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-base text-red-600">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1 — Template */}
        <Step n={1} title="เลือกเทมเพลต" desc="เนื้อหาอีเมลที่จะส่ง" active={!!templateKey}>
          <Popover open={templateOpen} onOpenChange={setTemplateOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-12 w-full items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3.5 text-left text-base text-gray-800 transition-colors hover:border-gray-300 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                <FileText className="h-5 w-5 shrink-0 text-gray-400" />
                <span className={cn("flex-1 truncate", !selectedTemplate && "text-gray-400")}>
                  {selectedTemplate ? selectedTemplate.name : "— เลือกเทมเพลต —"}
                </span>
                <ChevronsUpDown className="h-5 w-5 shrink-0 text-gray-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
              <div className="border-b border-gray-100 p-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={templateQuery}
                    onChange={(e) => setTemplateQuery(e.target.value)}
                    placeholder="ค้นหาเทมเพลต..."
                    className="h-10 pl-8"
                  />
                </div>
              </div>
              <ul className="max-h-72 overflow-y-auto p-1">
                {filteredTemplates.length === 0 ? (
                  <li className="px-3 py-6 text-center text-sm text-gray-400">ไม่พบเทมเพลต</li>
                ) : (
                  filteredTemplates.map((t) => {
                    const active = t.key === templateKey;
                    return (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setTemplateKey(t.key);
                            setData({});
                            setTemplateOpen(false);
                            setTemplateQuery("");
                          }}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-gray-50",
                            active && "bg-brand-primary/5",
                          )}
                        >
                          <Check
                            className={cn(
                              "h-4 w-4 shrink-0",
                              active ? "text-brand-primary" : "text-transparent",
                            )}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-gray-800">
                              {t.name}
                              {!t.is_active && (
                                <span className="ml-1.5 text-xs text-gray-400">(ปิดอยู่)</span>
                              )}
                            </span>
                            <span className="block truncate text-xs text-gray-400">{t.key}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </PopoverContent>
          </Popover>
          {selectedTemplate && (
            <p className="mt-3 truncate text-sm text-gray-500">
              หัวข้อ: <span className="text-gray-700">{selectedTemplate.subject}</span>
            </p>
          )}
        </Step>

        {/* Step 2 — Audience */}
        <Step n={2} title="กลุ่มผู้รับ" desc="เลือกว่าจะส่งหาใคร" active={!!previewCount}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(AUDIENCE_META) as AudienceType[]).map((t) => {
              const meta = AUDIENCE_META[t];
              const Icon = meta.icon;
              const selected = audienceType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAudienceType(t)}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
                    selected
                      ? "border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary/30"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                  )}
                >
                  <Icon
                    className={cn("h-6 w-6", selected ? "text-brand-primary" : "text-gray-400")}
                  />
                  <span
                    className={cn(
                      "text-base font-medium",
                      selected ? "text-brand-primary" : "text-gray-700",
                    )}
                  >
                    {meta.label}
                  </span>
                  <span className="text-xs leading-tight text-gray-400">{meta.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-options */}
          {audienceType === "roles" && (
            <div className="mt-5 flex flex-wrap gap-2.5">
              {options?.roles.length ? (
                options.roles.map((r) => {
                  const on = roles.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRoles((prev) => toggle(prev, r))}
                      className={cn(
                        "rounded-full border px-4 py-2 text-base transition-colors",
                        on
                          ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50",
                      )}
                    >
                      {r}
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400">กำลังโหลด role...</p>
              )}
            </div>
          )}

          {audienceType === "requester_types" && (
            <div className="mt-5 flex flex-wrap gap-2.5">
              {options?.requester_types.length ? (
                options.requester_types.map((rt) => {
                  const on = typeIds.includes(rt.id);
                  return (
                    <button
                      key={rt.id}
                      type="button"
                      onClick={() => setTypeIds((prev) => toggle(prev, rt.id))}
                      className={cn(
                        "rounded-full border px-4 py-2 text-base transition-colors",
                        on
                          ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50",
                      )}
                    >
                      {rt.type}
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400">ไม่มีประเภทผู้ขอ</p>
              )}
            </div>
          )}

          {audienceType === "users" && (
            <div className="mt-5 space-y-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="พิมพ์เพื่อค้นหาชื่อหรืออีเมล"
                  className="h-12 pl-11 text-base"
                />
                {searching && (
                  <Loader2 className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-gray-400" />
                )}
              </div>

              {query.trim() && !searching && (
                <ul className="max-h-72 divide-y divide-gray-50 overflow-y-auto rounded-lg border border-gray-100">
                  {results.length === 0 ? (
                    <li className="px-4 py-6 text-center text-base text-gray-400">
                      ไม่พบผู้ใช้ที่ตรงกับ &quot;{query.trim()}&quot;
                    </li>
                  ) : (
                    results.map((r) => {
                      const added = selectedUsers.some((u) => u.user_id === r.user_id);
                      return (
                        <li key={r.user_id}>
                          <button
                            type="button"
                            disabled={added}
                            onClick={() => addUser(r)}
                            className="flex w-full items-center gap-3.5 px-4 py-3 text-left text-base transition-colors hover:bg-gray-50 disabled:opacity-50"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
                              {initials(r.name)}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-gray-800">{r.name}</span>
                              <span className="block truncate text-sm text-gray-400">{r.email}</span>
                            </span>
                            {added && <span className="text-sm text-brand-primary">เลือกแล้ว</span>}
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              )}

              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2.5">
                  {selectedUsers.map((u) => (
                    <span
                      key={u.user_id}
                      className="flex items-center gap-2 rounded-full bg-brand-primary/10 py-1.5 pl-1.5 pr-3 text-sm text-brand-primary"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary/20 text-[11px] font-semibold">
                        {initials(u.name)}
                      </span>
                      {u.name}
                      <button
                        type="button"
                        aria-label={`ลบ ${u.name}`}
                        onClick={() =>
                          setSelectedUsers((prev) => prev.filter((x) => x.user_id !== u.user_id))
                        }
                        className="rounded-full p-0.5 hover:bg-brand-primary/20"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </Step>

        {/* Step 3 — Variables */}
        {variables.length > 0 && (
          <Step n={3} title="กรอกค่าตัวแปร" desc="ใช้ค่าเดียวกันกับผู้รับทุกคน">
            <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <code className="font-mono">{"{{.userName}}"}</code>{" "}
                ระบบจะเติมชื่อผู้รับให้อัตโนมัติ — กรอกเฉพาะตัวแปรด้านล่าง
              </span>
            </div>
            <div className="space-y-4">
              {variables.map((v) => (
                <div key={v} className="space-y-1.5">
                  <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-600">
                    {`{{.${v}}}`}
                  </code>
                  <Input
                    value={data[v] ?? ""}
                    onChange={(e) => setData((prev) => ({ ...prev, [v]: e.target.value }))}
                    placeholder={`ค่าของ ${v}`}
                    className="h-12 text-base"
                  />
                </div>
              ))}
            </div>
          </Step>
        )}
      </div>

      {/* ── Summary / action sidebar ──────────────── */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">สรุปการส่ง</h3>

          <div className="mt-5 rounded-xl bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-400">จำนวนผู้รับ</p>
            <p className="mt-1.5 flex items-center justify-center gap-2 text-5xl font-bold text-brand-primary">
              {previewing ? (
                <Loader2 className="h-9 w-9 animate-spin text-gray-300" />
              ) : (
                (previewCount ?? 0).toLocaleString()
              )}
              {!previewing && <span className="text-base font-normal text-gray-400">คน</span>}
            </p>
          </div>

          <dl className="mt-5 space-y-3 text-base">
            <div className="flex justify-between">
              <dt className="text-gray-400">เทมเพลต</dt>
              <dd className="max-w-[55%] truncate text-gray-700">
                {selectedTemplate?.name ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">กลุ่ม</dt>
              <dd className="text-gray-700">{AUDIENCE_META[audienceType].label}</dd>
            </div>
          </dl>

          {previewSample.length > 0 && (
            <p className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-400">
              เช่น {previewSample.map((s) => s.name).join(", ")}
              {previewCount && previewCount > previewSample.length ? " …" : ""}
            </p>
          )}

          {templateKey && missingVars.length > 0 && (
            <p className="mt-4 flex items-start gap-2 text-sm text-amber-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              ยังไม่ได้กรอก: {missingVars.map((v) => `{{.${v}}}`).join(", ")}
            </p>
          )}

          <Button
            type="button"
            size="lg"
            onClick={openConfirm}
            disabled={!canSend}
            className="mt-6 h-14 w-full bg-brand-primary text-base text-white hover:bg-brand-primary/90 [&_svg]:size-5"
          >
            <Send /> ส่งอีเมล
            {previewCount ? ` (${previewCount.toLocaleString()})` : ""}
          </Button>
          {!templateKey && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-sm text-gray-400">
              <Users className="h-4 w-4" /> เลือกเทมเพลตและกลุ่มผู้รับก่อน
            </p>
          )}
        </div>
      </aside>

      {/* Confirm-before-send dialog */}
      <Dialog open={confirmOpen} onOpenChange={(o) => !sending && setConfirmOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการส่งอีเมล</DialogTitle>
            <DialogDescription>
              การส่งจะเริ่มทันทีและยกเลิกไม่ได้ ตรวจสอบรายละเอียดก่อนยืนยัน
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">เทมเพลต</span>
              <span className="max-w-[60%] truncate text-gray-700">
                {selectedTemplate?.name ?? "—"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">กลุ่ม</span>
              <span className="text-gray-700">{AUDIENCE_META[audienceType].label}</span>
            </div>
            <div className="flex justify-between gap-3 border-t border-gray-200 pt-2">
              <span className="text-gray-400">ผู้รับ</span>
              <span className="font-semibold text-brand-primary">
                {(previewCount ?? 0).toLocaleString()} คน
              </span>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={sending}>
                ยกเลิก
              </Button>
            </DialogClose>
            <Button
              onClick={confirmSend}
              disabled={sending}
              className="bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> กำลังส่ง...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> ยืนยันส่ง
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
