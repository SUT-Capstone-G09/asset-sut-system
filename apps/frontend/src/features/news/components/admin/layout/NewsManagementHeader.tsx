import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import Link from "next/link";

export const NewsManagementHeader = () => {
    return (
        <div>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-950">จัดการประชาสัมพันธ์</h1>
                </div>

                <div className="flex w-full sm:w-auto items-center gap-3">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="ค้นหาประกาศหรือสินทรัพย์..."
                            className="pl-9 bg-white"
                            />
                    </div>
                    <Link href="/admin/news-management/create">
                        <Button variant="default" className="flex items-center gap-2 px-4 shadow-sm">
                            <PlusCircle className="h-4 w-4" />
                            <div className="flex flex-col items-start translate-y-[-1px]">
                                <span className="text-sm leading-tight">สร้างข่าวใหม่</span>
                            </div>
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
