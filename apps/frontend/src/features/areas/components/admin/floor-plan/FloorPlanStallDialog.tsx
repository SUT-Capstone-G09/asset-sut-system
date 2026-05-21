"use client"

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloorPlanStallDialogProps {
  open: boolean;
  onConfirm: (label: string, name: string) => void;
  onCancel: () => void;
  cellCount: number;
  existingLabels: string[];
}

export default function FloorPlanStallDialog({
  open,
  onConfirm,
  onCancel,
  cellCount,
  existingLabels,
}: FloorPlanStallDialogProps) {
  const [label, setLabel] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setError("กรุณาระบุรหัสแผง");
      return;
    }
    if (existingLabels.includes(label.trim())) {
      setError("รหัสแผงนี้ถูกใช้แล้ว");
      return;
    }
    onConfirm(label.trim(), name.trim());
    setLabel("");
    setName("");
    setError("");
  };

  const handleCancel = () => {
    setLabel("");
    setName("");
    setError("");
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      <DialogContent className="sm:max-w-[420px] rounded-[7px] p-0 border-none shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0 space-y-2">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-[7px] bg-[#f26522]/10 flex items-center justify-center">
              <Store size={20} className="text-[#f26522]" strokeWidth={2.5} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                สร้างแผงค้าใหม่
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                เลือกไว้ {cellCount} เซลล์
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5 space-y-5">
          <div className="space-y-2.5">
            <Label className="text-xs font-bold text-slate-500 ml-1">
              รหัสแผง <span className="text-red-400">*</span>
            </Label>
            <Input
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                setError("");
              }}
              placeholder="เช่น A01, B03"
              className={cn(
                "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all",
                "focus-visible:ring-[#f26522]/30",
                error && "border-red-500 focus-visible:ring-red-500/30"
              )}
              autoFocus
            />
            {error && (
              <p className="text-[10px] font-bold text-red-500 ml-1">
                {error}
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            <Label className="text-xs font-bold text-slate-500 ml-1">
              ชื่อร้านค้า (ไม่บังคับ)
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ระบุชื่อร้านค้า..."
              className="rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all focus-visible:ring-[#f26522]/30"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="flex-1 h-11 rounded-[7px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              className={cn(
                "flex-1 h-11 rounded-[7px] font-bold text-white gap-2",
                "bg-[#f26522] hover:bg-[#d8561d] transition-all",
                "shadow-lg shadow-[#f26522]/20"
              )}
            >
              <Save size={16} />
              สร้างแผง
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
