"use client";

import React, { useState } from "react";
import BookingHeader from "@/features/booking/components/booking/BookingHeader";
import BookingFilters from "@/features/booking/components/booking/BookingFilters";
import BookingGrid from "@/features/booking/components/booking/BookingGrid";
import BookingCreateDrawer from "@/features/booking/components/booking/BookingCreateDrawer";
import PaymentVerificationModal from "@/features/booking/components/booking/PaymentVerificationModal";
import { useBookingFilters } from "@/features/booking/hooks/useBookingFilters";
import { mockMeetingBookings } from "@/features/booking/data/meeting-bookings";
import { Button } from "@/components/ui/button";
import { Banknote } from "lucide-react";

export default function MeetingBookingPage() {
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
  } = useBookingFilters(mockMeetingBookings);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPaymentVerifyOpen, setIsPaymentVerifyOpen] = useState(false);

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <BookingHeader
        title="การจัดการขอใช้พื้นที่ - ห้องประชุม"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "การจัดการขอใช้พื้นที่" },
          { label: "ห้องประชุม" },
        ]}
        onCreateClick={() => setIsCreateOpen(true)}
        buttonLabel="ยื่นขอจองห้องประชุม"
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
      />

      {/* Create Drawer */}
      <BookingCreateDrawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAdd={handleAddBooking}
        type="meeting"
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
