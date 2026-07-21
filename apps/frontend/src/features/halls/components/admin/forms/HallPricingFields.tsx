"use client";

import { useEffect, useState } from "react";
import { useWatch, useFormContext } from "react-hook-form";
import { Coins, Loader2, AlertCircle, Sparkles, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  getBuildingsWithPricing,
  getHallPricings,
  getHallUsagePurposes,
} from "../../../services/hallPricingService";
import {
  BuildingWithPricing,
  HallPricingModel,
  HallPricingRow,
  HallUsagePurpose,
} from "../../../types/pricing";
import { HallFormValues } from "../../../schemas/hall-schema";

const unitLabel = (m: HallPricingModel) =>
  m === "per_sqm" ? "บาท / ตร.ม. / วัน" : "บาท / ประเภทสินค้า / วัน";

// ตั้งราคาเฉพาะโถง (ทำเลทอง) — มีเฉพาะหน้าแก้ไข เพราะตอนสร้างยังไม่มี id ของโถง
// ราคาอาคารเป็นขั้นต่ำ: กรอกต่ำกว่าไม่ได้ ; เว้นว่าง = ใช้ราคาอาคาร
export default function HallPricingFields({ hallId }: { hallId: string }) {
  const { control, setValue } = useFormContext<HallFormValues>();
  const selectedBuilding = useWatch({ control, name: "building" });
  const pricings = useWatch({ control, name: "pricings" }) ?? [];

  const [rows, setRows] = useState<HallPricingRow[] | null>(null);
  const [buildings, setBuildings] = useState<BuildingWithPricing[]>([]);
  const [purposes, setPurposes] = useState<HallUsagePurpose[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [list, blds, prps] = await Promise.all([
          getHallPricings(Number(hallId)),
          getBuildingsWithPricing(),
          getHallUsagePurposes(),
        ]);
        if (cancelled) return;
        setRows(list);
        setBuildings(blds);
        setPurposes(prps);
        setValue(
          "pricings",
          list.map((r) => ({
            hall_usage_purpose_id: r.hall_usage_purpose_id,
            price: r.override_price,
          })),
        );
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hallId, setValue]);

  // ราคาขั้นต่ำของอาคารที่ "เลือกอยู่ในฟอร์มตอนนี้" — admin เปลี่ยนอาคารพร้อมแก้ราคาได้
  // logic เดียวกับ backend: มีแถวของอาคาร → ใช้ราคานั้น ; ไม่มี → fallback default_price ของวัตถุประสงค์
  const floorFor = (purposeId: number) => {
    const b = buildings.find((x) => x.name === selectedBuilding);
    const hp = b?.hall_pricings?.find(
      (p) => p.hall_usage_purpose_id === purposeId,
    );
    if (hp) return hp.price;
    return purposes.find((p) => p.id === purposeId)?.default_price ?? 0;
  };

  const priceOf = (purposeId: number) =>
    pricings.find((p) => p.hall_usage_purpose_id === purposeId)?.price ?? null;

  const setPrice = (purposeId: number, price: number | null) => {
    setValue(
      "pricings",
      pricings.map((p) =>
        p.hall_usage_purpose_id === purposeId ? { ...p, price } : p,
      ),
      { shouldDirty: true },
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-left space-y-4">
      <div className="flex items-center gap-2.5" style={{ color: "#f26522" }}>
        <div className="size-8 rounded-[7px] flex items-center justify-center shadow-sm border border-slate-100 bg-[#f26522]/10">
          <Coins size={18} strokeWidth={2.5} />
        </div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">
          ราคาเฉพาะโถงนี้
        </h3>
      </div>
      <p className="text-[11px] font-bold text-slate-400 -mt-2">
        โถงทำเลทองตั้งราคาสูงกว่าเรทกลางของอาคารได้ — เว้นว่างไว้ = ใช้ราคาอาคารตามปกติ
      </p>

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
        <div className="space-y-4">
          {rows.map((r) => {
            const floor = floorFor(r.hall_usage_purpose_id);
            const price = priceOf(r.hall_usage_purpose_id);
            const tooLow = price !== null && price < floor;
            const isPrime = price !== null && price > floor;
            return (
              <div key={r.hall_usage_purpose_id} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs font-bold text-slate-500">
                    {r.purpose_name}
                    {isPrime && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 uppercase tracking-wide">
                        <Sparkles size={10} />
                        ทำเลทอง
                      </span>
                    )}
                  </Label>
                  <span className="text-[10px] font-bold text-slate-400">
                    ราคาอาคาร {floor.toLocaleString()} ฿ · {unitLabel(r.pricing_model)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={floor}
                    value={price ?? ""}
                    placeholder={`ใช้ราคาอาคาร (${floor.toLocaleString()})`}
                    onChange={(e) =>
                      setPrice(
                        r.hall_usage_purpose_id,
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    className={cn(
                      "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all pl-4",
                      "focus-visible:ring-[#f26522]/30",
                      tooLow && "border-red-500 focus-visible:ring-red-500/30",
                    )}
                  />
                  {price !== null && (
                    <button
                      type="button"
                      title="ล้างราคาเฉพาะโถง กลับไปใช้ราคาอาคาร"
                      onClick={() => setPrice(r.hall_usage_purpose_id, null)}
                      className="size-12 shrink-0 rounded-[7px] bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                </div>
                {tooLow && (
                  <p className="text-[10px] font-bold text-red-500 ml-1">
                    ต้องไม่ต่ำกว่าราคาอาคาร ({floor.toLocaleString()} ฿)
                  </p>
                )}
                {!r.is_active && (
                  <p className="text-[10px] font-bold text-amber-600 ml-1">
                    อาคารนี้ปิดวัตถุประสงค์นี้อยู่ — ตั้งราคาไว้ได้ แต่ยังขอใช้ไม่ได้จนกว่าจะเปิด
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
