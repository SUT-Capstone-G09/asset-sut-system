"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import RoomSearchForm from "@/features/bookings/components/RoomSearchForm";
import RoomResultsList from "@/features/bookings/components/RoomResultsList";
import RoomRecommendations from "@/features/bookings/components/RoomRecommendations";
import { useRoomSearch } from "@/features/bookings/hooks/useRoomSearch";

export default function BookingSearchPage() {
  return (
    <Suspense>
      <BookingSearchContent />
    </Suspense>
  );
}

function BookingSearchContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? undefined;

  const {
    searchParams: roomSearchParams,
    updateParam,
    handleSearch,
    results,
    hasSearched,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    getDayCount,
  } = useRoomSearch(category);

  return (
    <PageContainer>
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <RoomSearchForm
          params={roomSearchParams}
          onUpdate={updateParam}
          onSearch={handleSearch}
        />

        {hasSearched ? (
          <RoomResultsList
            rooms={results}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            dayCount={getDayCount()}
          />
        ) : (
          <RoomRecommendations category={category} />
        )}
      </div>
    </PageContainer>
  );
}
