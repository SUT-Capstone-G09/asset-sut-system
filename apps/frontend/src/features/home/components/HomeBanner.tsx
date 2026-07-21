"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Megaphone,
  Bot,
  CreditCard,
} from "lucide-react";
import Image from "next/image";

const announcement = {
  highlight: "Highlight 2024",
  badge: "ประกาศด่วน",
  title: "ผลการคัดเลือกบุคคลเข้าปฏิบัติงานเป็นพนักงานวิสาหกิจ",
  subtitle: "ตำแหน่ง พนักงานบริหารพื้นที่เช่า",
  selected: "นายสิรวิชญ์ หมายตะคุ",
  reserves: ["นางสาวอุชาลักษณ์ ทิพย์ประเสริฐ", "นายศุภโชค กิตรวงศา"],
  body: "ให้ผู้ได้รับการคัดเลือกรายงานตัวเข้าปฏิบัติงาน ที่ ศูนย์บริหารจัดการทรัพย์สิน มหาวิทยาลัยเทคโนโลยีสุรนารี",
};

export default function HomeBanner() {
  return (
    <section className="relative w-full">
      {/* Scrolling Ticker */}

      {/* Hero Section with Background Image */}
      <div className="relative w-full h-[80vh] min-h-[400px] flex items-center overflow-hidden">
        {/* Background Image */}
        <img
          src="/Banner-Space.png"
          alt="SUT Campus"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Gradient Overlay — left is heavier to keep text readable, right is lighter to show the image */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.88) 38%, rgba(255,255,255,0.45) 60%, rgba(255,255,255,0.10) 100%)",
          }}
        />

        {/* Content Grid */}
        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-8 md:px-16 py-20 md:py-24">
          <div className="grid md:grid-cols-[1fr_300px] gap-10 items-center">
            {/* Left: Enlarged Logo */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-7">
                <Image
                  src="/ASSET_EN.svg"
                  alt="SUT"
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="object-contain"
                  style={{ width: "auto", height: "150px" }}
                  priority
                />
                {/* <div className="flex flex-col leading-none">
                  <span className="font-black text-[#f26522] text-3xl md:text-5xl tracking-tight drop-shadow-sm">
                    ASSET
                  </span>
                  <span className="text-xs md:text-sm text-gray-600 font-medium tracking-[0.2em] uppercase mt-1 drop-shadow-sm">
                    Suranaree University
                  </span>
                </div> */}
              </div>
            </div>

            {/* Right: Glassmorphism Quick-Action Cards */}
            <div className="hidden md:flex flex-col gap-4">
              {/* AI Assistant Card */}
              <div
                className="w-full rounded-2xl p-5 border border-white/50 shadow-xl space-y-3"
                style={{
                  background: "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f26522] to-[#ff8c42] flex items-center justify-center shadow-md shadow-orange-200 flex-shrink-0">
                    <Bot className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Asset AI</p>
                    <p className="text-xs text-gray-500">
                      ช่วยค้น–ตอบข้อสงสัยต่าง ๆ
                    </p>
                  </div>
                </div>
                <Link
                  href="/services"
                  className="block w-full bg-white/80 border border-orange-100 hover:border-orange-400 hover:bg-white rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-[#f26522] transition-all text-center shadow-sm"
                >
                  บริการทั้งหมด
                </Link>
              </div>

              {/* OnePay Card */}
              <Link href="/payment" className="block">
                <div
                  className="w-full rounded-2xl p-5 border border-white/50 shadow-xl flex items-center gap-4 group cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                  style={{
                    background: "rgba(255,255,255,0.55)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                  }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f26522] to-[#ff8c42] flex items-center justify-center shadow-md shadow-orange-200 flex-shrink-0">
                    <CreditCard className="size-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-sm leading-tight">
                      ชำระค่าเช่า
                    </p>
                    <p className="font-bold text-gray-800 text-sm leading-tight">
                      สาธารณูปโภค
                    </p>
                    <p className="text-xs text-[#f26522] font-semibold mt-1 group-hover:underline">
                      OnePay System →
                    </p>
                  </div>
                </div>
              </Link>

              {/* SUT Surya badge */}
              <div
                className="w-full rounded-2xl px-5 py-4 border border-white/40 shadow-lg flex items-center gap-3"
                style={{
                  background: "rgba(255,255,255,0.38)",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                }}
              >
                <img
                  src="/surya-graphic/Surya_graphic device-01.png"
                  alt="SUT Surya"
                  className="w-10 h-10 object-contain opacity-80"
                />
                <div>
                  <p className="text-xs font-bold text-gray-700">
                    มหาวิทยาลัยเทคโนโลยีสุรนารี
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Suranaree University of Technology
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
