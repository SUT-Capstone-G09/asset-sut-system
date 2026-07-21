import EmailPageHeader from "@/features/email-template/components/admin/EmailPageHeader";
import EmailTemplateTable from "@/features/email-template/components/admin/EmailTemplateTable";

export default function EmailTemplatesPage() {
  return (
    <div className="space-y-6 p-8">
      <EmailPageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Email Templates" },
        ]}
        title="Email Templates"
        description="จัดการเทมเพลตอีเมล — เปิด/ปิดการใช้งานได้ตลอด เมื่อปิดจะกลับไปใช้เทมเพลตในโค้ดอัตโนมัติ"
      />
      <EmailTemplateTable />
    </div>
  );
}
