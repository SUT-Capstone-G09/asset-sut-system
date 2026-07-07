"use client"

import { useState, useMemo, useEffect, useCallback } from "react";
import { Room } from "../types/room";
import {
  TypeMeta,
  StatusMeta,
  AdminLocationDTO,
  getLocations,
  getLocationTypes,
  createLocation,
  updateLocation,
  deleteLocation,
  savePricingTiers,
  locationToRoom,
} from "../services/locationService";
import { getCurrentUser } from "@/lib/utils/auth";

export function useRoomFilters() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [locationDTOs, setLocationDTOs] = useState<Map<string, AdminLocationDTO>>(new Map());
  const [typeMeta, setTypeMeta] = useState<TypeMeta[]>([]);
  const [statusMeta, setStatusMeta] = useState<StatusMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBuilding, setSelectedBuilding] = useState("all");

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const [data, types] = await Promise.all([getLocations(), getLocationTypes()]);
      setRooms(data.map(locationToRoom));

      const dtoMap = new Map<string, AdminLocationDTO>();
      data.forEach((loc) => dtoMap.set(String(loc.id), loc));
      setLocationDTOs(dtoMap);

      setTypeMeta(types.map((t) => ({ type: t.type, type_id: t.id })));

      const statusMap = new Map<number, string>();
      data.forEach((loc) => statusMap.set(loc.status_id, loc.status));
      setStatusMeta(Array.from(statusMap.entries()).map(([status_id, status]) => ({ status, status_id })));
    } catch (err) {
      console.error("Failed to load rooms:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedBuilding("all");
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((item) => {
      const matchesSearch =
        item.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
      const matchesBuilding = selectedBuilding === "all" || item.building === selectedBuilding;
      return matchesSearch && matchesCategory && matchesStatus && matchesBuilding;
    });
  }, [rooms, searchQuery, selectedCategory, selectedStatus, selectedBuilding]);

  const categories = useMemo(() => Array.from(new Set(rooms.map((r) => r.category))), [rooms]);
  const buildings = useMemo(() => Array.from(new Set(rooms.map((r) => r.building).filter(Boolean))), [rooms]);

  const handleAddRoom = async (newRoom: Room) => {
    const typeId = typeMeta.find((t) => t.type === newRoom.category)?.type_id;
    const statusId = statusMeta.find((s) => s.status === newRoom.status)?.status_id ?? 1;

    if (!typeId) throw new Error(`ไม่พบประเภทห้อง: ${newRoom.category}`);

    const created = await createLocation({
      type_id: typeId,
      name: newRoom.roomName,
      building_id: newRoom.buildingId ? Number(newRoom.buildingId) : undefined,
      image_url: newRoom.image || undefined,
      room_number: newRoom.roomNumber ? parseInt(newRoom.roomNumber) : undefined,
      capacity: newRoom.capacity,
      status_id: statusId,
    });
    await savePricingTiers(created.id, newRoom.rates);
    const createdRoom = locationToRoom(created);
    setRooms((prev) => [{ ...createdRoom, rates: newRoom.rates }, ...prev]);
    setLocationDTOs((prev) => new Map(prev).set(String(created.id), created));
  };

  const handleUpdateRoomStatus = async (id: string, status: "available" | "maintenance") => {
    const statusId = statusMeta.find((s) => s.status === status)?.status_id;
    if (statusId) {
      await updateLocation(Number(id), { status_id: statusId });
    }
    setRooms((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  };

  const handleEditRoom = async (updatedRoom: Room) => {
    const typeId = typeMeta.find((t) => t.type === updatedRoom.category)?.type_id;
    const statusId = statusMeta.find((s) => s.status === updatedRoom.status)?.status_id;
    const existingDTO = locationDTOs.get(updatedRoom.id);
    const existingTierIds = existingDTO?.pricing_tiers?.map((t) => t.id) ?? [];

    // ส่ง image_url เฉพาะเมื่อเป็น object_key ใหม่ (ไม่ใช่ presigned URL เดิม)
    // ถ้าส่ง presigned URL กลับไป backend จะเก็บ URL ที่หมดอายุใน DB
    const newImageKey = updatedRoom.image && !updatedRoom.image.startsWith("http")
      ? updatedRoom.image
      : undefined;

    await updateLocation(Number(updatedRoom.id), {
      ...(typeId && { type_id: typeId }),
      name: updatedRoom.roomName,
      building_id: updatedRoom.buildingId ? Number(updatedRoom.buildingId) : undefined,
      ...(newImageKey !== undefined && { image_url: newImageKey }),
      room_number: updatedRoom.roomNumber ? parseInt(updatedRoom.roomNumber) : undefined,
      capacity: updatedRoom.capacity,
      ...(statusId && { status_id: statusId }),
    });
    await savePricingTiers(Number(updatedRoom.id), updatedRoom.rates, existingTierIds);
    setRooms((prev) => prev.map((r) => r.id === updatedRoom.id ? updatedRoom : r));
    setLocationDTOs((prev) => {
      const next = new Map(prev);
      const old = next.get(updatedRoom.id);
      if (old) next.set(updatedRoom.id, { ...old, building: updatedRoom.building, pricing_tiers: [] });
      return next;
    });
  };

  const handleDeleteRoom = async (id: string) => {
    await deleteLocation(Number(id));
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  return {
    rooms,
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
    filteredRooms,
    categories,
    buildings,
    totalResults: filteredRooms.length,
    handleAddRoom,
    handleUpdateRoomStatus,
    handleEditRoom,
    handleDeleteRoom,
    typeMeta,
    statusMeta,
  };
}
