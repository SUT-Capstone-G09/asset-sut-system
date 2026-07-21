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
import { Skeleton } from "@/components/ui/skeleton";
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

type StepState = "todo" | "active" | "done";

// ── Reusable step shell ───────────────────────────────
// `state` drives the indicator: a green check when done, the brand colour while
// active/being filled, and muted grey when still untouched — so the user can
// read progress at a glance.
function Step({
  n,
  title,
  desc,
  state = "todo",
  badge,
  children,
}: {
  n: number;
  title: string;
  desc?: string;
  state?: StepState;
  badge?: string;
  children: React.ReactNode;
}) {
  const done = state === "done";
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-7 shadow-sm">
      <header className="mb-5 flex items-start gap-4">
        <span
          aria-hidden="true"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-semibold transition-colors",
            done
              ? "bg-emerald-500 text-white"
              : state === "active"
                ? "bg-brand-primary text-white"
                : "bg-gray-100 text-gray-400",
          )}
        >
          {done ? <Check className="h-5 w-5" /> : n}
        </span>
        <div className="flex-1">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            {title}
            {badge && (
              <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary">
                {badge}
              </span>
            )}
          </h2>
          {desc && <p className="mt-0.5 text-sm text-gray-400">{desc}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

// Multi-select helper toolbar (เลือกทั้งหมด / ล้าง) shown above chip groups.
function SelectAllBar({
  total,
  selected,
  onAll,
  onClear,
}: {
  total: number;
  selected: number;
  onAll: () => void;
  onClear: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <span className="text-sm text-gray-400" aria-live="polite">
        เลือกแล้ว {selected} / {total}
      </span>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={onAll}
          disabled={selected === total}
          className="rounded-md px-2.5 py-1 text-sm font-medium text-brand-primary hover:bg-brand-primary/5 disabled:text-gray-300 disabled:hover:bg-transparent"
        >
          เลือกทั้งหมด
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={selected === 0}
          className="rounded-md px-2.5 py-1 text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent"
        >
          ล้าง
        </button>
      </div>
    </div>
  );
}

export default function BroadcastComposer() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [options, setOptions] = useState<AudienceOptions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

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
  // can be derived during render (no setState-in-effect). `null` means the roster
  // hasn't been fetched yet — distinct from a fetched-but-empty result.
  const [resultData, setResultData] = useState<{ q: string; items: Recipient[] } | null>(
    null,
  );

  // Server-resolved preview, tagged with the audience key it answers for.
  const [serverPreview, setServerPreview] = useState<{
    key: string;
    count: number;
    sample: Recipient[];
  } | null>(null);
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      getEmailTemplates().then(setTemplates).catch(() => {}),
      getAudienceOptions().then(setOptions).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  // Live recipient list for the "เลือกรายคน" picker: an empty query lists every
  // user (browse the full roster); typing narrows it. Results are tagged with the
  // query they belong to so display/searching state can be derived during render.
  // Only fetches while this audience is active to avoid needless round-trips.
  useEffect(() => {
    if (audienceType !== "users") return;
    const q = query.trim();
    let ignore = false;
    const handle = setTimeout(
      async () => {
        try {
          const items = await searchRecipients(q);
          if (!ignore) setResultData({ q, items });
        } catch {
          /* ignore transient search errors */
        }
      },
      q ? 300 : 0, // load the roster immediately; debounce only keystrokes
    );
    return () => {
      ignore = true;
      clearTimeout(handle);
    };
  }, [query, audienceType]);

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
  const results = resultData && resultData.q === trimmedQuery ? resultData.items : [];
  // True while the roster/results for the current query are still in flight —
  // covers both the initial full-list load and any narrowing keystroke.
  const searching = audienceType === "users" && resultData?.q !== trimmedQuery;

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
    setSendError(null);
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
    setSendError(null);
    try {
      const res = await sendBroadcast({
        template_key: templateKey,
        audience: makeAudience(audienceType, roles, typeIds, selectedUsers.map((u) => u.user_id)),
        data,
      });
      router.push(`/admin/email-templates/broadcasts/${res.broadcast_id}`);
    } catch (e) {
      // Keep the failure inside the dialog where the user is looking, instead of
      // closing it and surfacing the error far away at the top of the page.
      setSendError(e instanceof Error ? e.message : "ส่งไม่สำเร็จ กรุณาลองใหม่");
      setSending(false);
    }
  };

  const missingVars = variables.filter((v) => !data[v]?.trim());
  const canSend = !!templateKey && !!previewCount && !sending;

  const step1State: StepState = templateKey ? "done" : "active";
  const step2State: StepState = previewCount ? "done" : templateKey ? "active" : "todo";
  const step3State: StepState = missingVars.length === 0 ? "done" : "active";

  // Short human label for the chosen audience, reused in summary + sticky bar.
  const audienceBadge =
    audienceType === "roles" && roles.length
      ? `${roles.length} role`
      : audienceType === "requester_types" && typeIds.length
        ? `${typeIds.length} ประเภท`
        : audienceType === "users" && selectedUsers.length
          ? `${selectedUsers.length} คน`
          : undefined;

  return (
    <div className="grid gap-8 pb-24 lg:grid-cols-[1fr_380px] lg:pb-0">
      {/* ── Main column ───────────────────────────── */}
      <div className="space-y-6">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-base text-red-600"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-6" aria-hidden="true">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-7 shadow-sm">
                <div className="mb-5 flex items-center gap-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Step 1 — Template */}
            <Step
              n={1}
              title="เลือกเทมเพลต"
              desc="เนื้อหาอีเมลที่จะส่ง"
              state={step1State}
            >
              <Popover open={templateOpen} onOpenChange={setTemplateOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="เลือกเทมเพลตอีเมล"
                    aria-haspopup="listbox"
                    aria-expanded={templateOpen}
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
                        aria-label="ค้นหาเทมเพลต"
                        className="h-10 pl-8"
                      />
                    </div>
                  </div>
                  <ul role="listbox" className="max-h-72 overflow-y-auto p-1">
                    {filteredTemplates.length === 0 ? (
                      <li className="px-3 py-6 text-center text-sm text-gray-400">ไม่พบเทมเพลต</li>
                    ) : (
                      filteredTemplates.map((t) => {
                        const active = t.key === templateKey;
                        return (
                          <li key={t.id} role="option" aria-selected={active}>
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
            <Step
              n={2}
              title="กลุ่มผู้รับ"
              desc="เลือกว่าจะส่งหาใคร"
              state={step2State}
              badge={audienceBadge}
            >
              <div
                role="radiogroup"
                aria-label="ประเภทกลุ่มผู้รับ"
                className="grid grid-cols-2 gap-3 sm:grid-cols-4"
              >
                {(Object.keys(AUDIENCE_META) as AudienceType[]).map((t) => {
                  const meta = AUDIENCE_META[t];
                  const Icon = meta.icon;
                  const selected = audienceType === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={`${meta.label} — ${meta.desc}`}
                      onClick={() => setAudienceType(t)}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40",
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
                <div className="mt-5">
                  {options?.roles.length ? (
                    <>
                      <SelectAllBar
                        total={options.roles.length}
                        selected={roles.length}
                        onAll={() => setRoles(options.roles)}
                        onClear={() => setRoles([])}
                      />
                      <div className="flex flex-wrap gap-2.5">
                        {options.roles.map((r) => {
                          const on = roles.includes(r);
                          return (
                            <button
                              key={r}
                              type="button"
                              aria-pressed={on}
                              onClick={() => setRoles((prev) => toggle(prev, r))}
                              className={cn(
                                "rounded-full border px-4 py-2 text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40",
                                on
                                  ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                                  : "border-gray-200 text-gray-600 hover:bg-gray-50",
                              )}
                            >
                              {r}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">กำลังโหลด role...</p>
                  )}
                </div>
              )}

              {audienceType === "requester_types" && (
                <div className="mt-5">
                  {options?.requester_types.length ? (
                    <>
                      <SelectAllBar
                        total={options.requester_types.length}
                        selected={typeIds.length}
                        onAll={() => setTypeIds(options.requester_types.map((rt) => rt.id))}
                        onClear={() => setTypeIds([])}
                      />
                      <div className="flex flex-wrap gap-2.5">
                        {options.requester_types.map((rt) => {
                          const on = typeIds.includes(rt.id);
                          return (
                            <button
                              key={rt.id}
                              type="button"
                              aria-pressed={on}
                              onClick={() => setTypeIds((prev) => toggle(prev, rt.id))}
                              className={cn(
                                "rounded-full border px-4 py-2 text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40",
                                on
                                  ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                                  : "border-gray-200 text-gray-600 hover:bg-gray-50",
                              )}
                            >
                              {rt.type}
                            </button>
                          );
                        })}
                      </div>
                    </>
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
                      placeholder="ค้นหาชื่อหรืออีเมล เพื่อกรองรายชื่อ"
                      aria-label="ค้นหาผู้รับรายคน"
                      className="h-12 pl-11 text-base"
                    />
                    {searching && (
                      <Loader2 className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-gray-400" />
                    )}
                  </div>

                  {!searching && (
                    <ul
                      role="listbox"
                      aria-label="รายชื่อผู้รับ"
                      className="max-h-72 divide-y divide-gray-50 overflow-y-auto rounded-lg border border-gray-100"
                    >
                      {results.length === 0 ? (
                        <li className="px-4 py-6 text-center text-base text-gray-400">
                          {trimmedQuery
                            ? `ไม่พบผู้ใช้ที่ตรงกับ "${trimmedQuery}"`
                            : "ไม่มีผู้ใช้ในระบบ"}
                        </li>
                      ) : (
                        results.map((r) => {
                          const added = selectedUsers.some((u) => u.user_id === r.user_id);
                          return (
                            <li key={r.user_id} role="option" aria-selected={added}>
                              <button
                                type="button"
                                disabled={added}
                                onClick={() => addUser(r)}
                                className="flex w-full items-center gap-3.5 px-4 py-3 text-left text-base transition-colors hover:bg-gray-50 disabled:opacity-50"
                              >
                                <span
                                  aria-hidden="true"
                                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500"
                                >
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
                          <span
                            aria-hidden="true"
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary/20 text-[11px] font-semibold"
                          >
                            {initials(u.name)}
                          </span>
                          {u.name}
                          <button
                            type="button"
                            aria-label={`ลบ ${u.name} ออกจากรายการผู้รับ`}
                            onClick={() =>
                              setSelectedUsers((prev) => prev.filter((x) => x.user_id !== u.user_id))
                            }
                            className="rounded-full p-0.5 hover:bg-brand-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
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
              <Step
                n={3}
                title="กรอกค่าตัวแปร"
                desc="ใช้ค่าเดียวกันกับผู้รับทุกคน"
                state={step3State}
                badge={
                  missingVars.length > 0 ? `เหลือ ${missingVars.length}` : "ครบแล้ว"
                }
              >
                <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <code className="font-mono">{"{{.userName}}"}</code>{" "}
                    ระบบจะเติมชื่อผู้รับให้อัตโนมัติ — กรอกเฉพาะตัวแปรด้านล่าง
                  </span>
                </div>
                <div className="space-y-4">
                  {variables.map((v) => {
                    const inputId = `var-${v}`;
                    const filled = !!data[v]?.trim();
                    return (
                      <div key={v} className="space-y-1.5">
                        <label
                          htmlFor={inputId}
                          className="inline-flex items-center gap-1.5 rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-600"
                        >
                          {`{{.${v}}}`}
                          {filled && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                        </label>
                        <Input
                          id={inputId}
                          value={data[v] ?? ""}
                          onChange={(e) => setData((prev) => ({ ...prev, [v]: e.target.value }))}
                          placeholder={`ค่าของ ${v}`}
                          className="h-12 text-base"
                        />
                      </div>
                    );
                  })}
                </div>
              </Step>
            )}
          </>
        )}
      </div>

      {/* ── Summary / action sidebar ──────────────── */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">สรุปการส่ง</h3>

          <div className="mt-5 rounded-xl bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-400">จำนวนผู้รับ</p>
            <p
              role="status"
              aria-live="polite"
              className="mt-1.5 flex items-center justify-center gap-2 text-5xl font-bold text-brand-primary"
            >
              {previewing ? (
                <>
                  <Loader2 className="h-9 w-9 animate-spin text-gray-300" />
                  <span className="sr-only">กำลังคำนวณจำนวนผู้รับ</span>
                </>
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
            className="mt-6 hidden h-14 w-full bg-brand-primary text-base text-white hover:bg-brand-primary/90 lg:flex [&_svg]:size-5"
          >
            <Send /> ส่งอีเมล
            {previewCount ? ` (${previewCount.toLocaleString()})` : ""}
          </Button>
          {!templateKey && (
            <p className="mt-3 hidden items-center justify-center gap-1.5 text-center text-sm text-gray-400 lg:flex">
              <Users className="h-4 w-4" /> เลือกเทมเพลตและกลุ่มผู้รับก่อน
            </p>
          )}
        </div>
      </aside>

      {/* Mobile sticky action bar — keeps the primary action reachable without
          scrolling to the summary card on small screens. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-gray-400">
              {selectedTemplate?.name ?? "ยังไม่เลือกเทมเพลต"}
            </p>
            <p className="text-sm font-semibold text-gray-700">
              {previewing ? "กำลังคำนวณ…" : `${(previewCount ?? 0).toLocaleString()} คน`}
            </p>
          </div>
          <Button
            type="button"
            onClick={openConfirm}
            disabled={!canSend}
            className="h-12 shrink-0 bg-brand-primary px-6 text-base text-white hover:bg-brand-primary/90 [&_svg]:size-5"
          >
            <Send /> ส่ง
          </Button>
        </div>
      </div>

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

          {sendError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{sendError}</span>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={sending}>
                ยกเลิก
              </Button>
            </DialogClose>
            <Button
              onClick={confirmSend}
              disabled={sending}
              className="bg-primary text-white hover:bg-brand-primary-600"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> กำลังส่ง...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> {sendError ? "ลองอีกครั้ง" : "ยืนยันส่ง"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
