"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import BookingHeader from "@/features/booking/components/booking/BookingHeader";
import BookingFilters from "@/features/booking/components/booking/BookingFilters";
import BookingGrid from "@/features/booking/components/booking/BookingGrid";
import BookingCreateDrawer from "@/features/booking/components/booking/BookingCreateDrawer";
import PaymentVerificationModal from "@/features/booking/components/booking/PaymentVerificationModal";
import { useBookingFilters } from "@/features/booking/hooks/useBookingFilters";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Banknote, GraduationCap, Building2, ArrowRight, Calendar, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";

function AdminBookingPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get active view type from URL query: "classroom", "meeting", or default to "all" (the selection page)
  const activeType = searchParams.get("type") as "classroom" | "meeting" | null;
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
    handleDeleteBooking,
    loading,
  } = useBookingFilters(currentType);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPaymentVerifyOpen, setIsPaymentVerifyOpen] = useState(false);

  const handleSelectType = (type: "classroom" | "meeting") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", type);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Helper categories to calculate counts
  const classroomCategories = ["ห้องบรรยาย", "ห้องปฏิบัติการ", "ห้องสัมมนา"];

  // Calculate stats for selection view (when currentType === "all")
  const stats = useMemo(() => {
    if (currentType !== "all") return { classroom: { total: 0, pending: 0 }, meeting: { total: 0, pending: 0 } };

    const classroomList = bookings.filter((b) =>
      classroomCategories.some((cat) => b.category.includes(cat) || cat.includes(b.category))
    );
    const meetingList = bookings.filter((b) =>
      !classroomCategories.some((cat) => b.category.includes(cat) || cat.includes(b.category))
    );

    return {
      classroom: {
        total: classroomList.length,
        pending: classroomList.filter((b) => b.status === "pending").length,
      },
      meeting: {
        total: meetingList.length,
        pending: meetingList.filter((b) => b.status === "pending").length,
      },
    };
  }, [bookings, currentType]);

  // Render Selection View (Cards)
  if (currentType === "all") {
    return (
      <div className="p-8 space-y-8 animate-in fade-in duration-300">
        {/* Breadcrumb & Title */}
        <div className="space-y-4">
          <AssetBreadcrumb
            items={[
              { label: "Admin", href: "/admin" },
              { label: "ขอใช้พื้นที่" },
            ]}
          />
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">ขอใช้พื้นที่</h1>
        </div>

        {/* Section Header */}
        <div className="flex items-center gap-4 group">
          <div className="w-1.5 h-6 bg-[#f26522] rounded-full shadow-[0_0_15px_rgba(242,101,34,0.3)]" />
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">ประเภทการขอใช้พื้นที่</h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
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
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              <div className="mt-6 space-y-4 w-full">
                <h3 className="text-2xl font-bold tracking-tight text-slate-800">ห้องเรียน</h3>
                <p className="text-sm text-slate-400">
                  ห้องบรรยาย, ห้องปฏิบัติการ, ห้องสัมมนา และห้องสำหรับการเรียนรู้อื่นๆ
                </p>

                {/* Stat line */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">คำขอทั้งหมด</span>
                    <span className="text-2xl font-black text-slate-700">
                      {loading ? "..." : stats.classroom.total} <span className="text-xs font-bold text-slate-400">รายการ</span>
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">รออนุมัติ</span>
                    <span className="text-2xl font-black text-amber-500">
                      {loading ? "..." : stats.classroom.pending} <span className="text-xs font-bold text-slate-400">รายการ</span>
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
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              <div className="mt-6 space-y-4 w-full">
                <h3 className="text-2xl font-bold tracking-tight text-slate-800">โถง / ห้องประชุม</h3>
                <p className="text-sm text-slate-400">
                  ห้องประชุมย่อย/ขนาดกลาง/ใหญ่, โถงกิจกรรม, ลานกิจกรรม และพื้นที่สาธารณะ
                </p>

                {/* Stat line */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">คำขอทั้งหมด</span>
                    <span className="text-2xl font-black text-slate-700">
                      {loading ? "..." : stats.meeting.total} <span className="text-xs font-bold text-slate-400">รายการ</span>
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">รออนุมัติ</span>
                    <span className="text-2xl font-black text-amber-500">
                      {loading ? "..." : stats.meeting.pending} <span className="text-xs font-bold text-slate-400">รายการ</span>
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

  // Render Detail View (Classroom or Meeting)
  const isClassroom = currentType === "classroom";
  const typeLabel = isClassroom ? "ห้องเรียน" : "ห้องประชุม";

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
        extraAction={
          <Button
            onClick={() => setIsPaymentVerifyOpen(true)}
            variant="outline"
            className="h-11 px-5 rounded-[7px] font-bold text-xs border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 cursor-pointer bg-white"
          >
            <Banknote size={16} className="text-[#f26522]" />
            <span>ตรวจสอบการชำระเงิน</span>
          </Button>
        }
      />

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
        onDelete={handleDeleteBooking}
        isLoading={loading}
      />

      {/* Create Drawer */}
      <BookingCreateDrawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAdd={handleAddBooking}
        type={currentType}
      />

      {/* Payment Verification Modal */}
      <PaymentVerificationModal
        open={isPaymentVerifyOpen}
        onClose={() => setIsPaymentVerifyOpen(false)}
        bookings={bookings}
        onUpdateBooking={handleEditBooking}
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
