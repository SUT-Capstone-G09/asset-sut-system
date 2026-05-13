import AdminTenantAreaGrid from "@/features/tenants/components/admin/AdminTenantAreaGrid";
import AdminTenantAreaHeader from "@/features/tenants/components/admin/AdminTenantAreaHeader";

export default function AdminTenantListsPage() {
  return (
    <div className="space-y-10 p-8">
      <AdminTenantAreaHeader />
      <AdminTenantAreaGrid />
    </div>
  );
}