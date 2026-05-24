"use client"

import { useState, useMemo } from "react";
import { Room } from "../types/room";

export function useRoomFilters(initialRooms: Room[]) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBuilding, setSelectedBuilding] = useState("all");

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

  // Unique categories and buildings from the initial list (stabilized)
  const categories = useMemo(() => {
    return Array.from(new Set(initialRooms.map((r) => r.category)));
  }, [initialRooms]);

  const buildings = useMemo(() => {
    return Array.from(new Set(initialRooms.map((r) => r.building)));
  }, [initialRooms]);

  const totalResults = filteredRooms.length;

  const handleAddRoom = (newRoom: Room) => {
    setRooms((prev) => [newRoom, ...prev]);
  };

  const handleUpdateRoomStatus = (id: string, status: "available" | "maintenance") => {
    setRooms((prev) => 
      prev.map((r) => r.id === id ? { ...r, status } : r)
    );
  };

  const handleEditRoom = (updatedRoom: Room) => {
    setRooms((prev) =>
      prev.map((r) => r.id === updatedRoom.id ? updatedRoom : r)
    );
  };

  const handleDeleteRoom = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  return {
    rooms,
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
    totalResults,
    handleAddRoom,
    handleUpdateRoomStatus,
    handleEditRoom,
    handleDeleteRoom
  };
}
