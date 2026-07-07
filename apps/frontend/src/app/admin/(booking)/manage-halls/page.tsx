"use client";

import { useState } from "react";
import BookingHeader from "@/features/booking/components/booking/BookingHeader";
import RoomFilters from "@/features/booking/components/rooms/RoomFilters";
import HallGrid from "@/features/halls/components/admin/HallGrid";
import HallCreateDrawer from "@/features/halls/components/admin/HallCreateDrawer";
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

  return (
    <div className="p-8 space-y-8">
      <BookingHeader
        title="จัดการโถงพื้นที่"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "การจองพื้นที่" },
          { label: "จัดการโถงพื้นที่" },
        ]}
        onCreateClick={() => setIsCreateOpen(true)}
        buttonLabel="เพิ่มโถงพื้นที่"
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
    </div>
  );
}
