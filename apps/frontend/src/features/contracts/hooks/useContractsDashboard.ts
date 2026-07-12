import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { tenantAreaOptions } from "@/features/tenants/data/tenant-areas";
import { generateMockTenants, MockTenant } from "@/features/tenants/data/mock-tenants";
import { ContractItem } from "../types/contract";

export function useContractsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Dynamic tenants state to allow adding newly created mock tenants instantly
  const initialTenants = useMemo(() => {
    return tenantAreaOptions.flatMap((area) => generateMockTenants(area.id, area.subLocations));
  }, []);

  const [tenantsList, setTenantsList] = useState<MockTenant[]>([]);

  useEffect(() => {
    setTenantsList(initialTenants);
  }, [initialTenants]);

  // Aggregate contracts from active tenants list
  const allContracts = useMemo((): ContractItem[] => {
    return tenantsList.flatMap((tenant) => {
      if (!tenant.contracts) return [];
      const areaId = tenant.id.split("-")[0];
      const areaName = tenantAreaOptions.find((a) => a.id === areaId)?.name || "โรงอาหาร";

      return tenant.contracts.map((contract) => ({
        ...contract,
        tenantId: tenant.id,
        tenantName: tenant.ownerName,
        shopName: tenant.name,
        businessType: tenant.businessType,
        subLocation: tenant.subLocation,
        areaId,
        areaName,
      }));
    });
  }, [tenantsList]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBusinessType, setSelectedBusinessType] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  // Create Contract Drawer Form States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [initialAreaId, setInitialAreaId] = useState("cafeterias");

  // Toast Notification State
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  // Check URL triggers to auto-open drawer
  const createParam = searchParams.get("create");
  const areaIdParam = searchParams.get("areaId");

  useEffect(() => {
    if (createParam === "true") {
      setIsCreateModalOpen(true);
      if (areaIdParam && tenantAreaOptions.some((a) => a.id === areaIdParam)) {
        setInitialAreaId(areaIdParam);
      }
    }
  }, [createParam, areaIdParam]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedArea("all");
    setSelectedStatus("all");
    setSelectedBusinessType("all");
    setSelectedYear("all");
  };

  // Callback when contract drawer successfully creates a contract
  const handleCreateSuccess = (newTenant: MockTenant) => {
    setTenantsList((prev) => [newTenant, ...prev]);
    setIsCreateModalOpen(false);
    showToast(
      `สร้างสัญญาเช่าสำหรับร้าน ${newTenant.name} สำเร็จ และอัปเดตสิทธิ์ของ ${newTenant.ownerName} เป็น Tenant เรียบร้อย`,
      "success"
    );
  };

  // Status statistics calculation
  const stats = useMemo(() => {
    const result = {
      total: allContracts.length,
      active: 0,
      expiring: 0,
      expired: 0,
      terminated: 0,
    };
    allContracts.forEach((c) => {
      if (c.status === "active") result.active++;
      else if (c.status === "expiring") result.expiring++;
      else if (c.status === "expired") result.expired++;
      else if (c.status === "terminated") result.terminated++;
    });
    return result;
  }, [allContracts]);

  // Filter and sort contracts
  const filteredAndSortedContracts = useMemo(() => {
    let result = [...allContracts];

    // Search filter
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.contractNumber.toLowerCase().includes(q) ||
          c.tenantName.toLowerCase().includes(q) ||
          c.shopName.toLowerCase().includes(q)
      );
    }

    // Area filter
    if (selectedArea !== "all") {
      result = result.filter((c) => c.areaId === selectedArea);
    }

    // Status filter
    if (selectedStatus !== "all") {
      result = result.filter((c) => c.status === selectedStatus);
    }

    // Business type filter
    if (selectedBusinessType !== "all") {
      result = result.filter((c) => c.businessType === selectedBusinessType);
    }

    // Year filter (based on start date)
    if (selectedYear !== "all") {
      result = result.filter((c) => c.startDate.startsWith(selectedYear));
    }

    // Default sorting priority
    const statusPriority: Record<string, number> = {
      expiring: 1,
      active: 2,
      expired: 3,
      terminated: 4,
    };

    result.sort((a, b) => {
      const priorityA = statusPriority[a.status] || 99;
      const priorityB = statusPriority[b.status] || 99;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    });

    return result;
  }, [allContracts, searchTerm, selectedArea, selectedStatus, selectedBusinessType, selectedYear]);

  // Navigate helpers
  const handleViewTenant = (areaId: string, tenantId: string) => {
    router.push(`/admin/tenants/lists/${areaId}/${tenantId}`);
  };

  const handleManageContract = (tenantId: string, contractId: string, action?: "renew" | "terminate") => {
    const actionParam = action ? `&action=${action}` : "";
    router.push(`/admin/contracts/actions?tenantId=${tenantId}&contractId=${contractId}${actionParam}`);
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedArea,
    setSelectedArea,
    selectedStatus,
    setSelectedStatus,
    selectedBusinessType,
    setSelectedBusinessType,
    selectedYear,
    setSelectedYear,
    isCreateModalOpen,
    setIsCreateModalOpen,
    initialAreaId,
    toast,
    showToast,
    handleResetFilters,
    handleCreateSuccess,
    stats,
    filteredAndSortedContracts,
    handleViewTenant,
    handleManageContract,
  };
}
