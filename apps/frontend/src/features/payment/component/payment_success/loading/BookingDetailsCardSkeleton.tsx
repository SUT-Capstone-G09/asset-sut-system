import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingDetailsCardSkeleton() {
  return (
    <Card className="shadow-sm border-slate-100 overflow-hidden pt-0">
      <CardHeader className="border-b border-orange-600 pb-6 pt-6 bg-orange-500">
        <div className="flex items-center gap-3">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Room Name */}
        <div className="pb-4 border-b border-slate-100">
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-6 w-40" />
        </div>

        {/* Location */}
        <div className="flex gap-3">
          <Skeleton className="w-5 h-5 rounded" />
          <div className="w-full">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>

        {/* Date */}
        <div className="flex gap-3">
          <Skeleton className="w-5 h-5 rounded" />
          <div className="w-full">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>

        {/* Time */}
        <div className="flex gap-3">
          <Skeleton className="w-5 h-5 rounded" />
          <div className="w-full">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-5 w-44" />
          </div>
        </div>

        {/* Pricing Details */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex justify-between items-center pt-2 pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex justify-between items-center pt-8 border-t border-slate-100">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
