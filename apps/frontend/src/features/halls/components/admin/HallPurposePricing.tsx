"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { getHallPricings } from "../../services/hallPricingService";
import { HallPricingModel, HallPricingRow } from "../../types/pricing";

const unitLabel = (m: HallPricingModel) =>
  m === "per_sqm" ? "บาท / ตร.ม. / วัน" : "บาท / ประเภทสินค้า / วัน";

// แสดงอัตราค่าใช้จ่ายของโถงนี้ — ราคาอาคารเป็นขั้นต่ำ ถ้าโถงทำเลทองตั้งราคาสูงกว่าจะใช้ราคาโถงแทน
// backend resolve ราคาที่ใช้จริงมาให้แล้ว (effective_price) จึงไม่ต้องจับคู่อาคารเองที่ฝั่ง client
//
// ผู้เรียกต้องใส่ key={hallId} เพื่อให้ remount ตอนเปลี่ยนโถค — state จะเริ่มใหม่เอง
// จึงไม่ต้อง reset ใน effect (ESLint react-hooks/set-state-in-effect ห้าม setState ตรงๆ ใน effect)
export default function HallPurposePricing({ hallId }: { hallId: string }) {
  const [rows, setRows] = useState<HallPricingRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getHallPricings(Number(hallId));
        if (cancelled) return;
        // อาคารที่ปิดวัตถุประสงค์นี้ไว้ = ขอไม่ได้ ไม่ต้องแสดงราคา
        setRows(list.filter((r) => r.is_active));
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hallId]);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 text-left">
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
        <CreditCard size={14} className="text-[#f26522]" />
        อัตราค่าใช้จ่ายตามวัตถุประสงค์
      </h3>

      {error ? (
        <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-[7px] px-3 py-2.5">
          <AlertCircle size={14} className="shrink-0" />
          โหลดราคาไม่สำเร็จ
        </div>
      ) : rows === null ? (
        <div className="flex items-center justify-center py-6 text-slate-300">
          <Loader2 size={18} className="animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 rounded-[7px] px-3 py-4 text-center">
          ยังไม่มีวัตถุประสงค์การขอใช้พื้นที่ที่เปิดใช้งาน
        </p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r) => {
            const isPrime = r.effective_price > r.building_price;
            return (
              <div
                key={r.hall_usage_purpose_id}
                className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-700 truncate">
                    {r.purpose_name}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                    {unitLabel(r.pricing_model)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-black text-[#f26522] leading-none">
                    {r.effective_price.toLocaleString()} ฿
                  </p>
                  {isPrime && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold text-amber-600 uppercase tracking-wide">
                      <Sparkles size={10} />
                      ทำเลทอง · อาคาร {r.building_price.toLocaleString()} ฿
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
