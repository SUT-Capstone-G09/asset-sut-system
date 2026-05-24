import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Check, Clock, ImageIcon } from "lucide-react";

interface PaymentProofCardProps {
  proofImageUrl: string;
  accountName: string;
  paymentRef: string;
}

export function PaymentProofCard({
  proofImageUrl,
  accountName,
  paymentRef,
}: PaymentProofCardProps) {
  return (
    <Card className="shadow-sm border-slate-100 overflow-hidden pt-0 ">
      <CardHeader className="border-b border-orange-600 pb-6 pt-6 bg-orange-500">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-6 h-6 text-white shrink-0" />
          <CardTitle className="text-white">หลักฐานการชำระเงิน</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Payment Proof Image */}
          <div className="relative bg-slate-50 rounded-lg overflow-hidden h-54 flex items-center justify-center">
            <Image
              src={proofImageUrl}
              alt="Payment Proof"
              width={50}
              height={200}
              loading="eager"
              className="w-50 h-200 rounded-lg object-contain"
            />
          </div>
          <div className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>วันที่ชำระ</span>
              <span className="font-semibold text-foreground">1 ก.ย. 2569</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>เวลาที่ชำระ</span>
              <span className="font-semibold text-foreground">14:32 น.</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>หมายเลขอ้างอิง</span>
              <span className="font-mono font-semibold text-foreground">
                {paymentRef}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-orange-100 px-3 py-2 text-md font-medium text-orange-700">
            <Clock className="h-3.5 w-3.5" />
            สถานะ: รอตรวจสอบจากเจ้าหน้าที่
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
