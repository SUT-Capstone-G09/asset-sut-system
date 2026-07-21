"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, X, Grid3X3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Room } from "@/features/bookings/types";
import { useHallCalendar } from "@/features/bookings/hooks/useHallCalendar";
import MonthlyCalendar from "@/features/bookings/components/calendar/MonthlyCalendar";
import HallFloorPlanSelector from "@/features/bookings/components/hall/HallFloorPlanSelector";
import { getHallUsagePurposes } from "@/features/halls/services/hallPricingService";
import { HallUsagePurpose } from "@/features/halls/types/pricing";
import {
  getHallPriceQuote,
  HallPurposeQuoteInput,
} from "@/features/bookings/services/hall.service";
import { cn } from "@/lib/utils";

function formatThaiDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const months = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  return `${d} ${months[m - 1]} ${y + 543}`;
}

export interface HallDraftPurpose {
  hallUsagePurposeId: number;
  pricingModel: string;
  name: string;
  selectedCells?: number[][];
  cellSizeM?: number;
  productTypeCount?: number;
  productNames?: string[]; // per_type_per_day: ชื่อสินค้าที่จะแจก (1 ชื่อต่อ 1 ประเภท)
  proposedPrice?: number;
  computedPrice?: number; // ราคาที่ระบบคำนวณ (แสดงในหน้ายืนยัน)
}
export interface HallBookingDraft {
  locationId: string;
  dates: string[];
  purposes: HallDraftPurpose[];
}

interface Props {
  room: Room;
}

