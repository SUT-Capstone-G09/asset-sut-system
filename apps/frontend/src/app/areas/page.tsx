import { Suspense } from 'react';
import { mockLocations } from '@/features/areas/data/locations';
import AreasBanner from "@/features/areas/components/public/AreasBanner";
import AreasAbout from "@/features/areas/components/public/AreasAbout";
import AreasList from "@/features/areas/components/public/AreasList";
import AreasMapSection from "@/features/areas/components/public/AreasMapSection";
import Footer from "@/components/layout/footer";
import PageContainer from "@/components/layout/PageContainer";

export default function AreasPage() {
  const categories = Array.from(new Set(mockLocations.map(loc => loc.category)));

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageContainer withPadding={false}>
        {/* Banner Section */}
        <AreasBanner />

        {/* Main Content Area Layout */}
        <div className="max-w-[1280px] mx-auto px-6 py-12 space-y-16">

          {/* Map Section  */}
          <Suspense fallback={
            <div className="h-[600px] w-full flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-gray-200 border-t-[#f26522] rounded-full animate-spin" />
                <p className="text-sm font-medium text-gray-400">กำลังโหลดแผนที่...</p>
              </div>
            </div>
          }>
            <AreasMapSection locations={mockLocations} categories={categories} />
          </Suspense>
          
          <AreasAbout />

          {/* Shop Categories Section */}
          <AreasList categories={categories} locations={mockLocations} />
        </div>
      </PageContainer>
      <Footer />
    </div>
  );
}
