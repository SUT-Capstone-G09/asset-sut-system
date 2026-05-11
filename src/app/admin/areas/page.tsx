import React from "react";
import AdminAreaHeader from "@/features/areas/components/admin/AdminAreaHeader";
import AdminAreaFilters from "@/features/areas/components/admin/AdminAreaFilters";
import AdminAreaGrid from "@/features/areas/components/admin/AdminAreaGrid";

export default function AdminAreasPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <AdminAreaHeader />

      {/* Filters Section */}
      <AdminAreaFilters />

      {/* Content Section (Cards grouped by building) */}
      <AdminAreaGrid />
    </div>
  );
}
