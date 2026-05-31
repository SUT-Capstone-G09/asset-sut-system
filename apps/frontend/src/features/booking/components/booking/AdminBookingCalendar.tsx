"use client";

import React, { useState, useMemo } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isSameDay, 
  addMonths, 
  subMonths
} from "date-fns";
import { th } from "date-fns/locale";
import { 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  FileText, 
  Calendar as CalendarIcon, 
  Building2, 
  Layers, 
  TrendingUp, 
  Clock, 
  AlertCircle
} from "lucide-react";
import Link from "next/link";

import { Booking } from "../../types/booking";
import { Room } from "../../types/room";
import { mockRooms } from "../../data/rooms";
import { mockClassroomBookings } from "../../data/classroom-bookings";
import { mockMeetingBookings } from "../../data/meeting-bookings";
import BookingDrawer from "./BookingDrawer";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const DOW = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

export default function AdminBookingCalendar() {
  // Current date showing on the calendar (default to May 2026 as mock data is populated here)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 4, 1)); // May 2026

  // Unique list of buildings from mockRooms
  const buildingsList = useMemo(() => {
    return Array.from(new Set(mockRooms.map((r) => r.building)));
  }, []);

  // Filter States
  const [selectedBuilding, setSelectedBuilding] = useState<string>("อาคารเรียนรวม 1");
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>("B1101");

  // Rooms filtered by the selected building
  const filteredRooms = useMemo(() => {
    if (selectedBuilding === "all") {
      return mockRooms;
    }
    return mockRooms.filter((r) => r.building === selectedBuilding);
  }, [selectedBuilding]);

  // Selected Room Object
  const selectedRoom = useMemo(() => {
    return mockRooms.find((r) => r.roomNumber === selectedRoomNumber && r.building === selectedBuilding);
  }, [selectedRoomNumber, selectedBuilding]);

  // Merge classroom and meeting bookings, then inject extra bookings to populate calendar like mockup
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const baseBookings = [...mockClassroomBookings, ...mockMeetingBookings];
    
    // Inject extra mockup-like bookings for room B1101 (in อาคารเรียนรวม 1) in May 2026
    const extraBookings: Booking[] = [
      {
        id: "EXTRA-001",
        roomName: "ห้องบรรยาย B1101",
        roomNumber: "B1101",
        building: "อาคารเรียนรวม 1",
        category: "ห้องบรรยาย",
        requesterName: "นายสมชาย เจริญสุข",
        requesterId: "B6500999",
        requesterType: "student",
        purpose: "Meeting 3",
        date: "2026-05-01",
        timeSlot: "09:00 - 11:00 น.",
        status: "approved",
        attendees: 15,
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
        createdAt: "2026-04-28 10:00 น.",
        contactPhone: "089-999-9999",
        contactEmail: "somchai.j@g.sut.ac.th",
        equipment: ["เครื่องฉายโปรเจคเตอร์", "ไมโครโฟนไร้สาย"]
      },
      {
        id: "EXTRA-002",
        roomName: "ห้องบรรยาย B1101",
        roomNumber: "B1101",
        building: "อาคารเรียนรวม 1",
        category: "ห้องบรรยาย",
        requesterName: "สโมสรนักศึกษา",
        requesterId: "ACT-005",
        requesterType: "student",
        purpose: "Student Activity - Pending",
        date: "2026-05-04",
        timeSlot: "13:00 - 18:00 น.",
        status: "pending",
        attendees: 50,
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
        createdAt: "2026-04-29 11:30 น.",
        contactPhone: "088-888-8888",
        contactEmail: "student.act@g.sut.ac.th"
      },
      {
        id: "EXTRA-003",
        roomName: "ห้องบรรยาย B1101",
        roomNumber: "B1101",
        building: "อาคารเรียนรวม 1",
        category: "ห้องบรรยาย",
        requesterName: "อ.ดร.วิชาการ ดีเลิศ",
        requesterId: "STAFF-099",
        requesterType: "staff",
        purpose: "Lecture C",
        date: "2026-05-06",
        timeSlot: "10:00 - 15:00 น.",
        status: "approved",
        attendees: 80,
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
        createdAt: "2026-04-30 09:00 น.",
        contactPhone: "087-777-7777",
        contactEmail: "academic.d@sut.ac.th"
      },
      {
        id: "EXTRA-004",
        roomName: "ห้องบรรยาย B1101",
        roomNumber: "B1101",
        building: "อาคารเรียนรวม 1",
        category: "ห้องบรรยาย",
        requesterName: "ฝ่ายซ่อมบำรุงอาคาร",
        requesterId: "MAINT-001",
        requesterType: "staff",
        purpose: "Maintenance",
        date: "2026-05-06",
        timeSlot: "15:00 - 17:00 น.",
        status: "rejected", // Will style this as gray "Maintenance"
        attendees: 2,
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
        createdAt: "2026-05-01 08:00 น.",
        notes: "ซ่อมบำรุงระบบเครื่องปรับอากาศและเปลี่ยนหลอดไฟที่ชำรุด"
      },
      {
        id: "EXTRA-005",
        roomName: "ห้องบรรยาย B1101",
        roomNumber: "B1101",
        building: "อาคารเรียนรวม 1",
        category: "ห้องบรรยาย",
        requesterName: "ชมรมดนตรีสากล",
        requesterId: "MUSIC-09",
        requesterType: "student",
        purpose: "Activity A",
        date: "2026-05-13",
        timeSlot: "08:00 - 17:00 น.",
        status: "pending",
        attendees: 25,
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
        createdAt: "2026-05-02 13:00 น."
      }
    ];

    return [...baseBookings, ...extraBookings];
  });

  // Drawer state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Month navigation
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Calendar dates computation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  // Filtered Bookings for the calendar display
  const calendarBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Exclude bookings that are rejected
      if (b.status === "rejected") return false;

      // 2. Exclude bookings for rooms that are under maintenance
      const room = mockRooms.find((r) => r.roomNumber === b.roomNumber && r.building === b.building);
      if (room?.status === "maintenance") return false;

      const matchesBuilding = selectedBuilding === "all" || b.building === selectedBuilding;
      const matchesRoom = selectedRoomNumber === "all" || b.roomNumber === selectedRoomNumber;
      return matchesBuilding && matchesRoom;
    });
  }, [bookings, selectedBuilding, selectedRoomNumber]);

  // Statistics
  const todayBookingsCount = useMemo(() => {
    const todayStr = format(new Date(2026, 4, 31), "yyyy-MM-dd"); // Use May 31, 2026 as simulated "today"
    return calendarBookings.filter((b) => b.date === todayStr).length;
  }, [calendarBookings]);

  const pendingBookingsCount = useMemo(() => {
    return calendarBookings.filter((b) => b.status === "pending" || b.status === "verifying_payment").length;
  }, [calendarBookings]);

  // Booking updates from drawer
  const handleUpdateStatus = (id: string, status: Booking["status"]) => {
    setBookings((prev) => 
      prev.map((b) => b.id === id ? { ...b, status } : b)
    );
  };

  const handleEditBooking = (updatedBooking: Booking, mode: "this" | "following" | "all" = "this") => {
    setBookings((prev) => {
      if (!updatedBooking.recurringGroupId || mode === "this") {
        const target = updatedBooking.recurringGroupId && mode === "this"
          ? { ...updatedBooking, recurringGroupId: undefined }
          : updatedBooking;
        return prev.map((b) => b.id === target.id ? target : b);
      }

      const originalBooking = prev.find((b) => b.id === updatedBooking.id);
      const originalDate = originalBooking ? originalBooking.date : updatedBooking.date;

      return prev.map((b) => {
        if (b.recurringGroupId === updatedBooking.recurringGroupId) {
          const shouldUpdate =
            mode === "all" ||
            (mode === "following" && b.date >= originalDate);

          if (shouldUpdate) {
            return {
              ...updatedBooking,
              id: b.id,      // Keep original ID
              date: b.date,  // Keep original Date
            };
          }
        }
        return b;
      });
    });
  };

  const handleDeleteBooking = (
    idOrFilter: string | { id: string; recurringGroupId: string; mode: "this" | "following" | "all"; date: string }
  ) => {
    setBookings((prev) => {
      if (typeof idOrFilter === "string") {
        return prev.filter((b) => b.id !== idOrFilter);
      }
      const { id, recurringGroupId, mode, date } = idOrFilter;
      if (mode === "this") {
        return prev.filter((b) => b.id !== id);
      } else if (mode === "following") {
        return prev.filter((b) => !(b.recurringGroupId === recurringGroupId && b.date >= date));
      } else { // all
        return prev.filter((b) => b.recurringGroupId !== recurringGroupId);
      }
    });
  };

  const openBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDrawerOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Custom Styles for Landscape A4 One-Page Printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide layout components and non-calendar elements */
          header, aside, .print-hide {
            display: none !important;
          }
          
          /* Reset page margins and main offset */
          main {
            margin-left: 0 !important;
            padding-top: 0 !important;
            min-height: auto !important;
            background: transparent !important;
          }
          
          body, html {
            background-color: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          
          /* Make calendar card print-friendly and force it into exactly 1 page */
          #print-calendar-card {
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            height: 98vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
          }

          /* Compact Calendar Header padding */
          #print-calendar-card > div:first-of-type {
            padding: 8px 16px !important;
          }

          /* Compact Days header padding */
          #print-calendar-card > div:nth-of-type(2) {
            background-color: #f8fafc !important;
          }
          #print-calendar-card > div:nth-of-type(2) > div {
            padding-top: 4px !important;
            padding-bottom: 4px !important;
          }

          /* Compact Day grid to divide height equally without overflowing */
          #print-calendar-card > div:nth-of-type(3) {
            flex: 1 1 auto !important;
            display: grid !important;
            grid-template-rows: repeat(5, 1fr) !important;
            min-height: 0 !important;
            height: auto !important;
          }

          /* Remove min-height from individual day cells and pad lightly */
          #print-calendar-card > div:nth-of-type(3) > div {
            min-height: 0 !important;
            height: auto !important;
            padding: 4px 6px !important;
          }

          /* Shrink font size of date number */
          #print-calendar-card > div:nth-of-type(3) > div span {
            font-size: 10px !important;
          }

          /* Shrink booking badges to look clean and tiny */
          #print-calendar-card button {
            padding: 2px 4px !important;
            margin-top: 1px !important;
            border-radius: 3px !important;
          }
          #print-calendar-card button span {
            font-size: 8px !important;
            line-height: 1 !important;
          }

          /* Compact Footer stats bar */
          #print-calendar-card > div:last-of-type {
            padding: 6px 16px !important;
            background-color: #f8fafc !important;
          }

          /* Force background colors to show in PDF/print output */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Landscape setup with tight margins */
          @page {
            size: landscape;
            margin: 0.3cm;
          }
        }
      `}} />
      
      {/* Top Filter & Breadcrumbs Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-white p-5 rounded-[12px] shadow-sm border border-slate-100 print-hide">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold tracking-wider">
            <span>ADMIN</span>
            <span>/</span>
            <span>การจัดการขอใช้พื้นที่</span>
            <span>/</span>
            <span className="text-[#f26522]">ปฏิทิน</span>
          </div>
          
          <div className="flex items-center gap-3">
            <CalendarIcon className="text-[#f26522] size-6" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              ปฏิทินรายการขอใช้พื้นที่
            </h1>
          </div>
        </div>

        {/* Building & Room Selector Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          {/* Building Selector */}
          <div className="w-full sm:w-56 space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">
              ตึก / อาคาร
            </span>
            <Select 
              value={selectedBuilding} 
              onValueChange={(val) => {
                setSelectedBuilding(val);
                // Reset selected room to the first room of this new building or "all"
                const firstRoom = mockRooms.find((r) => r.building === val);
                setSelectedRoomNumber(firstRoom ? firstRoom.roomNumber : "all");
              }}
            >
              <SelectTrigger className="h-11 bg-slate-50 border-none rounded-[7px] focus:ring-1 focus:ring-[#f26522]/30 w-full text-slate-700 font-bold text-xs">
                <SelectValue placeholder="เลือกตึก/อาคาร" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs font-medium">ทุกอาคาร</SelectItem>
                {buildingsList.map((bldg) => (
                  <SelectItem key={bldg} value={bldg} className="text-xs font-medium">
                    {bldg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Room Selector */}
          <div className="w-full sm:w-56 space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">
              ห้อง
            </span>
            <Select 
              value={selectedRoomNumber} 
              onValueChange={setSelectedRoomNumber}
              disabled={selectedBuilding === "all"}
            >
              <SelectTrigger className="h-11 bg-slate-50 border-none rounded-[7px] focus:ring-1 focus:ring-[#f26522]/30 w-full text-slate-700 font-bold text-xs disabled:opacity-50">
                <SelectValue placeholder="เลือกห้อง" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs font-medium">ทุกห้อง</SelectItem>
                {filteredRooms.map((room) => (
                  <SelectItem key={room.id} value={room.roomNumber} className="text-xs font-medium">
                    {room.roomName.replace("ห้องบรรยาย ", "").replace("ห้องปฏิบัติการคอมพิวเตอร์ ", "").replace("ห้องสัมมนา ", "").replace("ห้องประชุมสารนิเทศ ", "").replace("ห้องประชุมวิชาการ ", "")} ({room.roomNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Calendar Card */}
      <div id="print-calendar-card" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        
        {/* Calendar Header with Room Info & Month Navigator */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>
                {selectedRoomNumber === "all"
                  ? `ทุกห้อง ${selectedBuilding !== "all" ? `ใน ${selectedBuilding}` : ""}`
                  : `ห้อง ${selectedRoomNumber} ${selectedBuilding}`}
              </span>
              {selectedRoom?.status === "maintenance" && (
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-[5px] border border-slate-200">
                  ปิดปรับปรุง
                </span>
              )}
            </h2>
            
            {/* Month selector */}
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-slate-700 capitalize">
                {format(currentMonth, "LLLL yyyy", { locale: th })}
              </span>
              <div className="flex items-center gap-1 print-hide">
                <button 
                  onClick={handlePrevMonth} 
                  className="size-8 rounded-lg hover:bg-slate-100 border border-slate-200/50 flex items-center justify-center transition-all cursor-pointer text-slate-600"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={handleNextMonth} 
                  className="size-8 rounded-lg hover:bg-slate-100 border border-slate-200/50 flex items-center justify-center transition-all cursor-pointer text-slate-600"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs & Legend */}
          <div className="flex flex-col items-end gap-3">
            {/* Navigation Tabs */}
            <div className="bg-slate-50 p-1 rounded-xl flex items-center border border-slate-100 shadow-inner print-hide">
              <Link 
                href="/admin/calendar"
                className="px-4 py-2 rounded-lg text-xs font-bold transition-all bg-[#f26522] text-white shadow-sm"
              >
                ปฏิทิน
              </Link>
              <Link 
                href="/admin/booking/classroom"
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 transition-all"
              >
                รายการขอใช้พื้นที่
              </Link>
            </div>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100 select-none">
          {DOW.map((day, i) => (
            <div 
              key={day} 
              className={`py-3 text-center text-xs font-black tracking-wider uppercase border-r border-slate-100 last:border-r-0 ${
                i === 0 || i === 6 ? "text-[#f26522]" : "text-slate-400"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 grid-rows-5 border-collapse">
          {days.map((day, idx) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const inMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

            // Find bookings for this day
            const dayBookings = calendarBookings.filter((b) => b.date === dateStr);

            return (
              <div 
                key={dateStr} 
                className={`min-h-[140px] border-b border-r border-slate-100 last:border-r-0 flex flex-col p-2.5 transition-all group ${
                  !inMonth ? "bg-slate-50/40 text-slate-300 pointer-events-none" : "bg-white hover:bg-slate-50/30"
                }`}
              >
                {/* Date Label */}
                <div className="flex items-center justify-between mb-2">
                  <span 
                    className={`size-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      isTodayDate 
                        ? "bg-[#f26522] text-white shadow-md shadow-[#f26522]/20" 
                        : inMonth 
                          ? isWeekend 
                            ? "text-[#f26522]" 
                            : "text-slate-800" 
                          : "text-slate-300"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  
                  {isTodayDate && (
                    <span className="text-[9px] font-black text-[#f26522] uppercase tracking-wide bg-[#f26522]/5 px-1.5 py-0.5 rounded-[4px] border border-[#f26522]/10 select-none">
                      วันนี้
                    </span>
                  )}
                </div>

                {/* Booking list */}
                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto no-scrollbar max-h-[90px]">
                  {inMonth && dayBookings.map((booking) => {
                    // Decide background styles based on status
                    let badgeClass = "";
                    if (booking.status === "approved") {
                      // Emerald Style for Approved
                      badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100/80 shadow-sm";
                    } else if (booking.status === "pending") {
                      // Amber Style for Pending
                      badgeClass = "bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-100/80 shadow-sm";
                    } else if (booking.status === "pending_payment") {
                      // Sky Style for Pending Payment
                      badgeClass = "bg-sky-50 text-sky-700 border-sky-200/60 hover:bg-sky-100/80 shadow-sm";
                    } else if (booking.status === "verifying_payment") {
                      // Indigo Style for Verifying Payment
                      badgeClass = "bg-indigo-50 text-indigo-700 border-indigo-200/60 hover:bg-indigo-100/80 shadow-sm";
                    } else if (booking.status === "rejected") {
                      // Red Style for Rejected
                      badgeClass = "bg-red-50 text-red-600 border-red-200/60 hover:bg-red-100/80 shadow-sm";
                    } else {
                      // Gray Style for default / maintenance
                      badgeClass = "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 shadow-sm";
                    }

                    return (
                      <button
                        key={booking.id}
                        onClick={() => openBookingDetails(booking)}
                        className={`w-full text-left px-2 py-1.5 rounded-[5px] border text-[10px] transition-all flex flex-col gap-0.5 cursor-pointer shadow-sm ${badgeClass}`}
                      >
                        <span className="font-bold truncate leading-tight">
                          {booking.purpose}
                        </span>
                        <span className="text-[8px] opacity-75 font-mono">
                          {booking.timeSlot.replace(" น.", "")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legends bar */}
        <div className="bg-slate-50/30 p-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-bold text-slate-500 select-none">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-emerald-500 border border-emerald-600/10 shadow-sm" />
            <span>อนุมัติแล้ว (Approved)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-amber-400 border border-amber-500/10 shadow-sm" />
            <span>รออนุมัติ (Pending)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-sky-500 border border-sky-600/10 shadow-sm" />
            <span>รอชำระเงิน (Pending Payment)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-indigo-500 border border-indigo-600/10 shadow-sm" />
            <span>รอตรวจสอบการชำระเงิน (Verifying Payment)</span>
          </div>
        </div>

        {/* Footer Statistics & Actions */}
        <div className="bg-slate-50/50 p-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Info stats */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-[7px] border border-slate-200/50 shadow-sm">
              <TrendingUp size={14} className="text-[#f26522]" />
              <span>รวมการจองวันนี้:</span>
              <span className="text-slate-800 font-extrabold font-mono text-sm">{todayBookingsCount} รายการ</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-[7px] border border-slate-200/50 shadow-sm">
              <AlertCircle size={14} className="text-amber-500" />
              <span>รออนุมัติ:</span>
              <span className="text-slate-800 font-extrabold font-mono text-sm">{pendingBookingsCount} รายการ</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto print-hide">
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="h-10 px-4 rounded-[7px] font-bold text-xs border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 cursor-pointer bg-white w-full sm:w-auto shrink-0"
            >
              <Printer size={14} className="text-slate-400" />
              <span>พิมพ์ตาราง</span>
            </Button>
          </div>
        </div>

      </div>

      {/* Booking Detail Drawer */}
      <BookingDrawer
        booking={selectedBooking}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onEdit={handleEditBooking}
        onDelete={handleDeleteBooking}
      />
      
    </div>
  );
}
