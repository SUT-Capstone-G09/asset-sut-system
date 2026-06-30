"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EmailPageHeader from "@/features/email-template/components/admin/EmailPageHeader";
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
      <EmailPageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Email Templates", href: "/admin/email-templates" },
          { label: "สร้าง Email Template" },
        ]}
        title="สร้าง Email Template"
      />
      <EmailTemplateForm
        mode="create"
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
