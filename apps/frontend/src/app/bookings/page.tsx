"use client";

import PageContainer from "@/components/layout/PageContainer";
import RoomSearchForm from "@/features/bookings/components/RoomSearchForm";
import RoomResultsList from "@/features/bookings/components/RoomResultsList";
import RoomRecommendations from "@/features/bookings/components/RoomRecommendations";
import { useRoomSearch } from "@/features/bookings/hooks/useRoomSearch";

export default function BookingsPage() {
  const {
    searchParams,
    updateParam,
    handleSearch,
    results,
    hasSearched,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    getDayCount,
  } = useRoomSearch();

  return (
    <PageContainer>
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <RoomSearchForm
          params={searchParams}
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
          <RoomRecommendations />
        )}
      </div>
    </PageContainer>
  );
}
