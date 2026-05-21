"use client"

import AdminAreaHeader from "@/features/areas/components/admin/AdminAreaHeader";
import AdminAreaFilters from "@/features/areas/components/admin/AdminAreaFilters";
import AdminAreaGrid from "@/features/areas/components/admin/AdminAreaGrid";
import { useAreaFilters } from "@/features/areas/hooks/useAreaFilters";

export default function AdminAreasPage() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    handleResetFilters,
    filteredLocations,
    categories
  } = useAreaFilters();

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <AdminAreaHeader />

      {/* Filters Section */}
      <AdminAreaFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onReset={handleResetFilters}
      />

      {/* Content Section */}
      <AdminAreaGrid 
        filteredLocations={filteredLocations}
        categories={categories}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
}
