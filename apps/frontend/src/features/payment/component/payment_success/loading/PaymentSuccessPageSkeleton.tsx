import { Skeleton } from "@/components/ui/skeleton";
import { PaymentPageContrainer } from "@/features/payment/component/layout/contrainer";
import { BookingDetailsCardSkeleton } from "./BookingDetailsCardSkeleton";
import { PaymentProofCardSkeleton } from "./PaymentProofCardSkeleton";

export function PaymentSuccessPageSkeleton() {
  return (
    <PaymentPageContrainer>
      {/* Header Section */}
      <div className="mb-8 flex justify-center items-center flex-col text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-6 w-96 mb-2" />
      </div>

      {/* Two Column Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 items-start">
        {/* Left Column - Booking Details */}
        <BookingDetailsCardSkeleton />

        {/* Right Column - Payment Proof */}
        <PaymentProofCardSkeleton />
      </div>

      {/* Bottom Actions */}
      <div className="flex gap-4 mt-6 justify-center items-center">
        <Skeleton className="h-10 w-40 rounded-lg" />
        {/* <Skeleton className="h-10 w-40 rounded-lg" /> */}
      </div>
    </PaymentPageContrainer>
  );
}
