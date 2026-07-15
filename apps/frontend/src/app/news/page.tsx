"use client";

import React, { useState } from "react";
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";
import { CalendarDays, Search } from "lucide-react";
import { NewsCard } from "@/features/news/components/NewsCard";
import { NewsHero } from "@/features/news/components/NewsHero";
import { NewsServices } from "@/features/news/components/NewsServices";

const allNews = [
    {
        id: "NEWS-001",
        date: "12 ตุลาคม 2567",
        tag: "ร้านค้า",
        title: "เจาะลึก: โอกาสทองของผู้เช่าร้านค้าในย่านนวัตกรรมใหม่",
        description: "วิเคราะห์ทิศทางการเติบโตของเศรษฐกิจรอบวิทยาเขต และความพร้อมของระบบสาธารณูปโภคที่เอื้ออำนวยต่อการทำธุรกิจ...",
        imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
        isNew: true,
    },
    {
        id: "NEWS-002",
        date: "10 ตุลาคม 2567",
        tag: "ข่าวประชาสัมพันธ์ทั่วไป",
        title: "Green Space: แผนพัฒนาพื้นที่สีเขียวเพื่อสุขภาวะที่ดีของบุคลากร",
        description: "เปิดโครงการปรับปรุงสวนพฤกษศาสตร์ และการเพิ่มจุดพักผ่อนกลางแจ้งเพื่อสร้างสภาพแวดล้อมที่เหมาะสมกับการเรียนรู้...",
        imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80",
        isNew: true,
    },
    {
        id: "NEWS-003",
        date: "08 ตุลาคม 2567",
        tag: "ข่าวประชาสัมพันธ์ทั่วไป",
        title: "รายงานพิเศษ: มาตรฐานความสะอาดระดับสากลที่เรายึดมั่น",
        description: "เจาะลึกเบื้องหลังการทำงานของทีมบริหารจัดการทรัพย์สิน กับเป้าหมายการเป็นพื้นที่ที่ปลอดภัยจากโรคระบาด 100%...",
        imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
        isNew: false,
    },
    {
        id: "NEWS-004",
        date: "05 ตุลาคม 2567",
        tag: "งานซ่อมบำรุงและปรับปรุงพื้นที่",
        title: "เปิดตัวระบบจองห้องประชุมออนไลน์รูปแบบใหม่ สะดวกรวดเร็วใน 3 ขั้นตอน",
        description: "พบบริการจองพื้นที่และห้องประชุมผ่านระบบดิจิทัลเต็มรูปแบบเพื่ออำนวยความสะดวกแก่นักศึกษาและบุคลากรทุกท่าน...",
        imageUrl: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=600&q=80",
        isNew: false,
    },
    {
        id: "NEWS-005",
        date: "01 ตุลาคม 2567",
        tag: "ข่าวประชาสัมพันธ์ทั่วไป",
        title: "มทส. ร่วมมือพันธมิตรจัดตั้งศูนย์ทดลองนวัตกรรมและเทคโนโลยีเพื่อการศึกษา",
        description: "เตรียมพบพื้นที่ทดลองการสร้างสรรค์นวัตกรรมใหม่และการสนับสนุนทุนวิจัยสำหรับสตาร์ทอัพรุ่นเยาว์...",
        imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
        isNew: false,
    },
    {
        id: "NEWS-006",
        date: "28 กันยายน 2567",
        tag: "สรรหาผู้เช่าพื้นที่/ร้านค้า",
        title: "ประกาศรายชื่อผู้มีสิทธิ์เข้าทำสัญญาร้านค้าเช่าโซนอาหารใหม่ ประจำภาคการศึกษา 2",
        description: "ตรวจสอบรายชื่อผู้ผ่านการคัดเลือกและกำหนดการปฐมนิเทศเพื่อชี้แจงระเบียบและแนวทางการประกอบการ...",
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
        isNew: false,
    },
    {
        id: "NEWS-007",
        date: "25 กันยายน 2567",
        tag: "งานซ่อมบำรุงและปรับปรุงพื้นที่",
        title: "สรุปผลโครงการฟื้นฟูและอนุรักษ์พลังงานในอาคารสำนักงานและห้องพักบุคลากร",
        description: "รายงานผลสัมฤทธิ์ด้านพลังงานทางเลือกและการรณรงค์ปิดไฟ-ลดใช้พลังงานในช่วงชั่วโมงเร่งด่วนของไตรมาสที่สาม...",
        imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80",
        isNew: false,
    },
    {
        id: "NEWS-008",
        date: "20 กันยายน 2567",
        tag: "งานซ่อมบำรุงและปรับปรุงพื้นที่",
        title: "กิจกรรม Clean Up Day ร่วมใจพัฒนาพื้นที่สาธารณะและลานเอนกประสงค์วิจัย",
        description: "ขอเชิญชวนจิตอาสา นักศึกษา และบุคลากรร่วมทำความสะอาดและปรับปรุงภูมิทัศน์ของลานเอนกประสงค์วิจัยเพื่อส่วนรวม...",
        imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=600&q=80",
        isNew: false,
    },
    {
        id: "NEWS-009",
        date: "15 กันยายน 2567",
        tag: "การประมูลและจำหน่ายพัสดุ",
        title: "เชิญชวนผู้ประกอบการร่วมประมูลพื้นที่สิทธิ์เช่าสระว่ายน้ำและฟิตเนสเซ็นเตอร์",
        description: "เปิดรับข้อเสนอและแผนการดำเนินธุรกิจเชิงสร้างสรรค์สำหรับการบริหารจัดการศูนย์กีฬาและสุขภาพ...",
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
        isNew: false,
    }
];
const filterTags = ["ทั้งหมด", "สรรหาผู้เช่าพื้นที่/ร้านค้า", "การประมูลและจำหน่ายพัสดุ", "งานซ่อมบำรุงและปรับปรุงพื้นที่", "ร้านค้า", "ข่าวประชาสัมพันธ์ทั่วไป"];

export default function NewsPage() {
    const [selectedTag, setSelectedTag] = useState("ทั้งหมด");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredNews = allNews.filter((news) => {
        const matchesTag = selectedTag === "ทั้งหมด" || news.tag === selectedTag;
        const matchesSearch =
            news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            news.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTag && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-[1440px] pt-20">

                {/* Page Header */}
                <div className="px-6 sm:px-10 py-6">
                    <AssetBreadcrumb
                        items={[
                            { label: "หน้าหลัก", href: "/" },
                            { label: "ข่าวสารและประกาศ" }
                        ]}
                    />
                </div>

                {/* Hero Section Component */}
                <NewsHero />

                {/* Main Content Area */}
                <main className="px-6 sm:px-10 pb-20">

                    {/* Section Header + Filter */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">ข่าวสารและประกาศทั้งหมด</h2>
                            <p className="text-slate-500 text-sm mt-1">พบ {filteredNews.length} รายการ</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
                                <Search className="size-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาข่าวสาร..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="text-sm outline-none bg-transparent text-slate-700 placeholder:text-slate-400 w-40"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Filter Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {filterTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                                    selectedTag === tag
                                        ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-500"
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    {/* News Grid */}
                    {filteredNews.length > 0 ? (
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredNews.map((news) => (
                                <NewsCard key={news.id} news={news} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <p className="text-slate-400 text-sm">ไม่พบข่าวสารประชาสัมพันธ์ที่ค้นหา</p>
                        </div>
                    )}

                    {/* Services Section Component */}
                    <NewsServices />
                </main>
            </div>
        </div>
    );
}
