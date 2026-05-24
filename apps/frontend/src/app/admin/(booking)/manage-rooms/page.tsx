"use client"

import React, { useState } from "react";
import BookingHeader from "@/features/booking/components/admin/BookingHeader";
import RoomFilters from "@/features/booking/components/rooms/RoomFilters";
import RoomGrid from "@/features/booking/components/rooms/RoomGrid";
import RoomCreateDrawer from "@/features/booking/components/rooms/RoomCreateDrawer";
import { useRoomFilters } from "@/features/booking/hooks/useRoomFilters";
import { mockRooms } from "@/features/booking/data/rooms";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import ManageExpensesModal from "@/features/booking/components/rooms/ManageExpensesModal";

export default function ManageRoomsPage() {
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
    filteredRooms,
    categories,
    buildings,
    handleAddRoom,
    handleUpdateRoomStatus,
    handleEditRoom,
    handleDeleteRoom
  } = useRoomFilters(mockRooms);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExpensesOpen, setIsExpensesOpen] = useState(false);

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <BookingHeader
        title="จัดการข้อมูลห้องเรียนและห้องประชุม"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "การจัดการห้อง" },
          { label: "รายชื่อห้องทั้งหมด" }
        ]}
        onCreateClick={() => setIsCreateOpen(true)}
        buttonLabel="เพิ่มข้อมูลห้อง"
        extraAction={
          <Button
            onClick={() => setIsExpensesOpen(true)}
            variant="outline"
            className="h-11 px-6 rounded-[7px] font-bold text-xs border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 cursor-pointer"
          >
            <Wallet size={16} className="text-[#f26522]" />
            <span>จัดการค่าใช้จ่าย</span>
          </Button>
        }
      />

      {/* Filters Section */}
      <RoomFilters 
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
      <RoomGrid 
        filteredRooms={filteredRooms}
        buildings={buildings}
        onResetFilters={handleResetFilters}
        onUpdateStatus={handleUpdateRoomStatus}
        onEdit={handleEditRoom}
        onDelete={handleDeleteRoom}
      />

      {/* Create Drawer */}
      <RoomCreateDrawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleAddRoom}
      />

      {/* Expenses Management Modal */}
      <ManageExpensesModal
        open={isExpensesOpen}
        onClose={() => setIsExpensesOpen(false)}
      />
    </div>
  );
}