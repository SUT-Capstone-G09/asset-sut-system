"use client"

import { useCallback, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "info" | "danger" | "success";

interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
}

interface State extends DialogOptions {
  mode: "alert" | "confirm";
}

// hook แทน window.alert / window.confirm ด้วย dialog ใน UI (คืน Promise)
export function useAppDialog() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>({ message: "", mode: "alert" });
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const close = useCallback((result: boolean) => {
    setOpen(false);
    const r = resolver.current;
    resolver.current = null;
    r?.(result);
  }, []);

  // ถามยืนยัน — คืน true ถ้ากดยืนยัน
  const confirm = useCallback(
    (opts: DialogOptions) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setState({ ...opts, mode: "confirm" });
        setOpen(true);
      }),
    []
  );

  // แจ้งเตือน — คืนเมื่อผู้ใช้กดตกลง/ปิด
  const notify = useCallback(
    (opts: DialogOptions) =>
      new Promise<void>((resolve) => {
        resolver.current = () => resolve();
        setState({ ...opts, mode: "alert" });
        setOpen(true);
      }),
    []
  );

  const variant = state.variant ?? (state.mode === "confirm" ? "danger" : "info");
  const iconWrap =
    variant === "danger"
      ? "bg-red-50 text-red-500"
      : variant === "success"
        ? "bg-emerald-50 text-emerald-500"
        : "bg-[#f26522]/10 text-[#f26522]";
  const Icon = variant === "danger" ? AlertTriangle : variant === "success" ? CheckCircle2 : Info;
  const confirmBtn =
    variant === "danger" ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-brand-primary-600";

  const dialog = (
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(false); }}>
      <DialogContent showCloseButton={false} className="max-w-md rounded-[10px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-1 text-left space-y-0">
          <div className="flex items-center gap-3">
            <div className={cn("size-9 rounded-[7px] flex items-center justify-center shrink-0", iconWrap)}>
              <Icon size={18} strokeWidth={2.5} />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              {state.title ?? (state.mode === "confirm" ? "ยืนยันการทำรายการ" : "แจ้งเตือน")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-slate-500 mt-3 whitespace-pre-line leading-relaxed">
            {state.message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="px-6 py-4 mt-2 bg-slate-50/60 border-t border-slate-100 gap-2 sm:gap-2">
          {state.mode === "confirm" && (
            <Button
              variant="ghost"
              onClick={() => close(false)}
              className="rounded-[7px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              {state.cancelText ?? "ยกเลิก"}
            </Button>
          )}
          <Button
            onClick={() => close(true)}
            className={cn("rounded-[7px] font-bold text-white cursor-pointer", confirmBtn)}
          >
            {state.confirmText ?? (state.mode === "confirm" ? "ยืนยัน" : "ตกลง")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { confirm, notify, dialog };
}
