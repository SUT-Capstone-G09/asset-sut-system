import { Skeleton } from "@/components/ui/skeleton";

export function PaymentProofCardSkeleton() {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-7 h-7 rounded-lg" />
        <Skeleton className="h-5 w-44" />
      </div>

      {/* Payment Proof Image */}
      <div className="relative bg-gray-50 border border-gray-100 rounded-xl overflow-hidden h-54 flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>

      {/* Payment Details */}
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>

      {/* Status Bar */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-48" />
      </div>
    </section>
  );
}
