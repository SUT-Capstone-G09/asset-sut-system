"use client";

import { Suspense, useState, useEffect } from "react";
import { PaymentPageContrainer } from "@/features/payment/component/layout/contrainer";
import { PaymentHeader } from "@/features/payment/component/PaymentHeader";
import { QRCodeCard } from "@/features/payment/component/QRCodeCard";
import { UploadZone } from "@/features/payment/component/UploadZone";
import { PaymentSummaryCard } from "@/features/payment/component/PaymentSummaryCard";
import { HelpCard } from "@/features/payment/component/HelpCard";
import { PaymentPageSkeleton } from "@/features/payment/component/loading/PaymentPageSkeleton";
import { mockPaymentData } from "@/features/payment/data/mockdata";

function PaymentContent() {
  const totalPrice = mockPaymentData.hourlyRate * mockPaymentData.hours;

  return (
    <PaymentPageContrainer>
      <PaymentHeader
        title="ชำระเงิน"
        description={mockPaymentData.description}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mt-8 items-start">
        {/* ==================== ฝั่งซ้าย ==================== */}
        <div className="flex flex-col gap-6">
          <QRCodeCard
            qrCodeUrl={mockPaymentData.qrCodeUrl}
            accountName={mockPaymentData.accountName}
            totalPrice={totalPrice}
          />
          <UploadZone />
        </div>

        {/* ==================== ฝั่งขวา ==================== */}
        <div className="lg:sticky lg:top-24 flex flex-col gap-4">
          <PaymentSummaryCard
            roomName={mockPaymentData.roomName}
            location={mockPaymentData.location}
            bookingDate={mockPaymentData.bookingDate}
            bookingTime={mockPaymentData.bookingTime}
            hourlyRate={mockPaymentData.hourlyRate}
            hours={mockPaymentData.hours}
            totalPrice={totalPrice}
          />
          <HelpCard />
        </div>
      </div>
    </PaymentPageContrainer>
  );
}

export default function PaymentPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading - remove this timer in production with real API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PaymentPageSkeleton />;
  }

  return <PaymentContent />;
}
