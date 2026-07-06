"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SectionHeader } from "./SectionHeader";

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
  const [detailed, setDetailed] = useState(true);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
      <SectionHeader icon={<ReceiptText size={14} />} label="สรุปการจอง" />

      <div>
        <h3 className="text-lg font-bold text-brand-primary">{roomName}</h3>
        <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
          <MapPin size={13} className="text-brand-primary shrink-0" />
          {location}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
        <div>
          <span className="block text-xs text-gray-400 font-medium">วันที่</span>
          <span className="text-sm font-bold text-gray-800">{bookingDate}</span>
        </div>
        <div>
          <span className="block text-xs text-gray-400 font-medium">เวลา</span>
          <span className="text-sm font-bold text-gray-800">{bookingTime}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">
          {detailed ? "รายละเอียดราคา" : "สรุปอย่างย่อ"}
        </span>
        <button
          type="button"
          onClick={() => setDetailed((prev) => !prev)}
          role="switch"
          aria-checked={detailed}
          aria-label="สลับการแสดงรายละเอียดราคา"
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            detailed ? "bg-brand-primary" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              detailed ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        {detailed ? (
          <>
            <div className="flex justify-between text-gray-500">
              <span>
                ฿
                {hourlyRate.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                })}{" "}
                × {hours} ชั่วโมง
              </span>
              <span className="font-semibold text-gray-800">
                ฿
                {totalPrice.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>ค่าบริการ</span>
              <span className="font-semibold text-gray-800">฿0.00</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between text-gray-500">
            <span>ค่าบำรุงสถานที่</span>
            <span className="font-semibold text-gray-800">
              ฿
              {totalPrice.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        )}
      </div>

      <hr className="border-gray-100" />

      <div className="flex justify-between items-center">
        <span className="text-base font-bold text-brand-primary">
          ยอดรวมทั้งหมด
        </span>
        <span className="text-2xl font-black text-brand-primary">
          ฿
          {totalPrice.toLocaleString("th-TH", {
            minimumFractionDigits: 2,
          })}
        </span>
      </div>

      <Link href="/payment/success" className="w-full">
        <Button className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold h-12 rounded-xl text-base flex items-center justify-center gap-2">
          อัปโหลดหลักฐานเพื่อยืนยันการชำระเงิน
          <ArrowRight className="w-5 h-5" />
        </Button>
      </Link>
    </div>
  );
}
