"use client";

import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import { ChevronDown, Info, MapPin, Trash2, Users, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Room } from "@/features/bookings/types";
import { DayBookingTime } from "@/features/bookings/types/booking-calendar";
import { matchesFullDay } from "@/features/bookings/hooks/useBookingCalendar";
import { calculateSlotPrice } from "@/features/bookings/utils/pricing";
import { cn } from "@/lib/utils";

const TIME_OPTIONS: string[] = [];
for (let h = 7; h <= 21; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 21) TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:30`);
}

function calcHours(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
}

function Toggle({
  checked, onChange, disabled,
}: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors",
        checked ? "bg-brand-primary" : "bg-gray-200",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-4"
        )}
      />
    </button>
  );
}

function TimeDropdown({
  value, onChange, label, minTime,
}: { value: string; onChange: (v: string) => void; label?: string; minTime?: string }) {
  const options = minTime ? TIME_OPTIONS.filter((t) => t > minTime) : TIME_OPTIONS;
  return (
    <div className="flex flex-col gap-0.5 flex-1">
      {label && <span className="text-xs text-gray-400">{label}</span>}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white hover:border-gray-300 transition-colors text-sm text-gray-700 w-full outline-none cursor-pointer">
            <span className="flex-1 text-left">{value}</span>
            <ChevronDown size={12} className="text-gray-400 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-52 overflow-y-auto p-1 min-w-[110px]">
          {options.map((t) => (
            <DropdownMenuItem
              key={t}
              onClick={() => onChange(t)}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1.5 text-sm transition-colors",
                value === t ? "text-brand-primary font-medium bg-brand-primary/5" : "text-gray-700"
              )}
            >
              {t}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface BookingPanelProps {
  room: Room;
  selectedDates: string[];
  getEffectiveTime: (dateStr: string) => DayBookingTime;
  updateDayTime: (dateStr: string, field: keyof DayBookingTime, value: string) => void;
  removeDate: (dateStr: string) => void;
  fullDayDates: Record<string, boolean>;
  toggleFullDay: (dateStr: string) => void;
  hasExistingBooking: (dateStr: string) => boolean;
  isFullDayAvailable: boolean;
  allFullDay: boolean;
  setAllFullDay: (v: boolean) => void;
  sameTimeForAll: boolean;
  setSameTimeForAll: (v: boolean) => void;
  globalTime: DayBookingTime;
  updateGlobalTime: (field: keyof DayBookingTime, value: string) => void;
  totalStats: { totalHours: number; totalPrice: number };
  onConfirm: () => void;
  getTimeConflict: (dateStr: string, startTime: string, endTime: string) => [string, string] | null;
}

export default function BookingPanel({
  room, selectedDates, getEffectiveTime, updateDayTime, removeDate,
  fullDayDates, toggleFullDay, hasExistingBooking, isFullDayAvailable, allFullDay, setAllFullDay,
  sameTimeForAll, setSameTimeForAll, globalTime, updateGlobalTime, totalStats, onConfirm,
  getTimeConflict,
}: BookingPanelProps) {
  const hasConflict = selectedDates.some((dateStr) => {
    const t = getEffectiveTime(dateStr);
    return getTimeConflict(dateStr, t.startTime, t.endTime) !== null;
  });
  const someSelectedDayHasBooking = selectedDates.some(hasExistingBooking);

  return (
    <div className="flex flex-col gap-4">
      {/* Room Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="relative h-40">
          <img src={room.image} alt={room.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <span className="text-white font-bold text-base">{room.name}</span>
            <span className="text-white text-sm font-medium bg-black/30 px-2 py-0.5 rounded-full">
              ฿{room.pricePerHour.toLocaleString()} / ชม.
            </span>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-2">
          <p className="flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin size={13} className="text-brand-primary" />
            {[room.building, room.floor].filter(Boolean).join(" ")}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              <Users size={11} /> {room.capacityMax} ที่นั่ง
            </span>
            {room.amenities.map((a) => (
              <span key={a} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                <Wifi size={11} /> {a}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">รายละเอียดการจอง</h3>
          {selectedDates.length > 0 && (
            <span className="bg-brand-primary text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              {selectedDates.length} วัน
            </span>
          )}
        </div>

        {selectedDates.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">เลือกวันในปฏิทินเพื่อจอง</p>
        ) : (
          <>
            {/* Same time toggle — only relevant when 2+ days selected */}
            {selectedDates.length >= 2 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">ใช้เวลาเดียวกันทุกวัน</span>
                <Toggle checked={sameTimeForAll} onChange={setSameTimeForAll} />
              </div>
            )}

            {/* Full-day toggle for all selected days — only relevant when 2+ days selected */}
            {selectedDates.length >= 2 && isFullDayAvailable && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  จองเต็มวันทั้งหมด{" "}
                  <span className="text-gray-400 text-xs">
                    (฿{room.pricePerDay?.toLocaleString()}/วัน)
                  </span>
                  {someSelectedDayHasBooking && (
                    <span className="block text-xs text-amber-600">
                      บางวันมีการจองอยู่แล้ว จะข้ามวันนั้น
                    </span>
                  )}
                </span>
                <Toggle
                  checked={allFullDay}
                  onChange={setAllFullDay}
                  disabled={!allFullDay && selectedDates.every(hasExistingBooking)}
                />
              </div>
            )}

            {/* Global time input */}
            {sameTimeForAll && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl">
                  <TimeDropdown
                    label="เวลาเริ่ม"
                    value={globalTime.startTime}
                    onChange={(v) => {
                      updateGlobalTime("startTime", v);
                      if (v >= globalTime.endTime) {
                        const next = TIME_OPTIONS.find((t) => t > v);
                        if (next) updateGlobalTime("endTime", next);
                      }
                    }}
                  />
                  <span className="text-gray-400 mt-4">-</span>
                  <TimeDropdown
                    label="เวลาสิ้นสุด"
                    value={globalTime.endTime}
                    onChange={(v) => updateGlobalTime("endTime", v)}
                    minTime={globalTime.startTime}
                  />
                </div>
                {selectedDates.map((dateStr) => {
                  const conflict = getTimeConflict(dateStr, globalTime.startTime, globalTime.endTime);
                  if (!conflict) return null;
                  return (
                    <p key={dateStr} className="text-xs text-red-500 flex items-center gap-1 px-1">
                      ⚠️ {dateStr}: ช่วง {conflict[0]}–{conflict[1]} ถูกจองแล้ว
                    </p>
                  );
                })}
              </div>
            )}

            {/* Per-day items */}
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
              {selectedDates.map((dateStr) => {
                const date = parseISO(dateStr);
                const label = format(date, "EEEE, d MMM.", { locale: th });
                const time = getEffectiveTime(dateStr);
                const isFull = (fullDayDates[dateStr] || matchesFullDay(time)) && isFullDayAvailable;
                const hours = calcHours(time.startTime, time.endTime);
                const price = isFull
                  ? (room.pricePerDay as number)
                  : calculateSlotPrice(time.startTime, time.endTime, room.pricePerHour, room.pricePerHourOffPeak ?? room.pricePerHour, room.pricePerDay);

                return (
                  <div key={dateStr} className="border border-gray-100 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">{label}</span>
                      <button
                        onClick={() => removeDate(dateStr)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {isFullDayAvailable && (() => {
                      const blocked = !isFull && hasExistingBooking(dateStr);
                      return (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            จองเต็มวัน{" "}
                            <span className="text-gray-400">(฿{room.pricePerDay?.toLocaleString()})</span>
                            {blocked && (
                              <span className="block text-amber-600">มีการจองอยู่แล้วในวันนี้</span>
                            )}
                          </span>
                          <Toggle checked={isFull} onChange={() => toggleFullDay(dateStr)} disabled={blocked} />
                        </div>
                      );
                    })()}

                    {!isFull && !sameTimeForAll && (() => {
                      const conflict = getTimeConflict(dateStr, time.startTime, time.endTime);
                      return (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <TimeDropdown
                              value={time.startTime}
                              onChange={(v) => {
                                updateDayTime(dateStr, "startTime", v);
                                if (v >= time.endTime) {
                                  const next = TIME_OPTIONS.find((t) => t > v);
                                  if (next) updateDayTime(dateStr, "endTime", next);
                                }
                              }}
                            />
                            <span className="text-gray-400">-</span>
                            <TimeDropdown
                              value={time.endTime}
                              onChange={(v) => updateDayTime(dateStr, "endTime", v)}
                              minTime={time.startTime}
                            />
                          </div>
                          {conflict && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                              ⚠️ ช่วง {conflict[0]}–{conflict[1]} ถูกจองแล้ว
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{isFull ? "เต็มวัน" : `${hours} ชม.`}</span>
                      <span className="font-medium text-gray-600">
                        ฿{price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                รวม {totalStats.totalHours} ชั่วโมง
              </span>
              <span className="text-xl font-bold text-brand-primary">
                ฿{totalStats.totalPrice.toLocaleString()}
              </span>
            </div>

            {/* General disclaimer, not itemized — actual add-on costs (if
                any) depend on the specific room/request and are decided by
                staff later, so listing exact items/prices here would imply
                a precision the system can't back for every room. */}
            <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
              <Info size={13} className="text-gray-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 leading-relaxed">
                ราคานี้เป็นค่าห้องเท่านั้น อาจมีค่าใช้จ่ายเพิ่มเติม เช่น ค่าแม่บ้าน ค่าไฟฟ้า
                หรือค่าบริการอื่น ๆ ตามที่เจ้าหน้าที่กำหนดภายหลัง
              </p>
            </div>

            <Button
              onClick={onConfirm}
              disabled={hasConflict}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold h-11 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ดำเนินการต่อ →
            </Button>
            {hasConflict && (
              <p className="text-xs text-red-500 text-center">กรุณาแก้ไขช่วงเวลาที่ซ้อนกับการจองที่มีอยู่ก่อน</p>
            )}
          </>
        )}
      </div>

      {/* Tip */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex gap-2 text-sm text-orange-700">
        <span>💡</span>
        <span>คลิกลากเพื่อเลือกหลายวันต่อกันอย่างรวดเร็ว</span>
      </div>
    </div>
  );
}
