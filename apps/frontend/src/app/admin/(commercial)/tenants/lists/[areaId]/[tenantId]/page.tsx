import { notFound } from "next/navigation";
import { tenantAreaOptions } from "@/features/tenants/data/tenant-areas";
import { generateMockTenants } from "@/features/tenants/data/mock-tenants";
import AdminTenantDetailView from "@/features/tenants/components/admin/AdminTenantDetailView";

export default async function AdminTenantDetailPage({
  params,
}: {
  params: Promise<{ areaId: string; tenantId: string }>;
}) {
  const { areaId, tenantId } = await params;
  const area = tenantAreaOptions.find((a) => a.id === areaId);

  if (!area) {
    notFound();
  }

  const allTenants = generateMockTenants(area.id, area.subLocations);
  const tenant = allTenants.find((t) => t.id === tenantId);

  if (!tenant) {
    notFound();
  }

  return (
    <div className="p-8">
      <AdminTenantDetailView
        tenant={tenant}
        areaId={areaId}
        areaName={area.name}
      />
    </div>
  );
}
