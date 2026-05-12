import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export function AdminEvalTableHeader() {
    return (
        <div className="flex flex-col gap-4">
            <AssetBreadcrumb
                items={[
                    { label: "Asset SUT", href: "/" },
                    { label: "ผลการประเมินผู้ประกอบการ" }
                ]}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-extrabold text-slate-950 md:text-3xl lg:text-[2.75rem] lg:leading-[1.15]">
                    รายการประเมินผู้ประกอบการ
                </h1>
                <Link href="/admin/tenants/eval/form">
                    <Button className="bg-[#f26522] hover:bg-orange-600 text-white">
                        <PlusIcon className="h-4 w-4 mr-2" />เพิ่มการประเมินผู้ประกอบการ
                    </Button>
                </Link>
            </div>
        </div>
    );
}