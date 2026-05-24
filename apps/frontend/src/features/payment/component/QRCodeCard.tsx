import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Landmark, CreditCard } from "lucide-react";

interface QRCodeCardProps {
  qrCodeUrl: string;
  accountName: string;
  totalPrice: number;
}

export function QRCodeCard({
  qrCodeUrl,
  accountName,
  totalPrice,
}: QRCodeCardProps) {
  return (
    <Card className="p-6 shadow-sm border-slate-100">
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <div className="border border-slate-200 rounded-2xl p-3 bg-white shadow-sm shrink-0">
          <Image
            src={qrCodeUrl}
            alt="QR Code"
            width={160}
            height={160}
            className="rounded-lg w-40 h-40"
          />
        </div>

        <div className="flex flex-col gap-4 w-full">
          <h3 className="text-xl font-bold text-slate-800 text-center sm:text-left">
            สแกนเพื่อชำระเงิน
          </h3>

          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100/80">
            <Landmark className="w-5 h-5 text-slate-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-md text-slate-400 font-medium">
                ชื่อบัญชี
              </span>
              <span className="text-lg font-semibold text-slate-700">
                {accountName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100/80">
            <CreditCard className="w-5 h-5 text-slate-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-md text-slate-400 font-medium">
                จำนวนเงิน
              </span>
              <span className="text-lg font-bold text-[#F15A24]">
                ฿
                {totalPrice.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
