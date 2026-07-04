import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";

export function EvalCategoryHeader() {
  return (
    <div className="flex flex-col gap-4">
      <AssetBreadcrumb
        items={[
          { label: "Asset SUT", href: "/" },
          { label: "ผลการประเมินผู้ประกอบการ", href: "/admin/tenants/eval" },
          { label: "จัดการเกณฑ์การประเมิน" },
        ]}
      />

      <div>
        <h1 className="text-3xl font-extrabold text-slate-950 md:text-3xl lg:text-[2.75rem] lg:leading-[1.15]">
          จัดการเกณฑ์การประเมิน
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Assessment Criteria Management for University Stores
        </p>
      </div>
    </div>
  );
}
