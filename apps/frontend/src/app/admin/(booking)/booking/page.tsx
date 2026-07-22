"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import BookingHeader from "@/features/booking/components/booking/BookingHeader";
import BookingFilters from "@/features/booking/components/booking/BookingFilters";
import BookingGrid from "@/features/booking/components/booking/BookingGrid";
import BookingCreateDrawer from "@/features/booking/components/booking/BookingCreateDrawer";
import { useBookingFilters, BookingTypeFilter, getBookingTypeBucket } from "@/features/booking/hooks/useBookingFilters";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  GraduationCap,
  Building2,
  ArrowRight,
  Calendar,
  ClipboardList,
  Trophy,
  DoorOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

function AdminBookingPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get active view type from URL query: "classroom", "meeting", "sport", "hall", or default to "all" (the selection page)
  const activeType = searchParams.get("type") as BookingTypeFilter | null;
  const currentType = activeType || "all";

  // Get filter actions for active type
  const {
    bookings,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedBuilding,
    setSelectedBuilding,
    handleResetFilters,
    filteredBookings,
    categories,
    buildings,
    handleAddBooking,
    handleUpdateBookingStatus,
    handleEditBooking,
    loading,
  } = useBookingFilters(currentType);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleSelectType = (type: BookingTypeFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", type);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Calculate stats for selection view (when currentType === "all")
  const stats = useMemo(() => {
    if (currentType !== "all") {
      return {
        classroom: { total: 0, pending: 0 },
        meeting: { total: 0, pending: 0 },
        sport: { total: 0, pending: 0 },
        hall: { total: 0, pending: 0 },
      };
    }

    const classroomList = bookings.filter((b) => getBookingTypeBucket(b.category) === "classroom");
    const meetingList = bookings.filter((b) => getBookingTypeBucket(b.category) === "meeting");
    const sportList = bookings.filter((b) => getBookingTypeBucket(b.category) === "sport");
    const hallList = bookings.filter((b) => getBookingTypeBucket(b.category) === "hall");

    return {
      classroom: {
        total: classroomList.length,
        pending: classroomList.filter((b) => b.status === "pending").length,
      },
      meeting: {
        total: meetingList.length,
        pending: meetingList.filter((b) => b.status === "pending").length,
      },
      sport: {
        total: sportList.length,
        pending: sportList.filter((b) => b.status === "pending").length,
      },
      hall: {
        total: hallList.length,
        pending: hallList.filter((b) => b.status === "pending").length,
      },
    };
  }, [bookings, currentType]);

  // Calculate counts for the tabs based on the 'bookings' array (which is filtered by currentType)
  const statusCounts = useMemo(() => {
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      approved: bookings.filter((b) => b.status === "approved").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      rejected: bookings.filter((b) => b.status === "rejected").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
  }, [bookings]);

  const statusTabs = [
    { id: "all", label: "ทั้งหมด", count: statusCounts.all, activeClass: "border-[#f26522] text-[#f26522]", countClass: "bg-[#f26522]/10 text-[#f26522]" },
    { id: "pending", label: "รอตรวจสอบ", count: statusCounts.pending, activeClass: "border-amber-500 text-amber-600", countClass: "bg-amber-500/10 text-amber-600" },
    { id: "approved", label: "อนุมัติ", count: statusCounts.approved, activeClass: "border-blue-500 text-blue-600", countClass: "bg-blue-500/10 text-blue-600" },
    { id: "completed", label: "เสร็จสิ้น", count: statusCounts.completed, activeClass: "border-emerald-500 text-emerald-600", countClass: "bg-emerald-500/10 text-emerald-600" },
    { id: "rejected", label: "ปฏิเสธ", count: statusCounts.rejected, activeClass: "border-rose-500 text-rose-600", countClass: "bg-rose-500/10 text-rose-600" },
    { id: "cancelled", label: "ยกเลิก", count: statusCounts.cancelled, activeClass: "border-slate-500 text-slate-600", countClass: "bg-slate-500/10 text-slate-600" },
  ];

  // Render Selection View (Cards)
  if (currentType === "all") {
    return (
      <div className="p-8 space-y-8 animate-in fade-in duration-300">
        {/* Breadcrumb & Title */}
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            ขอใช้พื้นที่
          </h1>
        </div>

        {/* Section Header */}
        <div className="flex items-center gap-4 group">
          <div className="w-1.5 h-6 bg-[#f26522] rounded-full shadow-[0_0_15px_rgba(242,101,34,0.3)]" />
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            ประเภทการขอใช้พื้นที่
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-full">
          {/* Card 1: ห้องเรียน */}
          <Card className="relative overflow-hidden border-slate-100 shadow-sm hover:border-[#f26522]/40 hover:shadow-md hover:bg-slate-50/50 transition-all duration-300">
            <button
              onClick={() => handleSelectType("classroom")}
              className="group flex h-full w-full flex-col text-left p-6 pl-7 outline-none"
            >
              <div className="absolute inset-y-0 left-0 w-1.5 transition-all duration-300 bg-transparent group-hover:bg-[#f26522]" />

              <div className="flex w-full items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f26522]/10 text-[#f26522] group-hover:bg-[#f26522] group-hover:text-white transition-all duration-300">
                  <GraduationCap size={28} strokeWidth={2.5} />
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 group-hover:text-[#f26522] group-hover:bg-[#f26522]/5 transition-all duration-300">
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4 w-full">
                <h3 className="text-2xl font-bold tracking-tight text-slate-800">
                  ห้องเรียน
                </h3>
                <p className="text-sm text-slate-400">
                  ห้องบรรยาย, ห้องปฏิบัติการ, ห้องสัมมนา
                  และห้องสำหรับการเรียนรู้อื่นๆ
                </p>

                {/* Stat line */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      คำขอทั้งหมด
                    </span>
                    <span className="text-2xl font-black text-slate-700">
                      {loading ? "..." : stats.classroom.total}{" "}
                      <span className="text-xs font-bold text-slate-400">
                        รายการ
                      </span>
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      รออนุมัติ
                    </span>
                    <span className="text-2xl font-black text-amber-500">
                      {loading ? "..." : stats.classroom.pending}{" "}
                      <span className="text-xs font-bold text-slate-400">
                        รายการ
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </Card>

          {/* Card 2: ห้องประชุม */}
          <Card className="relative overflow-hidden border-slate-100 shadow-sm hover:border-[#f26522]/40 hover:shadow-md hover:bg-slate-50/50 transition-all duration-300">
            <button
              onClick={() => handleSelectType("meeting")}
              className="group flex h-full w-full flex-col text-left p-6 pl-7 outline-none"
            >
              <div className="absolute inset-y-0 left-0 w-1.5 transition-all duration-300 bg-transparent group-hover:bg-[#f26522]" />

              <div className="flex w-full items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f26522]/10 text-[#f26522] group-hover:bg-[#f26522] group-hover:text-white transition-all duration-300">
                  <Building2 size={28} strokeWidth={2.5} />
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 group-hover:text-[#f26522] group-hover:bg-[#f26522]/5 transition-all duration-300">
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4 w-full">
                <h3 className="text-2xl font-bold tracking-tight text-slate-800">
                  ห้องประชุม
                </h3>
                <p className="text-sm text-slate-400">
                  ห้องประชุมย่อย/ขนาดกลาง/ใหญ่, โถงกิจกรรม, ลานกิจกรรม
                  และพื้นที่สาธารณะ
                </p>

                {/* Stat line */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      คำขอทั้งหมด
                    </span>
                    <span className="text-2xl font-black text-slate-700">
                      {loading ? "..." : stats.meeting.total}{" "}
                      <span className="text-xs font-bold text-slate-400">
                        รายการ
                      </span>
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      รออนุมัติ
                    </span>
                    <span className="text-2xl font-black text-amber-500">
                      {loading ? "..." : stats.meeting.pending}{" "}
                      <span className="text-xs font-bold text-slate-400">
                        รายการ
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </Card>

          {/* Card 3: สนามกีฬา */}
          <Card className="relative overflow-hidden border-slate-100 shadow-sm hover:border-[#f26522]/40 hover:shadow-md hover:bg-slate-50/50 transition-all duration-300">
            <button
              onClick={() => handleSelectType("sport")}
              className="group flex h-full w-full flex-col text-left p-6 pl-7 outline-none"
            >
              <div className="absolute inset-y-0 left-0 w-1.5 transition-all duration-300 bg-transparent group-hover:bg-[#f26522]" />

              <div className="flex w-full items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f26522]/10 text-[#f26522] group-hover:bg-[#f26522] group-hover:text-white transition-all duration-300">
                  <Trophy size={28} strokeWidth={2.5} />
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 group-hover:text-[#f26522] group-hover:bg-[#f26522]/5 transition-all duration-300">
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4 w-full">
                <h3 className="text-2xl font-bold tracking-tight text-slate-800">
                  สนามกีฬา
                </h3>
                <p className="text-sm text-slate-400">
                  สนามกีฬาในร่มและกลางแจ้ง, สระว่ายน้ำ, ศูนย์ออกกำลังกาย
                </p>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      คำขอทั้งหมด
                    </span>
                    <span className="text-2xl font-black text-slate-700">
                      {loading ? "..." : stats.sport.total}{" "}
                      <span className="text-xs font-bold text-slate-400">
                        รายการ
                      </span>
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      รออนุมัติ
                    </span>
                    <span className="text-2xl font-black text-amber-500">
                      {loading ? "..." : stats.sport.pending}{" "}
                      <span className="text-xs font-bold text-slate-400">
                        รายการ
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </Card>

          {/* Card 4: โถงอาคาร */}
          <Card className="relative overflow-hidden border-slate-100 shadow-sm hover:border-[#f26522]/40 hover:shadow-md hover:bg-slate-50/50 transition-all duration-300">
            <button
              onClick={() => handleSelectType("hall")}
              className="group flex h-full w-full flex-col text-left p-6 pl-7 outline-none"
            >
              <div className="absolute inset-y-0 left-0 w-1.5 transition-all duration-300 bg-transparent group-hover:bg-[#f26522]" />

              <div className="flex w-full items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f26522]/10 text-[#f26522] group-hover:bg-[#f26522] group-hover:text-white transition-all duration-300">
                  <DoorOpen size={28} strokeWidth={2.5} />
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 group-hover:text-[#f26522] group-hover:bg-[#f26522]/5 transition-all duration-300">
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4 w-full">
                <h3 className="text-2xl font-bold tracking-tight text-slate-800">
                  โถงอาคาร
                </h3>
                <p className="text-sm text-slate-400">
                  พื้นที่โถงอเนกประสงค์, ลานนิทรรศการ, ลานกิจกรรมชั้นล่าง
                </p>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      คำขอทั้งหมด
                    </span>
                    <span className="text-2xl font-black text-slate-700">
                      {loading ? "..." : stats.hall.total}{" "}
                      <span className="text-xs font-bold text-slate-400">
                        รายการ
                      </span>
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      รออนุมัติ
                    </span>
                    <span className="text-2xl font-black text-amber-500">
                      {loading ? "..." : stats.hall.pending}{" "}
                      <span className="text-xs font-bold text-slate-400">
                        รายการ
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </Card>
        </div>
      </div>
    );
  }

  // Render Detail View (Classroom, Meeting, Sport, Hall)
  const typeLabelMap: Record<string, string> = {
    classroom: "ห้องเรียน",
    meeting: "ห้องประชุม",
    sport: "สนามกีฬา",
    hall: "โถงอาคาร",
  };
  const typeLabel = typeLabelMap[currentType] || "พื้นที่";

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header Section */}
      <BookingHeader
        title={`การจัดการขอใช้พื้นที่ - ${typeLabel}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "ขอใช้พื้นที่", href: "/admin/booking" }, // Clicking this clears type query and returns to cards
          { label: typeLabel },
        ]}
        onCreateClick={() => setIsCreateOpen(true)}
        buttonLabel={`ยื่นขอจอง${typeLabel}`}
      />

      {/* Status Tabs Section */}
      <div className="flex space-x-6 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={cn(
              "pb-4 text-sm font-bold flex items-center gap-2 border-b-[3px] whitespace-nowrap transition-all duration-200",
              selectedStatus === tab.id
                ? tab.activeClass
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs transition-colors",
                selectedStatus === tab.id
                  ? tab.countClass
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters Section */}
      <BookingFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedBuilding={selectedBuilding}
        setSelectedBuilding={setSelectedBuilding}
        categories={categories}
        buildings={buildings}
        onReset={handleResetFilters}
      />

      {/* Content Section */}
      <BookingGrid
        filteredBookings={filteredBookings}
        buildings={buildings}
        onResetFilters={handleResetFilters}
        onUpdateStatus={handleUpdateBookingStatus}
        onEdit={handleEditBooking}
        isLoading={loading}
      />

      <BookingCreateDrawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAdd={handleAddBooking}
        type={currentType}
      />
    </div>
  );
}

export default function AdminBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f26522]" />
        </div>
      }
    >
      <AdminBookingPageContent />
    </Suspense>
  );
}
