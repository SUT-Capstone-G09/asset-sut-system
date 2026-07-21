"use client"

import { useState, useMemo, useEffect, useCallback } from "react";
import { Hall } from "../types/hall";
import {
  getHalls,
  getHallTypeId,
  getBuildings,
  locationToHall,
  createLocation,
  updateLocation,
  deleteLocation,
  BuildingDTO,
} from "../services/hallService";
import { StatusMeta } from "@/features/booking/services/locationService";
import { updateHallPricings } from "../services/hallPricingService";
import { UpdateHallPricingInput } from "../types/pricing";
import { getCurrentUser } from "@/lib/utils/auth";

export function useHalls() {
  const [halls, setHalls] = useState<Hall[]>([]);
  // ราคาไม่ได้อยู่ใน halls (แต่ละ component ไปดึงเอง) — bump ตัวนี้เพื่อบอกให้โหลดราคาใหม่หลังบันทึก
  const [pricingVersion, setPricingVersion] = useState(0);
  const [statusMeta, setStatusMeta] = useState<StatusMeta[]>([]);
  const [buildingOptions, setBuildingOptions] = useState<BuildingDTO[]>([]);
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
      const [data, tId, blds] = await Promise.all([
        getHalls(),
        getHallTypeId(),
        getBuildings(),
      ]);
      setHalls(data.map(locationToHall));
      setTypeId(tId);
      setBuildingOptions(blds);

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

  // backend เก็บอาคารเป็น building_id — ฟอร์มให้มาเป็นชื่อ จึงต้อง map กลับ (ชื่ออาคาร unique ใน DB)
  const resolveBuildingId = useCallback(
    (buildingName: string) => {
      const match = buildingOptions.find((b) => b.name === buildingName);
      if (!match) throw new Error(`ไม่พบอาคาร: ${buildingName}`);
      return match.id;
    },
    [buildingOptions],
  );

  const handleAddHall = async (newHall: Hall) => {
    const tId = await resolveTypeId();
    const statusId = statusMeta.find((s) => s.status === newHall.status)?.status_id ?? 1;

    const created = await createLocation({
      type_id: tId,
      name: newHall.name,
      description: newHall.notes ?? "",
      building_id: resolveBuildingId(newHall.building),
      image_url: newHall.image || undefined,
      capacity: 0, // โถงไม่มีความจุ แต่ backend ต้องการค่า
      status_id: statusId,
    });
    setHalls((prev) => [locationToHall(created), ...prev]);
  };

  const handleUpdateHallStatus = async (id: string, status: "available" | "maintenance") => {
    const statusId = statusMeta.find((s) => s.status === status)?.status_id;
    if (statusId) {
      await updateLocation(Number(id), { status_id: statusId });
    }
    setHalls((prev) => prev.map((h) => (h.id === id ? { ...h, status } : h)));
  };

  const handleEditHall = async (
    updatedHall: Hall,
    pricings: UpdateHallPricingInput[] = [],
  ) => {
    const statusId = statusMeta.find((s) => s.status === updatedHall.status)?.status_id;

    // ส่ง image_url เฉพาะเมื่อเป็น object_key ใหม่ (ไม่ใช่ presigned URL เดิม)
    const newImageKey =
      updatedHall.image && !updatedHall.image.startsWith("http") ? updatedHall.image : undefined;

    const saved = await updateLocation(Number(updatedHall.id), {
      name: updatedHall.name,
      description: updatedHall.notes ?? "",
      building_id: resolveBuildingId(updatedHall.building),
      ...(newImageKey !== undefined && { image_url: newImageKey }),
      capacity: 0,
      ...(statusId && { status_id: statusId }),
    });

    // ต้องบันทึกอาคารก่อน — ถ้า admin ย้ายอาคารพร้อมกัน backend จะได้ตรวจขั้นต่ำเทียบอาคารใหม่
    if (pricings.length > 0) {
      await updateHallPricings(Number(updatedHall.id), pricings);
    }

    // ใช้ค่าที่ backend ตอบกลับ เพื่อไม่ให้ UI แสดงค่าที่ยังไม่ได้ลง DB จริง
    setHalls((prev) => prev.map((h) => (h.id === updatedHall.id ? locationToHall(saved) : h)));
    // bump ทุกครั้งที่บันทึกสำเร็จ ไม่ใช่เฉพาะตอนแก้ราคา — ย้ายอาคารก็ทำให้ราคาที่ใช้จริงเปลี่ยน (ราคาอาคาร = ขั้นต่ำ)
    setPricingVersion((v) => v + 1);
  };

  const handleDeleteHall = async (id: string) => {
    await deleteLocation(Number(id));
    setHalls((prev) => prev.filter((h) => h.id !== id));
  };

  return {
    halls,
    loading,
    isAdmin,
    pricingVersion,
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
