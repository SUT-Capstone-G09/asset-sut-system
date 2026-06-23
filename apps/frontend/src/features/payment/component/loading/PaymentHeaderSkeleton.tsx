import { Skeleton } from "@/components/ui/skeleton";

export function PaymentHeaderSkeleton() {
  return (
    <div>
      <Skeleton className="h-10 w-64 mb-4" />
      <Skeleton className="h-6 w-96 mb-2" />
      <Skeleton className="h-6 w-80" />
    </div>
  );
}
