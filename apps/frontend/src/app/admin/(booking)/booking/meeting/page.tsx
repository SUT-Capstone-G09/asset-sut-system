"use client"

import React, { useState } from "react";
import BookingHeader from "@/features/booking/components/admin/BookingHeader";
import BookingFilters from "@/features/booking/components/admin/BookingFilters";
import BookingGrid from "@/features/booking/components/admin/BookingGrid";
import BookingCreateDrawer from "@/features/booking/components/admin/BookingCreateDrawer";
import { useBookingFilters } from "@/features/booking/hooks/useBookingFilters";
import { mockMeetingBookings } from "@/features/booking/data/meeting-bookings";

export default function MeetingBookingPage() {
  const {
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
    handleDeleteBooking
  } = useBookingFilters(mockMeetingBookings);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <BookingHeader
        title="การจัดการขอใช้พื้นที่ - ห้องประชุม"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "การจัดการขอใช้พื้นที่" },
          { label: "ห้องประชุม" }
        ]}
        onCreateClick={() => setIsCreateOpen(true)}
        buttonLabel="ยื่นขอจองห้องประชุม"
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
    </div>
  );
}