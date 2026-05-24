import { HelpCircle } from "lucide-react";

export function HelpCard() {
  return (
    <div className="bg-orange-50/70 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
      <HelpCircle className="w-5 h-5 text-[#F15A24] shrink-0 mt-0.5" />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-slate-700">
          ต้องการความช่วยเหลือเรื่องการชำระเงิน?
        </span>
        <a
          href="#"
          className="text-xs font-bold text-[#F15A24] hover:underline"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
