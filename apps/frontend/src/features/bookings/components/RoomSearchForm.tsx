"use client";

import { useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown, Clock, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BookingMode, RoomSearchParams } from "@/features/bookings/types";
import { cn } from "@/lib/utils";

const TIME_OPTIONS: string[] = [];
for (let h = 7; h <= 21; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 21) TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:30`);
}

const CAPACITY_OPTIONS = [10, 30, 50, 100, 300, 500, 1500];

const MODES: { label: string; value: BookingMode }[] = [
  { label: "วันเดียว", value: "single" },
  { label: "ช่วงวัน", value: "range" },
];

interface RoomSearchFormProps {
  params: RoomSearchParams;
  onUpdate: <K extends keyof RoomSearchParams>(key: K, value: RoomSearchParams[K]) => void;
  onSearch: () => void;
}

function DatePickerButton({
  label, date, onChange, minDate,
}: {
  label: string;
  date: Date | undefined;
  onChange: (d: Date | undefined) => void;
  minDate?: Date;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className={cn(
            "flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-white hover:border-gray-300 transition-colors text-sm min-w-[160px]",
            !date && "text-gray-400"
          )}>
            <CalendarIcon size={15} className="text-gray-400 shrink-0" />
            {date ? format(date, "d MMM yyyy", { locale: th }) : "เลือกวันที่"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => { onChange(d); setOpen(false); }}
            disabled={{ before: minDate ?? new Date() }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function TimeDropdown({
  label, value, onChange, minTime,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  minTime?: string;
}) {
  const options = minTime ? TIME_OPTIONS.filter((t) => t > minTime) : TIME_OPTIONS;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={cn(
            "flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-white hover:border-gray-300 transition-colors text-sm min-w-[150px] outline-none cursor-pointer",
            !value && "text-gray-400"
          )}>
            <Clock size={15} className="text-gray-400 shrink-0" />
            <span className="flex-1 text-left">{value ?? "เลือกเวลา"}</span>
            <ChevronDown size={13} className="text-gray-400 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-56 overflow-y-auto p-1 min-w-[150px]">
          {options.map((t) => (
            <DropdownMenuItem
              key={t}
              onClick={() => onChange(t)}
              className={cn(
                "cursor-pointer rounded-md px-3 py-2 text-sm transition-colors",
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

function CapacityDropdown({ value, onChange }: { value: number | undefined; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">จำนวนคน</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={cn(
            "flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-white hover:border-gray-300 transition-colors text-sm min-w-[150px] outline-none cursor-pointer",
            value == null && "text-gray-400"
          )}>
            <Users size={15} className="text-gray-400 shrink-0" />
            <span className="flex-1 text-left">{value != null ? `${value} คน` : "เลือกจำนวน"}</span>
            <ChevronDown size={13} className="text-gray-400 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="p-1 min-w-[150px]">
          {CAPACITY_OPTIONS.map((c) => (
            <DropdownMenuItem
              key={c}
              onClick={() => onChange(c)}
              className={cn(
                "cursor-pointer rounded-md px-3 py-2 text-sm transition-colors",
                value === c ? "text-brand-primary font-medium bg-brand-primary/5" : "text-gray-700"
              )}
            >
              {c} คน
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function RoomSearchForm({ params, onUpdate, onSearch }: RoomSearchFormProps) {
  const isRange = params.mode === "range";

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900">ค้นหาห้องที่ว่าง</h2>
      <p className="text-gray-500 text-sm mt-1 mb-6">เลือกวันเวลาและความต้องการของคุณ</p>

      <div className="flex gap-2 mb-6">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => onUpdate("mode", m.value)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
              params.mode === m.value
                ? "bg-brand-primary text-white border-brand-primary"
                : "bg-white text-gray-600 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <DatePickerButton
          label={isRange ? "วันเริ่ม" : "วันที่"}
          date={params.startDate}
          onChange={(d) => {
            onUpdate("startDate", d);
            if (params.endDate && d && d > params.endDate) onUpdate("endDate", undefined);
          }}
        />

        {isRange && (
          <DatePickerButton
            label="วันสิ้นสุด"
            date={params.endDate}
            onChange={(d) => onUpdate("endDate", d)}
            minDate={params.startDate ?? new Date()}
          />
        )}

        <TimeDropdown
          label="เวลาเริ่ม"
          value={params.startTime}
          onChange={(v) => {
            onUpdate("startTime", v);
            if (params.endTime && v >= params.endTime) {
              const next = TIME_OPTIONS.find((t) => t > v);
              if (next) onUpdate("endTime", next);
            }
          }}
        />

        <TimeDropdown
          label="เวลาสิ้นสุด"
          value={params.endTime}
          onChange={(v) => onUpdate("endTime", v)}
          minTime={params.startTime}
        />

        <CapacityDropdown
          value={params.capacity}
          onChange={(v) => onUpdate("capacity", v)}
        />

        <Button
          onClick={onSearch}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-2.5 h-auto font-bold rounded-lg flex items-center gap-2"
        >
          <Search size={16} />
          ค้นหา
        </Button>
      </div>
    </div>
  );
}
