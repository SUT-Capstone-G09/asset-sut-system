"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Tag, Megaphone, Users, Globe, ShoppingCart, MessageSquare } from "lucide-react";

const tabs = [
  { id: "latest", label: "ข่าวล่าสุด", icon: Megaphone },
  { id: "activity", label: "ข่าวกิจกรรม", icon: Users },
  { id: "general", label: "ข่าวทั่วไป", icon: Globe },
  { id: "recruit", label: "ข่าวรับสมัคร", icon: ShoppingCart },
  { id: "trade", label: "ข่าวสารร้านค้า", icon: MessageSquare },
];

const newsData: Record<string, Array<{ date: string; tag: string; title: string; description: string; image: string }>> = {
  latest: [
    {
      date: "15 ต.ค. 2567",
      tag: "ประกาศด่วน",
      title: "ตัวอย่างประกาศรับสมัคร",
      description: "ตัวอย่างรายละเอียดประกาศรับสมัครต่างๆ",
      image: "https://placehold.co/400x260/f26522/ffffff?text=ประกาศ",
    },
    {
      date: "12 ต.ค. 2567",
      tag: "ประกาศ",
      title: "ตัวอย่างประกาศรับสมัคร",
      description: "ตัวอย่างรายละเอียดประกาศรับสมัครต่างๆ",
      image: "https://placehold.co/400x260/e55a1a/ffffff?text=รับสมัคร",
    },
    {
      date: "08 ต.ค. 2567",
      tag: "ข่าวทั่วไป",
      title: "ตัวอย่างประกาศรับสมัคร",
      description: "ตัวอย่างรายละเอียดประกาศรับสมัครต่างๆ",
      image: "https://placehold.co/400x260/d4541a/ffffff?text=สุขอนามัย",
    },
  ],
  activity: [
    {
      date: "10 ต.ค. 2567",
      tag: "กิจกรรม",
      title: "ตัวอย่างประกาศรับสมัคร",
      description: "ตัวอย่างรายละเอียดประกาศรับสมัครต่างๆ",
      image: "https://placehold.co/400x260/a67436/ffffff?text=กิจกรรม",
    },
  ],
  general: [
    {
      date: "15 ต.ค. 2567",
      tag: "ประกาศด่วน",
      title: "ตัวอย่างประกาศรับสมัคร",
      description: "ตัวอย่างรายละเอียดประกาศรับสมัครต่างๆ",
      image: "https://placehold.co/400x260/f26522/ffffff?text=ประกาศ",
    },
  ],
  recruit: [
    {
      date: "15 ต.ค. 2567",
      tag: "ประกาศด่วน",
      title: "ตัวอย่างประกาศรับสมัคร",
      description: "ตัวอย่างรายละเอียดประกาศรับสมัครต่างๆ",
      image: "https://placehold.co/400x260/f26522/ffffff?text=ประกาศ",
    },
    {
      date: "12 ต.ค. 2567",
      tag: "ประกาศ",
      title: "ตัวอย่างประกาศรับสมัคร",
      description: "ตัวอย่างรายละเอียดประกาศรับสมัครต่างๆ",
      image: "https://placehold.co/400x260/e55a1a/ffffff?text=รับสมัคร",
    },
  ],
  trade: [
    {
      date: "15 ต.ค. 2567",
      tag: "ประกาศด่วน",
      title: "ตัวอย่างประกาศรับสมัคร",
      description: "ตัวอย่างรายละเอียดประกาศรับสมัครต่างๆ",
      image: "https://placehold.co/400x260/f26522/ffffff?text=ประกาศ",
    },

  ],
};

export default function HomeNews() {
  const [activeTab, setActiveTab] = useState("latest");
  const currentNews = newsData[activeTab] || [];

  return (
    <section className="bg-white py-12 border-t border-gray-100">
      <div className="max-w-[1280px] mx-auto px-8 md:px-16">

        {/* Section Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <span className="bg-[#f26522] text-white text-[10px] font-black px-2 py-1 rounded absolute -top-3 -right-2 leading-none">NEW</span>
            <span className="bg-[#2d5fa6] text-white text-[10px] font-black px-2 py-1 rounded leading-none">UPDATE</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#f26522] tracking-tight">ASSET NEWS</h2>
            <p className="text-sm font-semibold text-gray-500">ข่าวสาร & กิจกรรม</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-t-xl transition-all border-b-2 -mb-px
                  ${isActive
                    ? "bg-[#f26522] text-white border-[#f26522]"
                    : "bg-gray-50 text-gray-600 border-transparent hover:bg-orange-50 hover:text-[#f26522]"
                  }`}
              >
                <Icon className="size-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* News Cards */}
        <div className="min-h-[400px]">
          {currentNews.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {currentNews.map((news, i) => (
                <Link key={i} href="/news" className="group block h-full">
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all h-full flex flex-col">
                    <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                      <img
                        src={news.image}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="bg-orange-50 text-[#f26522] text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-100">
                          {news.tag}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <CalendarDays className="size-3" />
                          {news.date}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-[#f26522] transition-colors line-clamp-2 flex-1">
                        {news.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                        {news.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs font-bold text-[#f26522] group-hover:gap-2 transition-all mt-auto pt-2 border-t border-gray-50">
                        อ่านต่อ <ArrowRight className="size-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400">
              <Tag className="size-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">ยังไม่มีข่าวในหมวดนี้</p>
            </div>
          )}
        </div>

        {/* View All */}
        <div className="text-center mt-8">
          <Link href="/news">
            <button className="group inline-flex items-center gap-2 border-2 border-[#f26522] text-[#f26522] font-bold px-8 py-3 rounded-xl hover:bg-[#f26522] hover:text-white transition-all">
              ดูข่าวทั้งหมด
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
