"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllBookings, BookingResponseDTO } from "@/features/bookings/services/booking.service";

export function useAdminBookings() {
  const [bookings, setBookings] = useState<BookingResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getAllBookings()
      .then(setBookings)
      .catch((err) => setError(err.message ?? "โหลดข้อมูลไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return { bookings, loading, error, reload: load };
}
