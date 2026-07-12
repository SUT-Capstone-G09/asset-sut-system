"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import BookingConfirmView from "@/features/bookings/components/confirm/BookingConfirmView";
import { useRoom } from "@/features/bookings/hooks/useRoom";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingConfirmPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const { room, notFound: notFound404 } = useRoom(roomId);

  if (notFound404) notFound();

  if (!room) {
    return (
      <PageContainer>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <div className="flex flex-col gap-6">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
            <div className="flex flex-col gap-4">
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BookingConfirmView room={room} />
    </PageContainer>
  );
}
