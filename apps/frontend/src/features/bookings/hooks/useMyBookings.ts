"use client";

import { useEffect, useState } from "react";
import { getMyBookings, bookingDTOtoMyBooking } from "@/features/bookings/services/booking.service";
import { MyBooking } from "@/features/bookings/data/mock-my-bookings";

export function useMyBookings() {
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyBookings()
      .then((data) => setBookings(data.map(bookingDTOtoMyBooking)))
      .catch((err) => setError(err.message ?? "โหลดข้อมูลไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  return { bookings, loading, error };
}
