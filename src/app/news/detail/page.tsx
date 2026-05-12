'use client';

import { ArrowLeft, Share2, Calendar, Eye, Printer, CheckCircle2, Phone, Mail, Download, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";


export default function NewsDetailPage() {
    return (
        <div className="min-h-screen pt-20">

            <main className="max-w-7xl mx-auto px-4 py-8">
                 <div className="mb-6">
                    <AssetBreadcrumb
                        items={[
                            { label: "หน้าหลัก", href: "/" },
                            { label: "ข่าวสาร", href: "/news" },
                            { label: "การรับสมัครร้านค้าเช่าพื้นที่ศูนย์อาหารใหม่" }
                        ]}
                    />
                 </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Hero Section with Download Overlay */}
                        <div className="relative aspect-[16/7] w-full">
                            <Image
                                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=600&fit=crop"
                                alt="สถานที่ศูนย์อาหารใหม่"
                                className="object-cover"
                                fill
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            
                            <div className="absolute bottom-6 left-8">
                                <span className="bg-orange-500 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                    รับสมัครร้านค้า
                                </span>
                            </div>
                        </div>

                        <div className="p-8 lg:p-12">
                            {/* Metadata */}
                            <div className="flex items-center gap-6 text-sm text-gray-500 mb-8 font-medium">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-orange-500" />
                                    <span>ประกาศเมื่อ: 24 พฤษภาคม 2567</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-orange-500" />
                                    <span>เข้าชมแล้ว: 1,245 ครั้ง</span>
                                </div>
                            </div>

                            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 leading-[1.2]">
                                การรับสมัครร้านค้าเช่า<br />พื้นที่ศูนย์อาหารใหม่
                            </h1>

                            <div className="prose prose-orange max-w-none">
                                <p className="text-gray-600 leading-relaxed text-lg mb-10">
                                    มหาวิทยาลัยมีความประสงค์จะเปิดรับสมัครผู้ประกอบการร้านอาหารและเครื่องดื่ม เพื่อเข้าพื้นที่จำหน่ายอาหารภายในศูนย์อาหารส่วนกลางแห่งใหม่ (New Food Center) ที่ได้รับการปรับปรุงเพื่อรองรับนักศึกษาและบุคลากรในรูปแบบทันสมัย
                                </p>

                                <h2 className="text-2xl font-bold text-[#C2410C] mb-6">คุณสมบัติเบื้องต้น</h2>
                                <div className="space-y-4 mb-12">
                                    {[
                                        'เป็นบุคคลธรรมดาหรือนิติบุคคลที่มีประสบการณ์การบริหารจัดการร้านอาหารไม่น้อยกว่า 2 ปี',
                                        'สามารถปฏิบัติตามกฎระเบียบด้านสุขาภิบาลอาหารและสิ่งแวดล้อมของมหาวิทยาลัยได้',
                                        'มีรายการอาหารที่หลากหลายและราคาเหมาะสมกับนักศึกษา'
                                    ].map((text, i) => (
                                        <div key={i} className="flex gap-4 items-start group">
                                            <div className="mt-1 bg-orange-100 rounded-full p-0.5 group-hover:bg-orange-500 transition-colors">
                                                <CheckCircle2 className="w-5 h-5 text-orange-500 group-hover:text-white" />
                                            </div>
                                            <span className="text-gray-700 font-medium">{text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Required Documents Grid */}
                                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 mb-12">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">เอกสารที่ต้องใช้ในการสมัคร</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { id: '1', title: 'สำเนาบัตรประชาชนและทะเบียนบ้านของผู้สมัคร' },
                                            { id: '2', title: 'รูปถ่ายร้านค้าและเมนูอาหารที่ต้องการจำหน่าย' },
                                            { id: '3', title: 'ใบรับรองมาตรฐานอาหาร (ถ้ามี)' },
                                            { id: '4', title: 'แผนการจัดการสิ่งแวดล้อมและขยะภายในร้าน' },
                                        ].map((doc) => (
                                            <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-200 flex gap-4 items-center">
                                                <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                                                    {doc.id}
                                                </span>
                                                <span className="text-sm text-gray-700 font-medium">{doc.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold text-gray-900 mb-6">ระยะเวลาการเช่าและพื้นที่</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                                    <div className="p-6 rounded-2xl bg-white border border-gray-100 text-center shadow-sm">
                                        <Calendar className="w-6 h-6 text-orange-500 mx-auto mb-3" />
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">ระยะเวลาสัญญา</p>
                                        <p className="font-bold text-gray-900">1 ปี (ต่อสัญญาได้)</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white border border-gray-100 text-center shadow-sm">
                                        <div className="w-6 h-6 bg-orange-500/10 rounded flex items-center justify-center mx-auto mb-3">
                                            <span className="text-orange-600 font-black text-xs">A</span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">ขนาดพื้นที่</p>
                                        <p className="font-bold text-gray-900">15 - 25 ตร.ม.</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white border border-gray-100 text-center shadow-sm">
                                        <Download className="w-6 h-6 text-orange-500 mx-auto mb-3" />
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">ค่าธรรมเนียมแรกเข้า</p>
                                        <p className="font-bold text-gray-900 text-sm italic underline">ตามระเบียบ มหาลัยฯ</p>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border-l-4 border-gray-200">
                                    ผู้ที่สนใจสามารถยื่นใบสมัครได้ที่ กองบริหารสินทรัพย์ อาคารสำนักงานอธิการบดี ชั้น 2 
                                    ในวันและเวลาราชการ ภายในวันที่ 30 มิถุนายน 2567 นี้
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Download Document Card */}
                        <div className="bg-gray-900 rounded-2xl p-8 text-white text-center shadow-lg border border-gray-800">
                            <Download className="w-10 h-10 mx-auto mb-4 text-orange-400" />
                            <h3 className="text-xl font-bold mb-2">สนใจร่วมสมัคร?</h3>
                            <p className="text-sm text-gray-300 mb-6 leading-relaxed">ดาวน์โหลดแบบฟอร์มการสมัครและรายละเอียดเพิ่มเติมได้ที่นี่</p>
                            <button className="w-full bg-white text-black py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shadow-sm">
                                ดาวน์โหลดแบบฟอร์ม
                            </button>
                        </div>

                        {/* Related News Card */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-bold text-gray-900">ข่าวที่เกี่ยวข้อง</h2>
                                <Link href="#" className="text-xs font-bold text-orange-600 hover:underline">ดูทั้งหมด</Link>
                            </div>
                            <div className="space-y-6">
                                {[
                                    { tag: 'ระเบียบการ', date: '15 พ.ค. 2567', title: 'ประกาศขยายเวลาเช่าอาคารพาณิชย์ รอบที่ 2' },
                                    { tag: 'สัมมนา', date: '10 พ.ค. 2567', title: 'อบรมมาตรฐานสุขาภิบาลสำหรับร้านค้าในมหาวิทยาลัย' },
                                    { tag: 'ประกาศ', date: '05 พ.ค. 2567', title: 'ปรับปรุงพื้นที่ลานจอดรถส่วนกลางหน้าศูนย์อาหาร' },
                                ].map((news, i) => (
                                    <div key={i} className="flex gap-4 group cursor-pointer">
                                        <div className="w-20 h-16 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                                            <Image 
                                                src={`https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&h=80&fit=crop`} 
                                                alt="news" width={80} height={64} className="object-cover group-hover:scale-110 transition-transform" 
                                            />
                                        </div>
                                        <div>
                                            <div className="flex gap-2 mb-1">
                                                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-tighter">{news.tag}</span>
                                                <span className="text-[10px] text-gray-400 font-medium">{news.date}</span>
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-orange-600 transition-colors">
                                                {news.title}
                                            </h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="bg-[#FFF7ED] rounded-2xl p-8 border border-orange-100 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                            <h3 className="text-lg font-bold text-gray-900 mb-6">ต้องการความช่วยเหลือ?</h3>
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold">โทรศัพท์</p>
                                        <p className="text-sm font-bold text-gray-900">02-123-4567 ต่อ 101</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold">อีเมล</p>
                                        <p className="text-sm font-bold text-gray-900">asset@university.ac.th</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}