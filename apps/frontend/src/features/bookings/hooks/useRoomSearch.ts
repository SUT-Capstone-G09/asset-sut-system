import { useState, useMemo, useEffect } from "react";
import { differenceInCalendarDays } from "date-fns";
import { Room, RoomSearchParams, SortOption, ViewMode } from "@/features/bookings/types";
import { getLocations, locationToRoom } from "@/features/bookings/services/location.service";

const DEFAULT_PARAMS: RoomSearchParams = {
  mode: "single",
  startDate: undefined,
  endDate: undefined,
  startTime: undefined,
  endTime: undefined,
  capacity: undefined,
};

export function useRoomSearch() {
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [searchParams, setSearchParams] = useState<RoomSearchParams>(DEFAULT_PARAMS);
  const [appliedParams, setAppliedParams] = useState<RoomSearchParams | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("price_asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    getLocations()
      .then((locations) => setAllRooms(locations.map(locationToRoom)))
      .catch(() => setAllRooms([]));
  }, []);

  const results = useMemo<Room[]>(() => {
    if (!appliedParams) return [];
    const filtered = allRooms.filter((r) =>
      appliedParams.capacity == null || r.capacityMax >= appliedParams.capacity
    );
    return [...filtered].sort((a, b) => {
      if (sortBy === "price_asc") return a.pricePerHour - b.pricePerHour;
      if (sortBy === "price_desc") return b.pricePerHour - a.pricePerHour;
      return b.capacityMax - a.capacityMax;
    });
  }, [appliedParams, sortBy, allRooms]);

  const handleSearch = () => setAppliedParams({ ...searchParams });

  const updateParam = <K extends keyof RoomSearchParams>(key: K, value: RoomSearchParams[K]) => {
    setSearchParams((prev) => ({ ...prev, [key]: value }));
  };

  const getDayCount = (): number => {
    const p = appliedParams ?? searchParams;
    if (p.mode === "single" || !p.endDate || !p.startDate) return 1;
    return Math.max(1, differenceInCalendarDays(p.endDate, p.startDate) + 1);
  };

  const getHourCount = (): number => {
    const p = appliedParams ?? searchParams;
    if (!p.startTime || !p.endTime) return 1;
    const [sh, sm] = p.startTime.split(":").map(Number);
    const [eh, em] = p.endTime.split(":").map(Number);
    return Math.max(0.5, (eh * 60 + em - (sh * 60 + sm)) / 60);
  };

  return {
    searchParams,
    appliedParams,
    updateParam,
    handleSearch,
    results,
    hasSearched: appliedParams !== null,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    getDayCount,
    getHourCount,
  };
}
