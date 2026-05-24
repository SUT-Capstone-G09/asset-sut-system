"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, House } from "lucide-react";
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
      <div className="mb-8 flex justify-center items-center flex-col text-center">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-orange-500" />
          <h1 className="text-4xl font-bold text-slate-900">ชำระเงินสำเร็จ</h1>
        </div>
        <p className="text-lg text-slate-600">
          ขอบคุณที่ชำระเงิน
          ด้านล่างเป็นรายละเอียดการจองและหลักฐานการชำระเงินของคุณ
        </p>
      </div>

      {/* Two Column Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 items-start">
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
          accountName={mockPaymentData.accountName}
          paymentRef={mockPaymentData.PAY_REF}
        />
      </div>

      {/* Bottom Actions */}
      <div className="flex gap-4 mt-4 justify-center items-center">
        <Link href="/">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white text-base p-5">
            <House className="w-4 h-4 mr-2" />
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
