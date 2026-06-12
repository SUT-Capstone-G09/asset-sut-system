import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BroadcastComposer from "@/features/email-template/components/admin/BroadcastComposer";

export default function SendBroadcastPage() {
  return (
    <div className="space-y-6 p-8">
      <Link
        href="/admin/email-templates"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับไปรายการเทมเพลต
      </Link>
      <div>
        <h1 className="text-xl font-bold text-gray-900">ส่งอีเมล</h1>
        <p className="mt-0.5 text-sm text-gray-400">
          เลือกเทมเพลตและกลุ่มผู้รับ — ระบบเติมชื่อผู้รับให้อัตโนมัติ
        </p>
      </div>
      <BroadcastComposer />
    </div>
  );
}
