"use client";

import { useParams } from "next/navigation";
import BroadcastStatus from "@/features/email-template/components/admin/BroadcastStatus";

export default function BroadcastStatusPage() {
  const params = useParams();
  const id = Number(params.id);

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-xl font-bold text-gray-900">สถานะการส่ง</h1>
      <BroadcastStatus id={id} />
    </div>
  );
}
