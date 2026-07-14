"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";

interface BookingHeaderProps {
  title: string;
  onCreateClick?: () => void;
  buttonLabel?: string;
  extraAction?: React.ReactNode;
}

export default function BookingHeader({
  title,
  onCreateClick,
  buttonLabel = "เพิ่มคำขอจองใหม่",
  extraAction,
}: BookingHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <div>
            <h1 className="page-title text-2xl font-black text-slate-900 tracking-tight">
              {title}
            </h1>
          </div>
        </div>

        {/* Action Group */}
        {(extraAction || onCreateClick) && (
          <div className="flex items-center gap-3">
            {extraAction}
            {onCreateClick && (
              <Button
                onClick={onCreateClick}
                className={cn(
                  "h-11 px-6 rounded-[7px] font-bold text-xs text-white",
                  "bg-primary hover:bg-brand-primary-600 transition-all",
                  "shadow-lg shadow-[#f26522]/20 gap-2 cursor-pointer",
                )}
              >
                <Plus size={18} strokeWidth={3} />
                <span>{buttonLabel}</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
