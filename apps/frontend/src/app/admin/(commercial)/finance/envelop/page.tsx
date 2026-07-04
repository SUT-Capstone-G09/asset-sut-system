import { EnvelopHeader } from "@/features/envelop/components/EnvelopHeader";
import { EnvelopStatsCards } from "@/features/envelop/components/EnvelopStatsCards";
import { EnvelopTabs } from "@/features/envelop/components/EnvelopTabs";

export default function EnvelopPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <EnvelopHeader />

      {/* Stats Cards */}
      <EnvelopStatsCards />

      {/* Tabbed Content: Document List & Payment Verification */}
      <EnvelopTabs />
    </div>
  );
}