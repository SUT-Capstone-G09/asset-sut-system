"use client";

import { useParams } from "next/navigation";
import BroadcastStatus from "@/features/email-template/components/admin/BroadcastStatus";
import EmailPageHeader from "@/features/email-template/components/admin/EmailPageHeader";

export default function BroadcastStatusPage() {
  const params = useParams();
  const id = Number(params.id);

  return (
    <div className="space-y-6 p-8">
      <EmailPageHeader

        title="สถานะการส่ง"
      />
      <BroadcastStatus id={id} />
    </div>
  );
}
