"use client";

import React from "react";
import { Store, ChevronLeft, ChevronRight } from "lucide-react";
import { Tenant } from "../../types";
import { TenantListItem } from "./TenantListItem";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TenantListProps {
  tenants: Tenant[];
  selectedTenantId?: string;
  onSelect: (tenant: Tenant) => void;
}

export function TenantList({ tenants, selectedTenantId, onSelect }: TenantListProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(4);

  React.useEffect(() => {
    const handleResize = () => {
      setPageSize(window.innerWidth >= 1024 ? 5 : 4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset to first page when filtered list changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [tenants.length]);

  const totalPages = Math.max(1, Math.ceil(tenants.length / pageSize));

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paged = tenants.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  if (tenants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[340px] lg:min-h-[420px] text-slate-400 bg-slate-50 rounded-md border border-dashed border-slate-200">
        <Store size={36} className="mb-3 opacity-25" />
        <p className="text-sm font-medium">ไม่พบข้อมูลผู้เช่าที่ค้นหา</p>
        <p className="text-xs text-slate-300 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3">
      {/* List */}
      <div className="space-y-2.5 min-h-[340px] lg:min-h-[420px]">
        {paged.map((tenant) => (
          <TenantListItem
            key={tenant.id}
            tenant={tenant}
            isSelected={selectedTenantId === tenant.id}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-md text-slate-400 disabled:opacity-30"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft size={15} />
          </Button>

          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p as number)}
                className={cn(
                  "w-8 h-8 rounded-md text-xs font-semibold transition-colors",
                  currentPage === p
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100"
                )}
              >
                {p}
              </button>
            )
          )}

          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-md text-slate-400 disabled:opacity-30"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <ChevronRight size={15} />
          </Button>
        </div>
      )}
    </div>
  );
}
