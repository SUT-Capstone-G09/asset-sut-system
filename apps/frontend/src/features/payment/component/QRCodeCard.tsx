import { Landmark, CreditCard, QrCode } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

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
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <SectionHeader
        icon={<QrCode size={14} />}
        label="ช่องทางการชำระเงิน"
      />

      <div className="mt-4 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <div className="border border-gray-100 rounded-2xl p-3 bg-white shadow-sm shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- presigned MinIO URL; next/image needs remotePatterns which this app has no next.config for */}
          <img
            src={qrCodeUrl}
            alt="QR Code"
            width={160}
            height={160}
            className="rounded-lg w-40 h-40 object-contain"
          />
        </div>

        <div className="flex flex-col gap-4 w-full">
          <h3 className="text-lg font-bold text-gray-900 text-center sm:text-left">
            สแกนเพื่อชำระเงิน
          </h3>

          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-100 shrink-0">
              <Landmark className="w-4 h-4 text-brand-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium">
                ชื่อบัญชี
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {accountName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-100 shrink-0">
              <CreditCard className="w-4 h-4 text-brand-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium">
                จำนวนเงิน
              </span>
              <span className="text-lg font-bold text-brand-primary">
                ฿
                {totalPrice.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
