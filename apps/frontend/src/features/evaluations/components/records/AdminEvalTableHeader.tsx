import { Button } from "@/components/ui/button";
import { PlusIcon, Tags } from "lucide-react";
import Link from "next/link";

export function AdminEvalTableHeader() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-extrabold text-slate-950">
                    รายการประเมินผู้ประกอบการ
                </h1>
                <div className="flex items-center gap-2">
                    <Link href="/admin/tenants/eval/categories">
                        <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                            <Tags className="h-4 w-4 mr-2" />จัดการหมวดหมู่
                        </Button>
                    </Link>
                    <Link href="/admin/tenants/eval/form">
                        <Button className="bg-[#f26522] hover:bg-orange-600 text-white">
                            <PlusIcon className="h-4 w-4 mr-2" />เพิ่มการประเมินผู้ประกอบการ
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