export default function HallBookingView({ room }: Props) {
  const router = useRouter();
  const cal = useHallCalendar();

  const [purposes, setPurposes] = useState<HallUsagePurpose[]>([]);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [cellsByPurpose, setCellsByPurpose] = useState<
    Record<number, number[][]>
  >({});
  const [cellSizeByPurpose, setCellSizeByPurpose] = useState<
    Record<number, number>
  >({});
  const [typeCountByPurpose, setTypeCountByPurpose] = useState<
    Record<number, string>
  >({});
  // ชื่อสินค้าที่จะแจกต่อวัตถุประสงค์ (per_type_per_day) — 1 ช่องต่อ 1 ประเภท ตามจำนวนที่ระบุ
  const [productNamesByPurpose, setProductNamesByPurpose] = useState<
    Record<number, string[]>
  >({});
  const [priceByPurpose, setPriceByPurpose] = useState<Record<number, string>>(
    {},
  );
  const [selectorFor, setSelectorFor] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // ราคาที่ระบบคำนวณต่อวัตถุประสงค์ (จาก backend quote) — ใช้แสดง + validate ราคาที่เสนอ
  const [computedByPurpose, setComputedByPurpose] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await getHallUsagePurposes();
        if (!cancelled) setPurposes(data);
      } catch {
        if (!cancelled) setPurposes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // กู้คืนสิ่งที่เลือกไว้จาก draft (เมื่อย้อนกลับมาจากหน้ายืนยัน) — draft ถูกลบเฉพาะตอนส่งสำเร็จ
  useEffect(() => {
    const raw = sessionStorage.getItem(`hall_booking_draft_${room.id}`);
    // ไม่มี draft = เข้าหน้าครั้งแรก หรือ "ย้อนกลับมาหลังจองสำเร็จ" (draft ถูกลบไปแล้ว)
    // → รีเซ็ต state การเลือกทั้งหมดให้เริ่มใหม่หมดจด (วัน/วัตถุประสงค์/เซลล์/จำนวนประเภท/ราคา)
    if (!raw) {
      cal.clearAll();
      setChecked(new Set());
      setCellsByPurpose({});
      setCellSizeByPurpose({});
      setTypeCountByPurpose({});
      setProductNamesByPurpose({});
      setPriceByPurpose({});
      setComputedByPurpose({});
      return;
    }
    let cancelled = false;
    void (async () => {
      let parsed: HallBookingDraft;
      try {
        parsed = JSON.parse(raw) as HallBookingDraft;
      } catch {
        return;
      }
      await Promise.resolve();
      if (cancelled) return;
      cal.restore(parsed.dates ?? []);
      setChecked(new Set(parsed.purposes.map((p) => p.hallUsagePurposeId)));
      const cells: Record<number, number[][]> = {};
      const sizes: Record<number, number> = {};
      const counts: Record<number, string> = {};
      const names: Record<number, string[]> = {};
      const prices: Record<number, string> = {};
      for (const p of parsed.purposes) {
        if (p.selectedCells) cells[p.hallUsagePurposeId] = p.selectedCells;
        if (p.cellSizeM !== undefined)
          sizes[p.hallUsagePurposeId] = p.cellSizeM;
        if (p.productTypeCount !== undefined)
          counts[p.hallUsagePurposeId] = String(p.productTypeCount);
        if (p.productNames !== undefined)
          names[p.hallUsagePurposeId] = p.productNames;
        if (p.proposedPrice !== undefined)
          prices[p.hallUsagePurposeId] = String(p.proposedPrice);
      }
      setCellsByPurpose(cells);
      setCellSizeByPurpose(sizes);
      setTypeCountByPurpose(counts);
      setProductNamesByPurpose(names);
      setPriceByPurpose(prices);
    })();
    return () => {
      cancelled = true;
    };
    // กู้คืนครั้งเดียวตอน mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  const purposeById = useMemo(() => {
    const m: Record<number, HallUsagePurpose> = {};
    purposes.forEach((p) => (m[p.id] = p));
    return m;
  }, [purposes]);

  // ยิง quote ราคาระบบเมื่อ input ที่มีผลต่อราคาเปลี่ยน (วัน/วัตถุประสงค์/เซลล์/จำนวนประเภท)
  // debounce กันยิงถี่ ; เก็บ ComputedPrice ต่อ purpose ไว้แสดง + validate ราคาที่เสนอ
  const datesKey = cal.selectedDates.join(",");
  const checkedKey = [...checked].sort((a, b) => a - b).join(",");
  const cellsKey = JSON.stringify(cellsByPurpose);
  const typeKey = JSON.stringify(typeCountByPurpose);
  useEffect(() => {
    const payload: HallPurposeQuoteInput[] = [];
    for (const id of checked) {
      const p = purposeById[id];
      if (!p) continue;
      if (p.pricing_model === "per_sqm") {
        const cells = cellsByPurpose[id] ?? [];
        if (cells.length > 0)
          payload.push({ hall_usage_purpose_id: id, selected_cells: cells });
      } else if (p.pricing_model === "per_type_per_day") {
        const count = Number(typeCountByPurpose[id]);
        if (Number.isInteger(count) && count >= 1)
          payload.push({
            hall_usage_purpose_id: id,
            product_type_count: count,
          });
      }
    }

    let cancelled = false;
    if (cal.selectedDates.length === 0 || payload.length === 0) {
      void (async () => {
        await Promise.resolve();
        if (!cancelled) setComputedByPurpose({});
      })();
      return () => {
        cancelled = true;
      };
    }

    const t = setTimeout(() => {
      void (async () => {
        try {
          const quote = await getHallPriceQuote(
            room.id,
            cal.selectedDates.length,
            payload,
          );
          if (cancelled) return;
          const map: Record<number, number> = {};
          quote.purposes.forEach((q) => {
            map[q.hall_usage_purpose_id] = q.computed_price;
          });
          setComputedByPurpose(map);
        } catch {
          if (!cancelled) setComputedByPurpose({});
        }
      })();
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id, datesKey, checkedKey, cellsKey, typeKey]);

  const togglePurpose = (id: number, on: boolean) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
    setError(null);
  };

  const proceed = () => {
    if (cal.selectedDates.length === 0) {
      setError("กรุณาเลือกวันที่ต้องการใช้พื้นที่อย่างน้อย 1 วัน");
      return;
    }
    if (checked.size === 0) {
      setError("กรุณาเลือกวัตถุประสงค์การขอใช้พื้นที่อย่างน้อย 1 ข้อ");
      return;
    }
    const draftPurposes: HallDraftPurpose[] = [];
    for (const id of checked) {
      const p = purposeById[id];
      if (!p) continue;
      const draft: HallDraftPurpose = {
        hallUsagePurposeId: id,
        pricingModel: p.pricing_model,
        name: p.name,
      };
      if (p.pricing_model === "per_sqm") {
        const cells = cellsByPurpose[id] ?? [];
        if (cells.length === 0) {
          setError(`กรุณาเลือกพื้นที่บูธบนผังสำหรับ "${p.name}"`);
          return;
        }
        draft.selectedCells = cells;
        draft.cellSizeM = cellSizeByPurpose[id];
      }
      if (p.pricing_model === "per_type_per_day") {
        const count = Number(typeCountByPurpose[id]);
        if (!Number.isInteger(count) || count < 1) {
          setError(
            `กรุณาระบุจำนวนประเภทสินค้า (จำนวนเต็มตั้งแต่ 1) สำหรับ "${p.name}"`,
          );
          return;
        }
        draft.productTypeCount = count;

        // ต้องระบุชื่อสินค้าที่จะแจกให้ครบทุกประเภท (1 ชื่อต่อ 1 ประเภท)
        const rawNames = productNamesByPurpose[id] ?? [];
        const names = Array.from({ length: count }, (_, i) =>
          (rawNames[i] ?? "").trim(),
        );
        if (names.some((n) => n === "")) {
          setError(
            `กรุณาระบุชื่อสินค้าที่จะแจกให้ครบทั้ง ${count} ประเภท สำหรับ "${p.name}"`,
          );
          return;
        }
        draft.productNames = names;
      }
      draft.computedPrice = computedByPurpose[id];
      const priceStr = (priceByPurpose[id] ?? "").trim();
      if (priceStr !== "") {
        const price = Number(priceStr);
        if (!Number.isInteger(price) || price <= 0) {
          setError(`ราคาที่เสนอสำหรับ "${p.name}" ต้องเป็นจำนวนเต็มบวก`);
          return;
        }
        const floor = computedByPurpose[id];
        if (floor !== undefined && price < floor) {
          setError(
            `ราคาที่เสนอสำหรับ "${p.name}" ต่ำกว่าเกณฑ์ที่กำหนด (ขั้นต่ำ ฿${floor.toLocaleString()})`,
          );
          return;
        }
        draft.proposedPrice = price;
      }
      draftPurposes.push(draft);
    }

    const draft: HallBookingDraft = {
      locationId: room.id,
      dates: cal.selectedDates,
      purposes: draftPurposes,
    };
    sessionStorage.setItem(
      `hall_booking_draft_${room.id}`,
      JSON.stringify(draft),
    );
    router.push(`/bookings/${room.id}/confirm`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          ขอใช้พื้นที่โถง — {room.name}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          เลือกวันที่ต้องการใช้พื้นที่ (เลือกได้หลายวัน)
          และระบุวัตถุประสงค์การขอใช้
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        <MonthlyCalendar
          currentMonth={cal.currentMonth}
          today={cal.today}
          minBookableDate={cal.minBookableDate}
          selectedDates={cal.selectedDates}
          onToggleDate={cal.toggleDate}
          onPrev={cal.prevMonth}
          onNext={cal.nextMonth}
          onToday={cal.goToToday}
          onClearAll={cal.clearAll}
          getDayInfo={cal.getDayInfo}
        />

        <div className="lg:sticky lg:top-24 flex flex-col gap-4">
          {/* Hall info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative h-40">
              <img
                src={room.image}
                alt={room.name}
                className="h-full w-full object-cover"
              />
              {/* ไล่เฉดดำล่างรูปให้ชื่อ (สีขาว) อ่านออก */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-white font-bold text-base drop-shadow-sm">
                  {room.name}
                </span>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <p className="flex items-center gap-1.5 text-sm font-medium text-brand-primary">
                <MapPin size={13} className="text-brand-primary shrink-0" />
                {[room.building, room.floor].filter(Boolean).join(" · ")}
              </p>
              {/* โถงไม่มีความจุ/ราคา-รายชั่วโมง จึงแสดงเฉพาะสิ่งอำนวยความสะดวก (ถ้ามี) */}
              {room.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((a) => (
                    <span
                      key={a}
                      className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected dates */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              วันที่เลือก ({cal.selectedDates.length})
            </p>
            {cal.selectedDates.length === 0 ? (
              <p className="text-sm text-red-400">ยังไม่ได้เลือกวัน</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {cal.selectedDates.map((d) => (
                  <span
                    key={d}
                    className="flex items-center gap-1.5 text-xs bg-orange-50 border border-orange-100 text-brand-primary px-2.5 py-1 rounded-full"
                  >
                    <CalendarDays size={12} />
                    {formatThaiDate(d)}
                    <button
                      onClick={() => cal.removeDate(d)}
                      className="hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Purposes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              วัตถุประสงค์การขอใช้พื้นที่{" "}
              <span className="text-red-400">*</span>
            </p>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                <Loader2 size={16} className="animate-spin" /> กำลังโหลด...
              </div>
            ) : purposes.length === 0 ? (
              <p className="text-sm text-gray-400">
                ยังไม่มีวัตถุประสงค์ที่เปิดให้เลือก
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {purposes.map((p) => {
                  const on = checked.has(p.id);
                  const isBooth = p.pricing_model === "per_sqm";
                  const isPerType = p.pricing_model === "per_type_per_day";
                  const cells = cellsByPurpose[p.id] ?? [];
                  // จำนวนช่องชื่อสินค้าที่จะแสดง = จำนวนประเภทที่ระบุ (จำกัด 50 กันเรนเดอร์เกินจำเป็น)
                  const typeCount = (() => {
                    const n = Number(typeCountByPurpose[p.id]);
                    return Number.isInteger(n) && n >= 1 ? Math.min(n, 50) : 0;
                  })();
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "rounded-xl border p-3 transition-colors",
                        on
                          ? "border-brand-primary/40 bg-orange-50/50"
                          : "border-gray-100",
                      )}
                    >
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <Checkbox
                          checked={on}
                          onCheckedChange={(v) =>
                            togglePurpose(p.id, v === true)
                          }
                          className="mt-0.5"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800">
                            {p.name}
                          </p>
                          {p.description && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {p.description}
                            </p>
                          )}
                        </div>
                      </label>

                      {on && (
                        <div className="mt-3 pl-7 flex flex-col gap-2.5">
                          {isBooth && (
                            <div>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  if (cal.selectedDates.length === 0) {
                                    setError(
                                      "กรุณาเลือกวันก่อนเลือกพื้นที่บูธ",
                                    );
                                    return;
                                  }
                                  setSelectorFor(p.id);
                                }}
                                className="h-9 rounded-lg text-xs font-semibold border-brand-primary/30 text-brand-primary hover:bg-orange-50 gap-1.5"
                              >
                                <Grid3X3 size={14} />
                                {cells.length > 0
                                  ? `เลือกแล้ว ${cells.length} ช่อง — แก้ไข`
                                  : "เลือกพื้นที่บนผัง"}
                              </Button>
                              {cal.selectedDates.length === 0 && (
                                <p className="text-[11px] text-gray-400 mt-1">
                                  * เลือกวันก่อน
                                </p>
                              )}
                            </div>
                          )}
                          {isPerType && (
                            <div className="flex flex-col gap-2.5">
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                  จำนวนประเภทสินค้า
                                </label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={typeCountByPurpose[p.id] ?? ""}
                                  onChange={(e) =>
                                    setTypeCountByPurpose((prev) => ({
                                      ...prev,
                                      [p.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="เช่น 3"
                                  className="h-9 w-32 rounded-lg"
                                />
                              </div>
                              {typeCount > 0 && (
                                <div>
                                  <label className="text-xs text-gray-500 block mb-1">
                                    ชื่อสินค้าที่จะแจก{" "}
                                    <span className="text-red-400">*</span>
                                  </label>
                                  <div className="flex flex-col gap-1.5">
                                    {Array.from({ length: typeCount }).map(
                                      (_, i) => (
                                        <div
                                          key={i}
                                          className="flex items-center gap-2"
                                        >
                                          <span className="text-[11px] text-gray-400 w-4 text-right shrink-0">
                                            {i + 1}.
                                          </span>
                                          <Input
                                            type="text"
                                            value={
                                              productNamesByPurpose[p.id]?.[i] ??
                                              ""
                                            }
                                            onChange={(e) => {
                                              const v = e.target.value;
                                              setProductNamesByPurpose(
                                                (prev) => {
                                                  const arr = [
                                                    ...(prev[p.id] ?? []),
                                                  ];
                                                  arr[i] = v;
                                                  return {
                                                    ...prev,
                                                    [p.id]: arr,
                                                  };
                                                },
                                              );
                                            }}
                                            placeholder={`เช่น สินค้าประเภทที่ ${i + 1}`}
                                            className="h-9 flex-1 rounded-lg"
                                          />
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {/* {computedByPurpose[p.id] !== undefined && (
                            <p className="text-xs text-gray-600">
                              <span className="font-semibold text-brand-primary">
                                ราคาที่ระบบคำนวณ: ฿
                                {computedByPurpose[p.id].toLocaleString()}
                              </span>
                              {cal.selectedDates.length > 1 &&
                                ` · ${cal.selectedDates.length} วัน`}
                            </p>
                          )} */}
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">
                              ราคาที่เสนอ (บาท) — ไม่บังคับ
                            </label>
                            <Input
                              type="number"
                              min={1}
                              value={priceByPurpose[p.id] ?? ""}
                              onChange={(e) =>
                                setPriceByPurpose((prev) => ({
                                  ...prev,
                                  [p.id]: e.target.value,
                                }))
                              }
                              className="h-9 w-40 rounded-lg"
                            />
                            {(() => {
                              const floor = computedByPurpose[p.id];
                              const raw = (priceByPurpose[p.id] ?? "").trim();
                              if (floor === undefined || raw === "")
                                return null;
                              const val = Number(raw);
                              if (Number.isFinite(val) && val < floor) {
                                return (
                                  <p className="text-[11px] text-red-500 mt-1">
                                    ราคาที่เสนอต่ำกว่าเกณฑ์ที่มหาวิทยาลัยกำหนด
                                  </p>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-500 px-1">{error}</p>}

          <Button
            onClick={proceed}
            className="w-full h-12 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-base"
          >
            ถัดไป
          </Button>
        </div>
      </div>

      {selectorFor !== null && (
        <HallFloorPlanSelector
          hallId={room.id}
          hallName={room.name}
          dates={cal.selectedDates}
          initialSelected={cellsByPurpose[selectorFor] ?? []}
          onClose={() => setSelectorFor(null)}
          onConfirm={(cells, size) => {
            setCellsByPurpose((prev) => ({ ...prev, [selectorFor]: cells }));
            setCellSizeByPurpose((prev) => ({ ...prev, [selectorFor]: size }));
            setSelectorFor(null);
            setError(null);
          }}
        />
      )}
    </div>
  );
}
