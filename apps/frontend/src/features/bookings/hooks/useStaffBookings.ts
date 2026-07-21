"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { getAllBookings, BookingResponseDTO } from "@/features/bookings/services/booking.service";
import { getLocations, getStaffBuildings } from "@/features/booking/services/locationService";
import { useAuthContext } from "@/lib/context/auth-context";

/**
 * Hook ที่ดึง bookings ทั้งหมด แล้ว filter เฉพาะ bookings ที่อยู่ในอาคาร
 * ที่ staff คนนี้ได้รับสิทธิ์จาก admin
 *
 * Cross-reference 3 APIs:
 * 1. getAllBookings()         → bookings (มี timeslot.location_id)
 * 2. getLocations()          → locations (มี building_id)
 * 3. getStaffBuildings(uid)  → อาคารที่ staff มีสิทธิ์
 */
export function useStaffBookings() {
  const { user } = useAuthContext();
  const [bookings, setBookings] = useState<BookingResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    try {
      // ดึงข้อมูลพร้อมกัน 3 APIs
      const [allBookings, locations, staffBuildings] = await Promise.all([
        getAllBookings(),
        getLocations(),
        getStaffBuildings(user.id),
      ]);

      // สร้าง Set ของ building_id ที่ staff มีสิทธิ์
      const allowedBuildingIds = new Set(staffBuildings.map((b) => b.id));

      // สร้าง Map: location_id → building_id
      const locationToBuildingMap = new Map<number, number | undefined>();
      for (const loc of locations) {
        locationToBuildingMap.set(loc.id, loc.building_id);
      }

      // Filter bookings: เอาเฉพาะที่ timeslot location อยู่ในอาคารที่ staff มีสิทธิ์
      const filtered = (allBookings ?? []).filter((booking) => {
        return booking.timeslots?.some((ts) => {
          const buildingId = locationToBuildingMap.get(ts.location_id);
          return buildingId !== undefined && allowedBuildingIds.has(buildingId);
        });
      });

      setBookings(filtered);

      if (filtered.length === 0) {
        toast.info("ยังไม่มีคำขอจองพื้นที่ในอาคารที่คุณดูแล", { id: "staff-bookings" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ";
      setError(message);
      toast.error(message, { id: "staff-bookings" });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return { bookings, loading, error, reload: load };
}
