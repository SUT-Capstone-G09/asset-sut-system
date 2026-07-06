import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function AdminEvalDetailHeader() {
    return (
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                    <Download className="size-4" /> Export PDF
                </Button>
            </div>
        </div>
    );
}
