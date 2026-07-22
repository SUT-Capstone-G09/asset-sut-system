"use client";

import Link from "next/link";
import {
  UtensilsCrossed, Coffee, ShoppingBag, Laptop, Package,
  ShoppingCart, GraduationCap, Truck, Store, Building2,
  ArrowRight,
} from "lucide-react";
import PublicAreaCard from "@/features/space-rental/components/public/PublicAreaCard";
import { RentalSpace } from "@/features/space-rental/types/rental-space";

const stats = [
  { icon: UtensilsCrossed, label: "ศูนย์อาหารและบริการ", value: 0 },
  { icon: Coffee, label: "ร้านกาแฟและเบเกอรี่", value: 0 },
  { icon: ShoppingBag, label: "ร้านอาหารและเครื่องดื่ม", value: 0 },
  { icon: Package, label: "สินค้าและบริการอื่น ๆ", value: 0 },
  { icon: ShoppingCart, label: "ตลาด", value: 0 },
  { icon: Store, label: "ร้านสะดวกซื้อ", value: 0 },
  { icon: Building2, label: "ธนาคาร", value: 0 },
];

const areas: Partial<RentalSpace>[] = [
  {
    id: "1",
    name: "โรงอาหารพราวแสดทอง",
    address: "ศูนย์อาหารรวมร้านเด็ด ประจำฝั่งหอพักสวัสดิการ",
    area: "โรงอาหาร",
    image: "https://beta.sut.ac.th/damt/wp-content/uploads/sites/189/2021/01/1-2.jpg",
  },
  {
    id: "2",
    name: "โรงอาหารกาสะลองคำ",
    address: "โรงอาหารติดแอร์ สะดวกสบาย ใกล้กลุ่มอาคารเรียน",
    area: "โรงอาหาร",
    image: "https://beta.sut.ac.th/damt/wp-content/uploads/sites/189/2021/01/1-3.jpg",
  },
  {
    id: "3",
    name: "โรงอาหารคอนตะวัน",
    address: "มหาวิทยาลัยเทคโนโลยีสุรนารี",
    area: "โรงอาหาร",
    image: "https://placehold.co/400x300/d4541a/ffffff?text=คอนตะวัน",
  },
  {
    id: "4",
    name: "โรงอาหารครัวท่านท้าว",
    address: "มหาวิทยาลัยเทคโนโลยีสุรนารี",
    area: "โรงอาหาร",
    image: "https://placehold.co/400x300/c44e18/ffffff?text=ครัวท่านท้าว",
  },
  {
    id: "5",
    name: "โรงอาหารเด่นทองกวาว",
    address: "มหาวิทยาลัยเทคโนโลยีสุรนารี",
    area: "โรงอาหาร",
    image: "https://placehold.co/400x300/b44816/ffffff?text=เด่นทองกวาว",
  },
  {
    id: "6",
    name: "โรงอาหารเรียนรวม2",
    address: "มหาวิทยาลัยเทคโนโลยีสุรนารี",
    area: "โรงอาหาร",
    image: "https://placehold.co/400x300/a33a0f/ffffff?text=เรียนรวม2",
  },
];

export default function HomeServices() {
  return (
    <div className="bg-white">
      {/* ─── Service Buttons ─── */}
      <section className="py-10 border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-8 md:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Link href="/services/entrepreneur" className="group">
              <div className="flex flex-col items-center gap-3 bg-white border-2 border-gray-100 hover:border-[#f26522]/40 rounded-2xl py-8 px-4 text-center transition-all hover:shadow-lg hover:shadow-orange-50 cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-[#f26522] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-orange-200">
                  <Store className="size-8 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-[#f26522] transition-colors">ผู้ประกอบการ</span>
              </div>
            </Link>
            <Link href="/areas" className="group">
              <div className="flex flex-col items-center gap-3 bg-white border-2 border-gray-100 hover:border-[#f26522]/40 rounded-2xl py-8 px-4 text-center transition-all hover:shadow-lg hover:shadow-orange-50 cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-[#f26522] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-orange-200">
                  <Building2 className="size-8 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-[#f26522] transition-colors">ผู้สนใจเช่าพื้นที่</span>
              </div>
            </Link>
            <Link href="/services" className="group">
              <div className="flex flex-col items-center gap-3 bg-white border-2 border-gray-100 hover:border-[#f26522]/40 rounded-2xl py-8 px-4 text-center transition-all hover:shadow-lg hover:shadow-orange-50 cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-[#a67436] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-amber-200">
                  <GraduationCap className="size-8 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-[#a67436] transition-colors">บุคลากร / นักศึกษา</span>
              </div>
            </Link>
            <Link href="/requests" className="group">
              <div className="flex flex-col items-center gap-3 bg-white border-2 border-gray-100 hover:border-[#f26522]/40 rounded-2xl py-8 px-4 text-center transition-all hover:shadow-lg hover:shadow-orange-50 cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-[#6d6e70] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-gray-200">
                  <Package className="size-8 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-[#6d6e70] transition-colors">ระเบียบ / ดาวน์โหลด</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─── */}
      <section className="border-y border-gray-100 bg-gray-50/60 py-10">
        <div className="max-w-[1280px] mx-auto px-8 md:px-16">
          <div className="grid grid-cols-5 md:grid-cols-7 gap-6">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="w-20 h-20 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:border-orange-200 group-hover:bg-orange-50 transition-all">
                    <Icon className="size-6 text-[#f26522]" />
                  </div>
                  <span className="text-2xl font-black text-gray-800">{s.value}</span>
                  <span className="text-[14px] text-gray-500 text-center leading-tight">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ─── Areas Section ─── */}
      <section className="py-12">
        <div className="max-w-[1280px] mx-auto px-8 md:px-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                <Store className="size-6 text-[#f26522]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">ศูนย์อาหารและบริการ</h2>
                <div className="flex gap-1 mt-1">
                  <div className="h-1 w-8 rounded-full bg-[#f26522]" />
                  <div className="h-1 w-4 rounded-full bg-[#a67436]" />
                  <div className="h-1 w-2 rounded-full bg-gray-200" />
                </div>
              </div>
            </div>
            <Link href="/areas">
              <button className="flex items-center gap-1.5 text-sm font-bold text-[#f26522] hover:text-[#d4541a] transition-colors group">
                ดูทั้งหมด
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* Area Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {areas.map((area) => (
              <Link key={area.id} href="/areas" className="block w-full">
                <PublicAreaCard location={area as RentalSpace} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

