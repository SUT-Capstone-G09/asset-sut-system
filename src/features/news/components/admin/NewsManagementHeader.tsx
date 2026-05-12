import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb"

export function NewsManagementHeader() {
    const breadcrumbItems = [
        { label: "Asset SUT", href: "/" },
        { label: "จัดการประชาสัมพันธ์" },
    ];

    return (
        <div className="mb-6 space-y-4">
            <AssetBreadcrumb items={breadcrumbItems} />
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">สร้างประกาศ</h1>
                <p className="text-sm text-zinc-500 mt-1">ตั้งค่าและจัดการรายละเอียดข้อมูลประกาศข่าวสาร</p>
            </div>
        </div>
    )
}