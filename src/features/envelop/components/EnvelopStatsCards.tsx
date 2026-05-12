"use client";

import { CreditCard, DoorOpen, ClipboardCheck } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { envelopStats } from "../data/envelop";

export default function EnvelopStatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={<CreditCard size={20} />}
        label="Total Revenue"
        value={envelopStats.totalRevenue.toLocaleString()}
        unit="บาท"
        description="รายได้จากการขายซองเอกสารรายเดือน"
      />
      <StatCard
        icon={<DoorOpen size={20} />}
        label="Available Spaces"
        value={envelopStats.availableSpaces}
        unit="พื้นที่"
        description="จำนวนพื้นที่ว่างที่พร้อมให้เช่าในขณะนี้"
      />
      <StatCard
        icon={<ClipboardCheck size={20} />}
        label="Pending Verification"
        value={envelopStats.pendingVerification}
        unit="รายการ"
        description="รายการรอตรวจสอบการชำระเงิน"
      />
    </div>
  );
}
