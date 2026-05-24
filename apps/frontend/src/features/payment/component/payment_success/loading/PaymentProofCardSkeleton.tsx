import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PaymentProofCardSkeleton() {
  return (
    <Card className="shadow-sm border-slate-100 overflow-hidden pt-0 ">
      <CardHeader className="border-b border-orange-600 pb-6 pt-6 bg-orange-500">
        <div className="flex items-center gap-3">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Payment Proof Image */}
          <div className="relative bg-slate-50 rounded-lg overflow-hidden h-54 flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>

          {/* Payment Details */}
          <div className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-2 rounded-lg bg-orange-100 px-3 py-2">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
