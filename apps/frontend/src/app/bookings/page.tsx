"use client";

import PageContainer from "@/components/layout/PageContainer";
import BookingAreaSelector from "@/features/bookings/components/BookingAreaSelector";

export default function BookingsPage() {
  return (
    <PageContainer>
      <BookingAreaSelector />
    </PageContainer>
  );
}
