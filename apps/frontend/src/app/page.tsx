import Footer from "@/components/layout/footer";
import PageContainer from "@/components/layout/PageContainer";
import HomeBanner from "@/features/home/components/HomeBanner";
import HomeNews from "@/features/home/components/HomeNews";
import HomeMap from "@/features/home/components/HomeMap";
import HomeServices from "@/features/home/components/HomeServices";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageContainer withPadding={true} withScrollbar={false}>
        <main className="flex-1">
          {/* 1. Hero / Announcement Banner */}
          <HomeBanner />

          {/* 2. Stats + Service Buttons + Area Cards */}
          <HomeServices />

          {/* 3. Map Section */}
          <HomeMap />

          {/* 4. Tabbed News Section */}
          <HomeNews />
        </main>
      </PageContainer>
      <Footer />
    </div>
  );
}
