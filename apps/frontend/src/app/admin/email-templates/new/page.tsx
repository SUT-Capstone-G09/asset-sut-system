"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EmailTemplateForm, {
  type EmailTemplateFormValues,
} from "@/features/email-template/components/admin/EmailTemplateForm";
import { createEmailTemplate } from "@/features/email-template/services/email-template.service";

export default function NewEmailTemplatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: EmailTemplateFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      await createEmailTemplate(values);
      router.push("/admin/email-templates");
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-8">
      <Link
        href="/admin/email-templates"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับไปรายการ
      </Link>
      <h1 className="text-xl font-bold text-gray-900">สร้าง Email Template</h1>
      <EmailTemplateForm
        mode="create"
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
