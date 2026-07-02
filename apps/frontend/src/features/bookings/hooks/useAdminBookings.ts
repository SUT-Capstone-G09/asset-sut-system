"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { getAllBookings, BookingResponseDTO } from "@/features/bookings/services/booking.service";

export function useAdminBookings() {
  const [bookings, setBookings] = useState<BookingResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getAllBookings()
      .then((data) => {
        setBookings(data ?? []);
        if (!data || data.length === 0) {
          toast.info("ยังไม่มีคำขอจองพื้นที่", { id: "admin-bookings" });
        }
      })
      .catch((err) => {
        const message = err?.message ?? "โหลดข้อมูลไม่สำเร็จ";
        setError(message);
        toast.error(message, { id: "admin-bookings" });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return { bookings, loading, error, reload: load };
}
