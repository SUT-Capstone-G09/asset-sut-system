import Navbar from "@/components/layout/topbar";
import Footer from "@/components/layout/footer";
import PageContainer from "@/components/layout/PageContainer";
import HomeBanner from "@/features/home/components/HomeBanner";
import HomeNews from "@/features/home/components/HomeNews";
import HomeMap from "@/features/home/components/HomeMap";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PageContainer withPadding={false}>
        <main className="flex-1 space-y-16">
          {/* Banner Section */}
          <HomeBanner />

          {/* News Section */}
          <HomeNews />

          {/* Map Section */}
          <HomeMap />
        </main>
      </PageContainer>
      <Footer />
    </div>
  );
}
