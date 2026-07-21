import { Button } from "@/components/ui/button";
import { PlusIcon, ClipboardList, FilePlus } from "lucide-react";
import Link from "next/link";

export function AdminEvalTableHeader() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-950">
                        รายการประเมินผู้ประกอบการ
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">จัดการและติดตามผลการประเมินร้านค้าทั้งหมด</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* ปุ่ม 1: ชุดการประเมิน */}
                    <Link href="/admin/tenants/eval/assessment-sets">
                        <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                            <ClipboardList className="h-4 w-4 mr-2" />ชุดการประเมิน
                        </Button>
                    </Link>

                    {/* ปุ่ม 2: สร้างคำร้องประเมิน (ใหม่) */}
                    <Link href="/admin/tenants/eval/request">
                        <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                            <FilePlus className="h-4 w-4 mr-2" />สร้างคำร้องประเมิน
                        </Button>
                    </Link>

                    {/* ปุ่ม 3: เพิ่มการประเมิน (ปุ่มเดิม) */}
                    <Link href="/admin/tenants/eval/form">
                        <Button>
                            <PlusIcon className="h-4 w-4 mr-2" />เพิ่มการประเมินผู้ประกอบการ
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

