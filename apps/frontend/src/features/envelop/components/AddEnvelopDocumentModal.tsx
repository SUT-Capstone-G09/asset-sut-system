"use client";

import { useState } from "react";
import { FileText, Save, Loader2, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EnvelopFormFields from "./forms/EnvelopFormFields";

export interface AddEnvelopDocumentFormData {
  title: string;
  areaId: string;
  location: string;
  price: number;
  files: File[];
  allowOnlineSubmit: boolean;
  note: string;
}

const INITIAL_FORM_STATE: AddEnvelopDocumentFormData = {
  title: "",
  areaId: "",
  location: "",
  price: 0,
  files: [],
  allowOnlineSubmit: false,
  note: "",
};

interface AddEnvelopDocumentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: AddEnvelopDocumentFormData) => void;
}

export function AddEnvelopDocumentModal({
  isOpen,
  onOpenChange,
  onSubmit,
}: AddEnvelopDocumentModalProps) {
  const [form, setForm] = useState<AddEnvelopDocumentFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = form.title.trim().length > 0;

  const handleClose = () => {
    setForm(INITIAL_FORM_STATE);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSubmit?.(form);
    setIsSubmitting(false);
    handleClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-[640px] p-0 border-none bg-white flex flex-col h-full shadow-2xl"
      >
        <div className="flex flex-col h-full">

          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-[7px] bg-[#f26522]/10 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-[#f26522]" strokeWidth={3} />
              </div>
              <SheetTitle className="text-xl font-bold text-slate-900 tracking-tight">
                เพิ่มซองเอกสารใหม่
              </SheetTitle>
              <SheetDescription className="sr-only">
                แบบฟอร์มเพิ่มซองเอกสารใหม่
              </SheetDescription>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="size-9 rounded-[7px] bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center group"
            >
              <X size={18} className="transition-transform group-hover:rotate-90" />
            </button>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <EnvelopFormFields form={form} setForm={setForm} />
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-5 border-t border-slate-100 flex items-center gap-4 bg-white/90 backdrop-blur-md shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-[7px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              disabled={!canSubmit || isSubmitting}
              onClick={handleSubmit}
              className={cn(
                "flex-1 h-12 rounded-[7px] bg-[#f26522] hover:bg-[#d8561d] text-white font-bold shadow-lg shadow-[#f26522]/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2",
                (!canSubmit || isSubmitting) && "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100 hover:bg-[#f26522]"
              )}
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {isSubmitting ? "กำลังบันทึก..." : "เพิ่มเอกสาร"}
            </Button>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
