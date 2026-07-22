"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tenant } from "../../types";

interface TenantListItemProps {
  tenant: Tenant;
  isSelected: boolean;
  onSelect: (tenant: Tenant) => void;
}

const STATUS_COLOR: Record<Tenant["status"], string> = {
  Active: "bg-orange-100 text-orange-600",
  Inactive: "bg-slate-100 text-slate-500",
  Expired: "bg-red-100 text-red-500",
};

const AVATAR_COLOR: Record<string, string> = {
  A: "bg-orange-100 text-orange-600",
  B: "bg-blue-100 text-blue-600",
  C: "bg-emerald-100 text-emerald-600",
  D: "bg-purple-100 text-purple-600",
  E: "bg-pink-100 text-pink-600",
  M: "bg-orange-100 text-orange-600",
  K: "bg-sky-100 text-sky-600",
  S: "bg-violet-100 text-violet-600",
  T: "bg-amber-100 text-amber-600",
  F: "bg-rose-100 text-rose-600",
};

function getAvatarColor(shortName: string) {
  const first = shortName[0]?.toUpperCase() ?? "A";
  return AVATAR_COLOR[first] ?? "bg-slate-100 text-slate-600";
}

export function TenantListItem({ tenant, isSelected, onSelect }: TenantListItemProps) {
  return (
    <button
      onClick={() => onSelect(tenant)}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3.5 rounded-md border transition-all text-left group",
        isSelected
          ? "bg-orange-50 border-orange-300 shadow-sm shadow-orange-100"
          : "bg-white border-slate-100 hover:border-orange-200 hover:shadow-sm"
      )}
    >
      {/* Avatar + Info */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-11 h-11 rounded-md flex items-center justify-center font-bold text-sm shrink-0",
            getAvatarColor(tenant.shortName)
          )}
        >
          {tenant.shortName}
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-800 leading-tight">{tenant.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">รหัสผู้เช่า: {tenant.shopCode}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ChevronRight
          size={16}
          className={cn(
            "shrink-0 transition-colors",
            isSelected ? "text-orange-500" : "text-slate-300 group-hover:text-slate-400"
          )}
        />
      </div>
    </button>
  );
}
