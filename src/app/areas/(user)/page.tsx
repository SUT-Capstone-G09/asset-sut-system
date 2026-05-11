"use client"

import dynamic from "next/dynamic"
import { mockLocations } from '@/features/areas/data/locations';
import Navbar from "@/components/layout/topbar";
import AreasBanner from "@/features/areas/components/AreasBanner";
import AreasAbout from "@/features/areas/components/AreasAbout";
import AreasList from "@/features/areas/components/AreasList";
import AreasMapSection from "@/features/areas/components/AreasMapSection";
import AreasFooterInfo from "@/features/areas/components/AreasFooterInfo";

const MapContainer = dynamic(
  () => import('@/components/map/MapContainer'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] w-full flex items-center justify-center bg-gray-100 rounded-2xl">
        <p className="text-lg font-medium text-gray-400 animate-pulse">กำลังโหลดแผนที่...</p>
      </div>
    )
  }
);

export default function AreasPage() {
  const categories = Array.from(new Set(mockLocations.map(loc => loc.category)));

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#fcfcfc]">
      {/* Top Bar */}
      <Navbar />

      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto pt-20 custom-scrollbar">
        {/* Banner Section */}
        <AreasBanner />

        {/* Main Content Area Layout */}
        <div className="max-w-[1280px] mx-auto px-6 py-12 space-y-16">

          {/* Map Section  */}
          <AreasMapSection locations={mockLocations} categories={categories} />

          <AreasAbout />

          {/* Shop Categories Section */}
          <AreasList categories={categories} locations={mockLocations} />

          {/* Footer */}
          <AreasFooterInfo />

        </div>
      </main>
    </div>
  );
}
