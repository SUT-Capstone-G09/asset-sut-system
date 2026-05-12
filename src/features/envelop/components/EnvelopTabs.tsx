"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import EnvelopDocumentList from "./EnvelopDocumentList";
import EnvelopPaymentList from "./EnvelopPaymentList";
import { envelopStats } from "../data/envelop";

type TabValue = "documents" | "payments";

const tabs: { value: TabValue; label: string; badge?: number }[] = [
  { value: "documents", label: "คลังซองเอกสาร" },
  { value: "payments", label: "ตรวจสอบการชำระเงิน", badge: envelopStats.pendingVerification },
];

export default function EnvelopTabs() {
  const [active, setActive] = useState<TabValue>("documents");

  return (
    <div>
      {/* Tab Bar */}
      <div className="flex border-b border-slate-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActive(tab.value)}
            className={cn(
              "flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-semibold transition-colors",
              active === tab.value
                ? "border-b-2 border-[#E9652B] text-[#E9652B]"
                : "border-b-2 border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E9652B] px-1.5 text-[10px] font-bold text-white">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {active === "documents" && <EnvelopDocumentList />}
      {active === "payments" && <EnvelopPaymentList />}
    </div>
  );
}
