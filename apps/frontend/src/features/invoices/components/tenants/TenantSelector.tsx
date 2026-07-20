"use client";

import React, { useState, useMemo } from "react";
import { mockTenants } from "../../data/mock";
import { Tenant } from "../../types";
import { TenantSearchBar, TenantFilterState } from "./TenantSearchBar";
import { TenantList } from "./TenantList";

interface TenantSelectorProps {
  onSelect: (tenant: Tenant) => void;
  selectedTenantId?: string;
}

const DEFAULT_FILTERS: TenantFilterState = {
  search: "",
  buildingTypeId: "all",
  buildingId: "all",
};

export function TenantSelector({ onSelect, selectedTenantId }: TenantSelectorProps) {
  const [filters, setFilters] = useState<TenantFilterState>(DEFAULT_FILTERS);

  const filteredTenants = useMemo(() => {
    return mockTenants.filter((t) => {
      // Search filter
      const q = filters.search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.shopCode.toLowerCase().includes(q) ||
        t.contractNo.toLowerCase().includes(q) ||
        t.room.toLowerCase().includes(q);

      // Building type filter
      const matchesType =
        filters.buildingTypeId === "all" ||
        t.buildingTypeId === Number(filters.buildingTypeId);

      // Building (location) filter
      const matchesBuilding =
        filters.buildingId === "all" ||
        t.buildingId === Number(filters.buildingId);

      return matchesSearch && matchesType && matchesBuilding;
    });
  }, [filters]);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div>
        <h2 className="text-base font-bold text-slate-800">
          1. เลือกผู้เช่าที่ต้องการอัปโหลดใบแจ้งหนี้
        </h2>
      </div>

      {/* Search + Filters */}
      <TenantSearchBar filters={filters} onChange={setFilters} />

      {/* List with Pagination */}
      <TenantList
        tenants={filteredTenants}
        selectedTenantId={selectedTenantId}
        onSelect={onSelect}
      />
    </div>
  );
}
