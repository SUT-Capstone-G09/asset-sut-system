import { PaymentHeaderSkeleton } from "@/features/payment/component/loading/PaymentHeaderSkeleton";
import { QRCodeCardSkeleton } from "@/features/payment/component/loading/QRCodeCardSkeleton";
import { UploadZoneSkeleton } from "@/features/payment/component/loading/UploadZoneSkeleton";
import { PaymentSummaryCardSkeleton } from "@/features/payment/component/loading/PaymentSummaryCardSkeleton";
import { HelpCardSkeleton } from "@/features/payment/component/loading/HelpCardSkeleton";
import { PaymentPageContrainer } from "@/features/payment/component/layout/contrainer";

export function PaymentPageSkeleton() {
  return (
    <PaymentPageContrainer>
      <PaymentHeaderSkeleton />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 items-start">
        {/* ==================== ฝั่งซ้าย ==================== */}
        <div className="flex flex-col gap-6">
          <QRCodeCardSkeleton />
          <UploadZoneSkeleton />
        </div>

        {/* ==================== ฝั่งขวา ==================== */}
        <div className="flex flex-col gap-4">
          <PaymentSummaryCardSkeleton />
          <HelpCardSkeleton />
        </div>
      </div>
    </PaymentPageContrainer>
  );
}
