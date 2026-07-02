import BroadcastComposer from "@/features/email-template/components/admin/BroadcastComposer";
import EmailPageHeader from "@/features/email-template/components/admin/EmailPageHeader";

export default function SendBroadcastPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-8">
      <EmailPageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Email Templates", href: "/admin/email-templates" },
          { label: "ส่งอีเมล" },
        ]}
        title="ส่งอีเมล"
        description="เลือกเทมเพลตและกลุ่มผู้รับ — ระบบเติมชื่อผู้รับให้อัตโนมัติ"
      />
      <BroadcastComposer />
    </div>
  );
}
