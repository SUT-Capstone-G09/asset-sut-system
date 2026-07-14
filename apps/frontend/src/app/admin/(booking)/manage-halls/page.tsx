"use client";

import { useState } from "react";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingHeader from "@/features/booking/components/booking/BookingHeader";
import RoomFilters from "@/features/booking/components/rooms/RoomFilters";
import HallGrid from "@/features/halls/components/admin/HallGrid";
import HallCreateDrawer from "@/features/halls/components/admin/HallCreateDrawer";
import HallPricingDrawer from "@/features/halls/components/admin/HallPricingDrawer";
import { useHalls } from "@/features/halls/hooks/useHalls";

export default function ManageHallsPage() {
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
    filteredHalls,
    categories,
    buildings,
    handleAddHall,
    handleUpdateHallStatus,
    handleEditHall,
    handleDeleteHall,
  } = useHalls();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  return (
    <div className="p-8 space-y-8">
      <BookingHeader
        title="จัดการโถงพื้นที่"
        onCreateClick={() => setIsCreateOpen(true)}
        buttonLabel="เพิ่มโถงพื้นที่"
        extraAction={
          <Button
            variant="outline"
            onClick={() => setIsPricingOpen(true)}
            className="h-11 px-5 rounded-[7px] font-bold text-xs border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 cursor-pointer"
          >
            <Coins size={18} strokeWidth={2.5} className="text-primary" />
            <span>ตั้งราคาโถงตามอาคาร</span>
          </Button>
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

      <HallGrid
        filteredHalls={filteredHalls}
        buildings={buildings}
        isLoading={loading}
        onResetFilters={handleResetFilters}
        onUpdateStatus={handleUpdateHallStatus}
        onEdit={handleEditHall}
        onDelete={handleDeleteHall}
        canDelete={isAdmin}
      />

      <HallCreateDrawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleAddHall}
      />

      <HallPricingDrawer
        open={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />
    </div>
  );
}
