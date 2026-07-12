"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface DatePickerThaiProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
}

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export function DatePickerThai({ value, onChange, placeholder = "เลือกวันที่" }: DatePickerThaiProps) {
  const initialDate = value ? new Date(value) : new Date();
  const [navDate, setNavDate] = useState(initialDate);

  const year = navDate.getFullYear();
  const month = navDate.getMonth();

  // Get number of days in the current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Get the first day of the week for the current month
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setNavDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setNavDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const selected = new Date(year, month, day);
    // Format to YYYY-MM-DD local time format
    const formatted = selected.toLocaleDateString("en-CA"); // YYYY-MM-DD
    onChange(formatted);
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const d = new Date(value);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
  };

  const getButtonText = () => {
    if (!value) return placeholder;
    const d = new Date(value);
    const day = d.getDate();
    const monthIndex = d.getMonth();
    const beYear = d.getFullYear() + 543;
    
    let shortMonthThai = THAI_MONTHS[monthIndex].substring(0, 3);
    if (shortMonthThai === "พฤษ") shortMonthThai = "พ.ค.";
    else if (shortMonthThai === "มกร") shortMonthThai = "ม.ค.";
    else if (shortMonthThai === "กุม") shortMonthThai = "ก.พ.";
    else if (shortMonthThai === "มีน") shortMonthThai = "มี.ค.";
    else if (shortMonthThai === "เมษ") shortMonthThai = "เม.ย.";
    else if (shortMonthThai === "มิถุ") shortMonthThai = "มิ.ย.";
    else if (shortMonthThai === "กรก") shortMonthThai = "ก.ค.";
    else if (shortMonthThai === "สิง") shortMonthThai = "ส.ค.";
    else if (shortMonthThai === "กัน") shortMonthThai = "ก.ย.";
    else if (shortMonthThai === "ตุล") shortMonthThai = "ต.ค.";
    else if (shortMonthThai === "พฤศ") shortMonthThai = "พ.ย.";
    else if (shortMonthThai === "ธัน") shortMonthThai = "ธ.ค.";

    return `${day} ${shortMonthThai} ${beYear}`;
  };

  // Generate calendar days
  const calendarCells = [];
  // Empty slots for previous month offset
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="w-8 h-8" />);
  }
  // Month days
  for (let day = 1; day <= daysInMonth; day++) {
    const selected = isSelected(day);
    calendarCells.push(
      <button
        key={`day-${day}`}
        type="button"
        onClick={() => handleSelectDay(day)}
        className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors flex items-center justify-center ${
          selected
            ? "bg-orange-500 text-white"
            : "text-zinc-700 hover:bg-orange-50 hover:text-orange-600"
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal border-zinc-300 hover:bg-zinc-50"
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-700">{getButtonText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 bg-white border border-zinc-200 shadow-xl rounded-2xl z-50">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-8">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-sm font-bold text-zinc-800">
              {THAI_MONTHS[month]} {year + 543}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((day) => (
              <div key={day} className="w-8 text-[11px] font-bold text-zinc-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells}
          </div>

          {/* Actions */}
          <div className="flex justify-between border-t border-zinc-100 pt-3">
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs font-bold text-red-500 hover:text-red-600 px-2 py-1 rounded transition-colors"
            >
              ล้าง
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                onChange(today.toLocaleDateString("en-CA"));
              }}
              className="text-xs font-bold text-orange-500 hover:text-orange-600 px-2 py-1 rounded transition-colors"
            >
              วันนี้
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
