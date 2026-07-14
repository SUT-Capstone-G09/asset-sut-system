"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";
import {
  getBuildingsWithPricing,
  getHallUsagePurposes,
} from "../../services/hallPricingService";
import { HallPricingModel } from "../../types/pricing";

const unitLabel = (m: HallPricingModel) =>
  m === "per_sqm" ? "บาท / ตร.ม. / วัน" : "บาท / ประเภทสินค้า / วัน";

interface PurposePrice {
  purposeId: number;
  name: string;
  model: HallPricingModel;
  price: number;
  configured: boolean; // อาคารตั้งราคาเอง (false = ใช้ราคาเริ่มต้นของวัตถุประสงค์)
}

// แสดงอัตราค่าใช้จ่ายของโถงตาม "การตั้งราคาตามวัตถุประสงค์" ของอาคารที่โถงสังกัด
// ราคาใช้ร่วมทุกโถงในอาคารเดียวกัน — จับคู่อาคารด้วยชื่อ (ชื่ออาคาร unique) เหมือน HallPricingDrawer
export default function HallPurposePricing({
  buildingName,
}: {
  buildingName: string;
}) {
  const [rows, setRows] = useState<PurposePrice[] | null>(null);
  const [error, setError] = useState(false);
  const [buildingFound, setBuildingFound] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    setError(false);
    (async () => {
      try {
        const [buildings, purposes] = await Promise.all([
          getBuildingsWithPricing(),
          getHallUsagePurposes(), // เฉพาะวัตถุประสงค์ที่เปิดใช้งาน
        ]);
        if (cancelled) return;
        const building = buildings.find((b) => b.name === buildingName);
        const priceMap = new Map(
          (building?.hall_pricings ?? []).map((p) => [
            p.hall_usage_purpose_id,
            p,
          ]),
        );
        // เริ่มจากวัตถุประสงค์ที่เปิดใช้งาน → ใช้ราคาอาคาร ถ้าไม่มีค่อย fallback ราคาเริ่มต้น
        // (logic เดียวกับ buildDrafts ฝั่ง admin) ; อาคารที่ปิดวัตถุประสงค์นี้ไว้ = ไม่แสดง
        const list = purposes
          .map<PurposePrice | null>((p) => {
            const cfg = priceMap.get(p.id);
            if (cfg && !cfg.is_active) return null;
            return {
              purposeId: p.id,
              name: p.name,
              model: p.pricing_model,
              price: cfg ? cfg.price : p.default_price,
              configured: !!cfg,
            };
          })
          .filter((r): r is PurposePrice => r !== null);
        setBuildingFound(!!building);
        setRows(list);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [buildingName]);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 text-left">
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <CreditCard size={14} className="text-[#f26522]" />
          อัตราค่าใช้จ่ายตามวัตถุประสงค์
        </h3>
        {buildingName && (
          <p className="text-[11px] font-semibold text-slate-400 mt-1 pl-[22px]">
            ราคาตามอาคาร · {buildingName}
          </p>
        )}
      </div>

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
        <>
          {!buildingFound && (
            <p className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-[7px] px-3 py-2">
              ยังไม่ได้ตั้งราคาให้อาคารนี้ — แสดงราคาเริ่มต้นของแต่ละวัตถุประสงค์
            </p>
          )}
          <div className="space-y-2.5">
            {rows.map((r) => (
              <div
                key={r.purposeId}
                className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-700 truncate">
                    {r.name}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                    {unitLabel(r.model)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-black text-[#f26522] leading-none">
                    {r.price.toLocaleString()} ฿
                  </p>
                  {!r.configured && (
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                      ราคาเริ่มต้น
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
