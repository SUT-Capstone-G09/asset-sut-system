import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PaymentSummaryCardSkeleton() {
  return (
    <Card className="relative mx-auto w-full pt-0">
      <Skeleton className="relative z-20 aspect-video w-full rounded-t-lg" />

      <CardHeader>
        <Skeleton className="h-7 w-40 mb-3" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>

      <div className="px-6">
        <Skeleton className="h-px w-full" />
      </div>

      <div className="px-6 mt-4">
        <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-2 rounded-xl">
          <div>
            <Skeleton className="h-3 w-12 mb-2" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div>
            <Skeleton className="h-3 w-12 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>

      <div className="px-6 flex flex-col gap-3 mt-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      <div className="px-6 mt-4">
        <Skeleton className="h-px w-full" />
      </div>

      <div className="px-6 flex flex-col gap-2 mt-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      <CardFooter>
        <Skeleton className="h-12 w-full rounded-xl" />
      </CardFooter>
    </Card>
  );
}
