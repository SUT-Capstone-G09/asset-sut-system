import { Skeleton } from "@/components/ui/skeleton";
import { PaymentPageContrainer } from "@/features/payment/component/layout/contrainer";
import { BookingDetailsCardSkeleton } from "./BookingDetailsCardSkeleton";
import { PaymentProofCardSkeleton } from "./PaymentProofCardSkeleton";

export function PaymentSuccessPageSkeleton() {
  return (
    <PaymentPageContrainer>
      {/* Header Section */}
      <div className="mb-8 flex flex-col items-center text-center">
        <Skeleton className="w-14 h-14 rounded-full mb-4" />
        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Two Column Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column - Booking Details */}
        <BookingDetailsCardSkeleton />

        {/* Right Column - Payment Proof */}
        <PaymentProofCardSkeleton />
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-center mt-8">
        <Skeleton className="h-12 w-48 rounded-xl" />
      </div>
    </PaymentPageContrainer>
  );
}
