"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EmailPageHeader from "@/features/email-template/components/admin/EmailPageHeader";
import EmailTemplateForm, {
  type EmailTemplateFormValues,
} from "@/features/email-template/components/admin/EmailTemplateForm";
import EmailTemplateFormSkeleton from "@/features/email-template/components/admin/EmailTemplateFormSkeleton";
import {
  getEmailTemplate,
  updateEmailTemplate,
} from "@/features/email-template/services/email-template.service";
import type { EmailTemplate } from "@/features/email-template/types";

export default function EditEmailTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEmailTemplate(id)
      .then(setTemplate)
      .catch((e) => setError(e instanceof Error ? e.message : "ไม่พบ template"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (values: EmailTemplateFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      await updateEmailTemplate(id, {
        name: values.name,
        subject: values.subject,
        is_active: values.is_active,
        compiled_html: values.compiled_html,
        project_data: values.project_data,
      });
      router.push("/admin/email-templates");
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-8">
      <EmailPageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Email Templates", href: "/admin/email-templates" },
          { label: "แก้ไข" },
        ]}
        title={template ? `แก้ไข: ${template.name}` : "แก้ไข"}
      />

      {loading ? (
        <EmailTemplateFormSkeleton />
      ) : !template ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error ?? "ไม่พบ template"}
        </div>
      ) : (
        <EmailTemplateForm
          mode="edit"
          initial={template}
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
