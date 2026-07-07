"use client"

import { useState, useMemo, useEffect, useCallback } from "react";
import { Hall } from "../types/hall";
import {
  getHalls,
  getHallTypeId,
  locationToHall,
  createLocation,
  updateLocation,
  deleteLocation,
  savePricingTiers,
} from "../services/hallService";
import { AdminLocationDTO, StatusMeta } from "@/features/booking/services/locationService";
import { getCurrentUser } from "@/lib/utils/auth";

export function useHalls() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [locationDTOs, setLocationDTOs] = useState<Map<string, AdminLocationDTO>>(new Map());
  const [statusMeta, setStatusMeta] = useState<StatusMeta[]>([]);
  const [typeId, setTypeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBuilding, setSelectedBuilding] = useState("all");

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  const fetchHalls = useCallback(async () => {
    setLoading(true);
    try {
      const [data, tId] = await Promise.all([getHalls(), getHallTypeId()]);
      setHalls(data.map(locationToHall));
      setTypeId(tId);

      const dtoMap = new Map<string, AdminLocationDTO>();
      data.forEach((loc) => dtoMap.set(String(loc.id), loc));
      setLocationDTOs(dtoMap);

      const statusMap = new Map<number, string>();
      data.forEach((loc) => statusMap.set(loc.status_id, loc.status));
      setStatusMeta(Array.from(statusMap.entries()).map(([status_id, status]) => ({ status, status_id })));
    } catch (err) {
      console.error("Failed to load halls:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHalls(); }, [fetchHalls]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedBuilding("all");
  };

  const filteredHalls = useMemo(() => {
    return halls.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
      const matchesBuilding = selectedBuilding === "all" || item.building === selectedBuilding;
      return matchesSearch && matchesCategory && matchesStatus && matchesBuilding;
    });
  }, [halls, searchQuery, selectedCategory, selectedStatus, selectedBuilding]);

  const categories = useMemo(() => Array.from(new Set(halls.map((h) => h.category))), [halls]);
  const buildings = useMemo(() => Array.from(new Set(halls.map((h) => h.building).filter(Boolean))), [halls]);

  const resolveTypeId = useCallback(async () => typeId ?? (await getHallTypeId()), [typeId]);

  const handleAddHall = async (newHall: Hall) => {
    const tId = await resolveTypeId();
    const statusId = statusMeta.find((s) => s.status === newHall.status)?.status_id ?? 1;

    const created = await createLocation({
      type_id: tId,
      name: newHall.name,
      building: newHall.building || undefined,
      image_url: newHall.image || undefined,
      capacity: 0, // โถงไม่มีความจุ แต่ backend ต้องการค่า
      status_id: statusId,
    });
    await savePricingTiers(created.id, newHall.rates);
    const createdHall = locationToHall(created);
    setHalls((prev) => [{ ...createdHall, rates: newHall.rates }, ...prev]);
    setLocationDTOs((prev) => new Map(prev).set(String(created.id), created));
  };

  const handleUpdateHallStatus = async (id: string, status: "available" | "maintenance") => {
    const statusId = statusMeta.find((s) => s.status === status)?.status_id;
    if (statusId) {
      await updateLocation(Number(id), { status_id: statusId });
    }
    setHalls((prev) => prev.map((h) => (h.id === id ? { ...h, status } : h)));
  };

  const handleEditHall = async (updatedHall: Hall) => {
    const statusId = statusMeta.find((s) => s.status === updatedHall.status)?.status_id;
    const existingDTO = locationDTOs.get(updatedHall.id);
    const existingTierIds = existingDTO?.pricing_tiers?.map((t) => t.id) ?? [];

    // ส่ง image_url เฉพาะเมื่อเป็น object_key ใหม่ (ไม่ใช่ presigned URL เดิม)
    const newImageKey =
      updatedHall.image && !updatedHall.image.startsWith("http") ? updatedHall.image : undefined;

    await updateLocation(Number(updatedHall.id), {
      name: updatedHall.name,
      building: updatedHall.building || undefined,
      ...(newImageKey !== undefined && { image_url: newImageKey }),
      capacity: 0,
      ...(statusId && { status_id: statusId }),
    });
    await savePricingTiers(Number(updatedHall.id), updatedHall.rates, existingTierIds);
    setHalls((prev) => prev.map((h) => (h.id === updatedHall.id ? updatedHall : h)));
    setLocationDTOs((prev) => {
      const next = new Map(prev);
      const old = next.get(updatedHall.id);
      if (old) next.set(updatedHall.id, { ...old, building: updatedHall.building, pricing_tiers: [] });
      return next;
    });
  };

  const handleDeleteHall = async (id: string) => {
    await deleteLocation(Number(id));
    setHalls((prev) => prev.filter((h) => h.id !== id));
  };

  return {
    halls,
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
    totalResults: filteredHalls.length,
    handleAddHall,
    handleUpdateHallStatus,
    handleEditHall,
    handleDeleteHall,
  };
}
