import Image from "next/image";
import { Clock, ImageIcon } from "lucide-react";
import { SectionHeader } from "../SectionHeader";

interface PaymentProofCardProps {
  proofImageUrl: string;
  paymentRef: string;
}

export function PaymentProofCard({
  proofImageUrl,
  paymentRef,
}: PaymentProofCardProps) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
      <SectionHeader icon={<ImageIcon size={14} />} label="หลักฐานการชำระเงิน" />

      {/* Payment Proof Image */}
      <div className="relative bg-gray-50 border border-gray-100 rounded-xl overflow-hidden h-54 flex items-center justify-center">
        <Image
          src={proofImageUrl}
          alt="Payment Proof"
          width={200}
          height={200}
          loading="eager"
          className="h-48 w-auto rounded-lg object-contain"
        />
      </div>

      {/* Payment Details */}
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>วันที่ชำระ</span>
          <span className="font-semibold text-gray-800">1 ก.ย. 2569</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>เวลาที่ชำระ</span>
          <span className="font-semibold text-gray-800">14:32 น.</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>หมายเลขอ้างอิง</span>
          <span className="font-mono font-semibold text-gray-800">
            {paymentRef}
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-2 text-sm font-semibold text-brand-primary">
        <Clock className="w-4 h-4 shrink-0" />
        สถานะ: รอตรวจสอบจากเจ้าหน้าที่
      </div>
    </section>
  );
}
