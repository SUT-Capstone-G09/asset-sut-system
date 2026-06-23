import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function QRCodeCardSkeleton() {
  return (
    <Card className="p-6 shadow-sm border-slate-100">
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <div className="border border-slate-200 rounded-2xl p-3 bg-white shadow-sm shrink-0">
          <Skeleton className="w-40 h-40 rounded-lg" />
        </div>

        <div className="flex flex-col gap-4 w-full">
          <Skeleton className="h-6 w-48" />

          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100/80">
            <Skeleton className="w-5 h-5 rounded" />
            <div className="flex flex-col gap-2 w-full">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100/80">
            <Skeleton className="w-5 h-5 rounded" />
            <div className="flex flex-col gap-2 w-full">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
