"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import BookingHeader from "@/features/booking/components/booking/BookingHeader";
import RoomFilters from "@/features/booking/components/rooms/RoomFilters";
import RoomGrid from "@/features/booking/components/rooms/RoomGrid";
import RoomCreateDrawer from "@/features/booking/components/rooms/RoomCreateDrawer";
import { useRoomFilters } from "@/features/booking/hooks/useRoomFilters";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import ManageExpensesModal from "@/features/booking/components/rooms/ManageExpensesModal";

export default function ManageRoomsPage() {
  const {
    loading,
    isAdmin,
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
    handleDeleteRoom,
  } = useRoomFilters();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExpensesOpen, setIsExpensesOpen] = useState(false);

  // Staff with no assigned locations
  if (!loading && !isAdmin && filteredRooms.length === 0 && searchQuery === "" &&
    selectedCategory === "all" && selectedStatus === "all" && selectedBuilding === "all") {
    return (
      <div className="p-8">
        <BookingHeader
          title="จัดการข้อมูลห้องเรียนและห้องประชุม"
          breadcrumbs={[
            { label: isAdmin ? "Admin" : "Staff", href: "/admin" },
            { label: "การจัดการห้อง" },
            { label: "รายชื่อห้องทั้งหมด" }
          ]}
          onCreateClick={() => setIsCreateOpen(true)}
          buttonLabel="เพิ่มข้อมูลห้อง"
        />
        <div className="mt-16 flex flex-col items-center justify-center py-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="p-6 bg-white rounded-xl shadow-lg shadow-slate-100 mb-5">
            <Building2 size={48} className="text-slate-300" />
          </div>
          <p className="text-lg font-bold text-slate-700">ยังไม่มีสถานที่ที่ได้รับมอบหมาย</p>
          <p className="text-sm text-slate-400 mt-1 text-center max-w-xs">
            คุณยังไม่ได้รับมอบหมายให้ดูแลสถานที่ใด กรุณาติดต่อผู้ดูแลระบบ (Admin) เพื่อ assign สถานที่ให้กับบัญชีของคุณ
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-6 px-5 py-2.5 bg-[#f26522] hover:bg-[#f26522]/90 text-white text-sm font-bold rounded-xl transition-colors"
          >
            สร้างสถานที่ใหม่
          </button>
        </div>

        <RoomCreateDrawer
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSave={handleAddRoom}
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <BookingHeader
        title="จัดการข้อมูลห้องเรียนและห้องประชุม"
        breadcrumbs={[
          { label: isAdmin ? "Admin" : "Staff", href: "/admin" },
          { label: "การจัดการห้อง" },
          { label: "รายชื่อห้องทั้งหมด" },
        ]}
        onCreateClick={() => setIsCreateOpen(true)}
        buttonLabel="เพิ่มข้อมูลห้อง"
        extraAction={
          isAdmin ? (
            <Button
              onClick={() => setIsExpensesOpen(true)}
              variant="outline"
              className="h-11 px-6 rounded-[7px] font-bold text-xs border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 cursor-pointer"
            >
              <Wallet size={16} className="text-[#f26522]" />
              <span>จัดการค่าใช้จ่าย</span>
            </Button>
          ) : undefined
        }
      />

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

      <RoomGrid
        filteredRooms={filteredRooms}
        buildings={buildings}
        isLoading={loading}
        onResetFilters={handleResetFilters}
        onUpdateStatus={handleUpdateRoomStatus}
        onEdit={handleEditRoom}
        onDelete={handleDeleteRoom}
        canDelete={isAdmin}
      />

      <RoomCreateDrawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleAddRoom}
      />

      {isAdmin && (
        <ManageExpensesModal
          open={isExpensesOpen}
          onClose={() => setIsExpensesOpen(false)}
        />
      )}
    </div>
  );
}
