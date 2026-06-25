import EmailTemplateTable from "@/features/email-template/components/admin/EmailTemplateTable";

export default function EmailTemplatesPage() {
  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Email Templates</h1>
        <p className="mt-0.5 text-sm text-gray-400">
          จัดการเทมเพลตอีเมล — เปิด/ปิดการใช้งานได้ตลอด เมื่อปิดจะกลับไปใช้เทมเพลตในโค้ดอัตโนมัติ
        </p>
      </div>
      <EmailTemplateTable />
    </div>
  );
}
