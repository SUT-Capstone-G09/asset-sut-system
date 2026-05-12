import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";

export function AdminEvalFormHeader() {
    return (
        <div className="flex flex-col gap-4">
            <AssetBreadcrumb
                items={[
                    { label: "Dashboard", href: "/" },
                    { label: "ผลการประเมินผู้ประกอบการ", href: "/admin/tenants/eval" },
                    { label: "แบบฟอร์มบันทึกการประเมิน" }
                ]}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-extrabold text-slate-950 md:text-3xl lg:text-[2.75rem] lg:leading-[1.15]">
                    แบบฟอร์มบันทึกการประเมิน
                </h1>
                <div className="px-3 py-1 bg-slate-200 text-slate-600 rounded text-xs font-bold tracking-wider uppercase">
                    Status: Drafting
                </div>
            </div>
        </div>
    )
}