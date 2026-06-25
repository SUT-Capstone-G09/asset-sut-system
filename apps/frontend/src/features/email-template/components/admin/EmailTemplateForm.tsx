"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Editor } from "grapesjs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TEMPLATE_VARIABLES } from "../../constants";
import type { EmailTemplate } from "../../types";

const EmailTemplateEditor = dynamic(() => import("./EmailTemplateEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-400">
      กำลังโหลดตัวแก้ไข...
    </div>
  ),
});

export interface EmailTemplateFormValues {
  key: string;
  name: string;
  subject: string;
  is_active: boolean;
  compiled_html: string;
  project_data: string;
}

interface Props {
  mode: "create" | "edit";
  initial?: EmailTemplate;
  submitting: boolean;
  error?: string | null;
  onSubmit: (values: EmailTemplateFormValues) => void;
}

export default function EmailTemplateForm({
  mode,
  initial,
  submitting,
  error,
  onSubmit,
}: Props) {
  const [key, setKey] = useState(initial?.key ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [formError, setFormError] = useState<string | null>(null);
  const editorRef = useRef<Editor | null>(null);

  const handleSave = () => {
    setFormError(null);

    if (!key.trim() || !name.trim() || !subject.trim()) {
      setFormError("กรุณากรอก key, ชื่อ และหัวข้อ ให้ครบ");
      return;
    }
    const editor = editorRef.current;
    if (!editor) {
      setFormError("ตัวแก้ไขยังไม่พร้อม ลองใหม่อีกครั้ง");
      return;
    }

    const compiled_html = editor.runCommand("gjs-get-inlined-html") as string;
    if (!compiled_html?.trim()) {
      setFormError("กรุณาออกแบบเนื้อหาอีเมลก่อนบันทึก");
      return;
    }
    const project_data = JSON.stringify(editor.getProjectData());

    onSubmit({
      key: key.trim(),
      name: name.trim(),
      subject: subject.trim(),
      is_active: isActive,
      compiled_html,
      project_data,
    });
  };

  return (
    <div className="space-y-6">
      {(formError || error) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {formError ?? error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="key">Key</Label>
          <Input
            id="key"
            value={key}
            disabled={mode === "edit"}
            onChange={(e) => setKey(e.target.value)}
            placeholder="booking.approved"
          />
          <p className="text-xs text-gray-400">
            {mode === "edit"
              ? "แก้ไข key ไม่ได้หลังสร้างแล้ว"
              : "ตัวระบุของ template เช่น booking.approved"}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">ชื่อ template</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="อีเมลอนุมัติการจอง"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subject">หัวข้ออีเมล</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="การจองได้รับการอนุมัติ - {{.userName}}"
          />
        </div>
      </div>

      <div className="rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-3">
        <p className="mb-1.5 text-xs font-semibold text-gray-500">
          ตัวแปรที่ใช้ได้ (ลากจากกล่อง &quot;ตัวแปร&quot; ในตัวแก้ไข หรือพิมพ์เอง)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATE_VARIABLES.map((v) => (
            <code
              key={v.token}
              className="rounded bg-white px-2 py-0.5 text-xs text-brand-primary ring-1 ring-gray-200"
            >
              {v.token} — {v.label}
            </code>
          ))}
        </div>
      </div>

      <EmailTemplateEditor
        initialProjectData={initial?.project_data || undefined}
        initialHtml={initial?.compiled_html || undefined}
        onInit={(editor) => {
          editorRef.current = editor;
        }}
      />

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setIsActive((v) => !v)}
          className="flex items-center gap-2.5 text-sm"
        >
          <span
            className={cn(
              "inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
              isActive ? "bg-brand-primary" : "bg-gray-300",
            )}
          >
            <span
              className={cn(
                "ml-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                isActive ? "translate-x-5" : "translate-x-0",
              )}
            />
          </span>
          <span className="font-medium text-gray-700">
            {isActive ? "เปิดใช้งาน (ใช้แทน template ในโค้ด)" : "ปิดใช้งาน (กลับไปใช้ template ในโค้ด)"}
          </span>
        </button>

        <Button onClick={handleSave} disabled={submitting} size="lg">
          {submitting ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </div>
    </div>
  );
}
