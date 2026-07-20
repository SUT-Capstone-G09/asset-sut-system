import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { tenantAreaOptions } from "@/features/space-rental/data/tenant-areas";
import { generateMockTenants, MockTenant } from "@/features/space-rental/data/mock-tenants";
import { mockBuildings } from "@/features/space-rental/data/mock-buildings";
import { mockLocations } from "@/features/space-rental/data/mock-rental-spaces";
import { mockFloorPlans } from "@/features/space-rental/data/mock-floor-plans";
import { mockStallContracts } from "@/features/space-rental/data/mock-stall-contracts";
import { ContractItem } from "../types/contract";

import { mockContractStore } from "../data/mockContractStore";

export function useContractsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tenantsList, setTenantsList] = useState<MockTenant[]>([]);

  const reloadTenants = () => {
    setTenantsList(mockContractStore.getTenants());
  };

  useEffect(() => {
    reloadTenants();
    // Sync across tabs and state updates
    window.addEventListener("storage", reloadTenants);
    // Also poll every 1 second in development to keep views instantly in sync
    const interval = setInterval(reloadTenants, 1000);
    return () => {
      window.removeEventListener("storage", reloadTenants);
      clearInterval(interval);
    };
  }, []);

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
    const updated = [newTenant, ...tenantsList];
    setTenantsList(updated);
    mockContractStore.saveTenants(updated);
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
    const parts = tenantId.split("-");
    const subLocationIndex = Number(parts[1]);
    const tenantIndex = Number(parts[2]);
    
    const area = tenantAreaOptions.find((a) => a.id === areaId);
    const subLocationName = area?.subLocations[subLocationIndex];
    
    const building = mockBuildings.find((b) => b.name === subLocationName);
    
    if (building) {
      const tenant = tenantsList.find((t) => t.id === tenantId);
      const tenantName = tenant?.name;

      // Check if building has a floor plan
      const fp = mockFloorPlans.find((f) => f.locationId === String(building.id));
      if (fp) {
        const shops = fp.elements.filter((el) => el.type === "area" && el.areaType === "shop");
        const tName = tenantName?.toLowerCase();

        let stall = fp.elements.find((el) => {
          if (el.type !== "area" || el.areaType !== "shop") return false;
          const labelKey = el.label || "";
          const contract = mockStallContracts[labelKey];
          const contractTenant = contract?.tenantName?.toLowerCase();
          const elName = el.name?.toLowerCase();
          const elTenant = el.tenant?.toLowerCase();

          return (
            (contractTenant && (contractTenant.includes(tName || "") || (tName || "").includes(contractTenant))) ||
            (elName && (elName.includes(tName || "") || (tName || "").includes(elName))) ||
            (elTenant && (elTenant.includes(tName || "") || (tName || "").includes(elTenant)))
          );
        });

        // Fallback to index if name doesn't match directly
        if (!stall && shops.length > 0 && !isNaN(tenantIndex)) {
          stall = shops[tenantIndex % shops.length];
        }

        const stallId = stall ? stall.id : "s1";
        router.push(`/admin/space-rental/building/${building.id}/space/${building.id}-${stallId}`);
      } else {
        const space = mockLocations.find(
          (l) => l.building === subLocationName && 
          (l.tenantName === tenantName || l.name === tenantName)
        );
        
        if (space) {
          router.push(`/admin/space-rental/building/${building.id}/space/${space.id}`);
        } else {
          router.push(`/admin/space-rental/building/${building.id}`);
        }
      }
    } else {
      router.push("/admin/space-rental");
    }
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

