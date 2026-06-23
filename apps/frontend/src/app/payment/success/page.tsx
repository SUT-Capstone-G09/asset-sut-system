"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, House } from "lucide-react";
import { PaymentPageContrainer } from "@/features/payment/component/layout/contrainer";
import { BookingDetailsCard } from "@/features/payment/component/payment_success/BookingDetailsCard";
import { PaymentProofCard } from "@/features/payment/component/payment_success/PaymentProofCard";
import { PaymentSuccessPageSkeleton } from "@/features/payment/component/payment_success/loading/PaymentSuccessPageSkeleton";
import { mockPaymentData } from "@/features/payment/data/mockdata";

function PaymentSuccessContent() {
  const totalPrice = mockPaymentData.hourlyRate * mockPaymentData.hours;

  // Mock payment proof image - replace with actual uploaded image in production
  const proofImageUrl = "/insert-picture-icon.png";

  return (
    <PaymentPageContrainer>
      {/* Header Section */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 mb-4">
          <CheckCircle className="w-7 h-7 text-brand-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">ชำระเงินสำเร็จ</h1>
        <p className="text-gray-500 text-sm mt-1 max-w-2xl leading-relaxed">
          ขอบคุณที่ชำระเงิน
          ด้านล่างเป็นรายละเอียดการจองและหลักฐานการชำระเงินของคุณ
        </p>
      </div>

      {/* Two Column Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column - Booking Details */}
        <BookingDetailsCard
          roomName={mockPaymentData.roomName}
          location={mockPaymentData.location}
          bookingDate={mockPaymentData.bookingDate}
          bookingTime={mockPaymentData.bookingTime}
          hourlyRate={mockPaymentData.hourlyRate}
          hours={mockPaymentData.hours}
          totalPrice={totalPrice}
        />

        {/* Right Column - Payment Proof */}
        <PaymentProofCard
          proofImageUrl={proofImageUrl}
          paymentRef={mockPaymentData.PAY_REF}
        />
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-center mt-8">
        <Link href="/">
          <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold h-12 px-8 rounded-xl text-base flex items-center gap-2">
            <House className="w-5 h-5" />
            กลับสู่หน้าหลัก
          </Button>
        </Link>
      </div>
    </PaymentPageContrainer>
  );
}

export default function PaymentSuccessPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading - remove this timer in production with real API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PaymentSuccessPageSkeleton />;
  }

  return <PaymentSuccessContent />;
}
