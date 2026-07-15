import { useState, useMemo, useEffect } from "react";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { Room, RoomSearchParams, SortOption, ViewMode } from "@/features/bookings/types";
import {
  getLocations,
  getRoomAvailabilityBadge,
  isRoomAvailableForRequest,
  locationToRoom,
  LocationDTO,
} from "@/features/bookings/services/location.service";
import { useAuthContext } from "@/lib/context/auth-context";

function enumerateRequestedDates(p: RoomSearchParams): string[] {
  if (!p.startDate) return [];
  const end = p.mode === "range" && p.endDate ? p.endDate : p.startDate;
  const dates: string[] = [];
  for (let d = p.startDate; d <= end; d = addDays(d, 1)) {
    dates.push(format(d, "yyyy-MM-dd"));
  }
  return dates;
}

const CATEGORY_TO_TYPE: Record<string, string> = {
  meeting: "ห้องประชุม",
  classroom: "ห้องเรียน",
  sports: "สนามกีฬา",
  hall: "โถงอาคาร",
};

const DEFAULT_PARAMS: RoomSearchParams = {
  mode: "single",
  startDate: undefined,
  endDate: undefined,
  startTime: undefined,
  endTime: undefined,
  capacity: undefined,
};

export function useRoomSearch(category?: string) {
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [searchParams, setSearchParams] = useState<RoomSearchParams>(DEFAULT_PARAMS);
  const [appliedParams, setAppliedParams] = useState<RoomSearchParams | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("price_asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const { user } = useAuthContext();
  const requesterTypeId = user?.requester_type_id;

  useEffect(() => {
    getLocations()
      .then(async (locations) => {
        const filtered = category
          ? locations.filter((loc: LocationDTO) => loc.type === CATEGORY_TO_TYPE[category])
          : locations;
        const base = filtered.map((loc) => locationToRoom(loc, requesterTypeId));
        setAllRooms(base);

        // Upgrade the operational-status placeholder badge to a real,
        // booking-derived one once each room's monthly data resolves.
        const withRealAvailability = await Promise.all(
          base.map(async (room) => {
            const availability = await getRoomAvailabilityBadge(Number(room.id)).catch(
              () => room.availability
            );
            return { ...room, availability };
          })
        );
        setAllRooms(withRealAvailability);
      })
      .catch(() => setAllRooms([]));
  }, [requesterTypeId, category]);

  const [unavailableIds, setUnavailableIds] = useState<Set<string>>(new Set());
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    const dates = appliedParams ? enumerateRequestedDates(appliedParams) : [];
    if (dates.length === 0 || allRooms.length === 0) {
      return;
    }
    const candidates = allRooms.filter((r) =>
      appliedParams!.capacity == null || r.capacityMax >= appliedParams!.capacity
    );
    let cancelled = false;
    (async () => {
      setCheckingAvailability(true);
      const entries = await Promise.all(
        candidates.map(async (r) => {
          const ok = await isRoomAvailableForRequest(
            Number(r.id),
            dates,
            appliedParams!.startTime,
            appliedParams!.endTime
          ).catch(() => true); // fail-open — a check error shouldn't hide an otherwise-valid room
          return [r.id, ok] as const;
        })
      );
      if (cancelled) return;
      setUnavailableIds(new Set(entries.filter(([, ok]) => !ok).map(([id]) => id)));
      setCheckingAvailability(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [appliedParams, allRooms]);

  const results = useMemo<Room[]>(() => {
    if (!appliedParams) return [];
    // Only consult unavailableIds when a date was actually requested — otherwise
    // it may hold stale results from a previous search that this effect hasn't
    // reset yet (avoids needing a redundant "reset" setState in the effect above).
    const hasDateFilter = enumerateRequestedDates(appliedParams).length > 0;
    const filtered = allRooms.filter(
      (r) =>
        (appliedParams.capacity == null || r.capacityMax >= appliedParams.capacity) &&
        (!hasDateFilter || !unavailableIds.has(r.id))
    );
    return [...filtered].sort((a, b) => {
      if (sortBy === "price_asc") return a.pricePerHour - b.pricePerHour;
      if (sortBy === "price_desc") return b.pricePerHour - a.pricePerHour;
      return b.capacityMax - a.capacityMax;
    });
  }, [appliedParams, sortBy, allRooms, unavailableIds]);

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
    checkingAvailability,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    getDayCount,
    getHourCount,
  };
}
