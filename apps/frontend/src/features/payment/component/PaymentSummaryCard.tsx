"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface PaymentSummaryCardProps {
  roomName: string;
  location: string;
  bookingDate: string;
  bookingTime: string;
  hourlyRate: number;
  hours: number;
  totalPrice: number;
}

export function PaymentSummaryCard({
  roomName,
  location,
  bookingDate,
  bookingTime,
  hourlyRate,
  hours,
  totalPrice,
}: PaymentSummaryCardProps) {
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  const handleCheckboxChange = (checked: any) => {
    setIsTermsAccepted(checked === true);
  };
  return (
    <Card className="relative mx-auto w-full pt-0">
      <div className="absolute inset-0 z-10 aspect-video bg-black/35" />
      <div className="absolute top-3 left-3 z-100">
        <Badge variant="secondary">สรุปการจอง</Badge>
      </div>
      <img
        src="/room-b4101.jpg"
        alt="b4101 banner"
        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
      />
      <CardHeader>
        <CardTitle>
          <h2 className="text-2xl font-bold text-slate-800">{roomName}</h2>
        </CardTitle>
        <CardDescription>
          <p className="text-m text-slate-600 mt-1 flex items-center gap-1">
            📍 {location}
          </p>
        </CardDescription>
      </CardHeader>

      <div className="px-6">
        <hr className="border-slate-100" />
      </div>

      <div className="px-6 mt-0">
        <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-2 rounded-xl">
          <div>
            <span className="text-lg text-slate-400 block font-medium">
              วันที่
            </span>
            <span className="text-xl font-bold text-slate-700">
              {bookingDate}
            </span>
          </div>
          <div>
            <span className="text-lg text-slate-400 block font-medium">
              เวลา
            </span>
            <span className="text-xl font-bold text-slate-700">
              {bookingTime}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 flex flex-col gap-3 text-lg">
        <div className="flex justify-between text-slate-500">
          <span>
            ฿
            {hourlyRate.toLocaleString("th-TH", {
              minimumFractionDigits: 2,
            })}{" "}
            × {hours} ชั่วโมง
          </span>
          <span className="font-semibold text-slate-700">
            ฿
            {totalPrice.toLocaleString("th-TH", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>ค่าบริการ</span>
          <span className="font-semibold text-slate-700">฿0.00</span>
        </div>
      </div>

      <div className="px-6">
        <hr className="border-slate-100" />
      </div>

      <div className="px-6 flex flex-col gap-2">
        <div className="flex justify-between items-center py-2">
          <span className="text-lg font-bold text-orange-500">
            ยอดรวมทั้งหมด
          </span>
          <span className="text-2xl font-black text-orange-500">
            ฿
            {totalPrice.toLocaleString("th-TH", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="flex items-start gap-3 bg-slate-50/50 p-2 rounded-xl">
          <Checkbox
            checked={isTermsAccepted}
            onCheckedChange={handleCheckboxChange}
            className="data-checked:bg-orange-500 data-checked:border-orange-500"
          />
          <label
            htmlFor="terms"
            className="text-xs text-slate-600 cursor-pointer leading-relaxed"
          >
            ฉันยอมรับ นโยบายการคุ้มครองข้อมูลส่วนบุคคล และเงื่อนไขการใช้งาน
          </label>
        </div>
      </div>

      <CardFooter>
        <Link href="/payment/success" className="w-full">
          <Button
            disabled={!isTermsAccepted}
            className={`w-full py-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors ${
              isTermsAccepted
                ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            อัปโหลดหลักฐานเพื่อยืนยันการชำระเงิน
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
