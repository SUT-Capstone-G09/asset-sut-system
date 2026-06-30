import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb"
import {
    ArrowRight,
    CalendarDays,
    FileText,
    Megaphone,
    Search,
    Store,
    Newspaper,
    ShieldCheck,
    Download,
    Tag,
    Filter,
} from "lucide-react"
import Link from "next/link"

const latestNews = [
    {
        date: "12 ตุลาคม 2567",
        tag: "สุขอนามัย",
        title: "สรุปมาตรการสุขอนามัยประจำเดือน",
        description: "รายงานภาพรวมด้านสุขาภิบาลและข้อเสนอแนะสำหรับร้านค้าในพื้นที่",
        isNew: false,
    },
    {
        date: "10 ตุลาคม 2567",
        tag: "ความสะอาด",
        title: "มาตรการรักษาความสะอาดพื้นที่โซนอาหาร",
        description: "แนวทางการจัดพื้นที่และการดูแลความสะอาดที่ร้านค้าควรปฏิบัติ",
        isNew: false,
    },
    {
        date: "08 ตุลาคม 2567",
        tag: "จราจร",
        title: "ประกาศการปรับปรุงพื้นที่จราจรภายใน",
        description: "แจ้งช่วงเวลาปรับปรุงและข้อควรระวังในการใช้งานพื้นที่ร่วมกัน",
        isNew: false,
    },
    {
        date: "05 ตุลาคม 2567",
        tag: "ประกาศด่วน",
        title: "การปรับเวลาเปิด-ปิดพื้นที่บริการ",
        description: "แจ้งการเปลี่ยนแปลงเวลาการให้บริการพื้นที่เชิงพาณิชย์ในช่วงปลายปี",
        isNew: true,
    },
]

const services = [
    {
        icon: Newspaper,
        title: "ข่าวสินทรัพย์",
        description: "ติดตามข้อมูลและประกาศสำคัญ",
        href: "#",
    },
    {
        icon: Store,
        title: "รับสมัครร้านค้า",
        description: "ดูรายละเอียดและสมัครเข้าพื้นที่",
        href: "/services/tenant",
    },
    {
        icon: FileText,
        title: "ระเบียบการ",
        description: "ข้อกำหนดและเงื่อนไขการใช้งาน",
        href: "/services/entrepreneur",
    },
]

const filterTags = ["ทั้งหมด", "ข่าวกิจกรรม", "ข่าวทั่วไป", "ข่าวรับสมัคร", "ข่าวสารร้านค้า"]

export default function NewsPage() {
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

                {/* Hero Section */}
                <div className="relative mx-6 sm:mx-10 mb-10 rounded-[32px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                    {/* Background Accent */}
                    <div className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: "radial-gradient(circle at 70% 50%, #f26522 0%, transparent 60%)"
                        }}
                    />
                    {/* Pattern */}
                    <div className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                            backgroundSize: "40px 40px"
                        }}
                    />

                    <div className="relative z-10 px-8 sm:px-16 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-4 py-2 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                                <span className="text-orange-300 text-xs font-bold uppercase tracking-[0.2em]">Highlight 2024</span>
                            </div>

                            <div>
                                <p className="text-orange-400 text-sm font-semibold mb-3">ประชาสัมพันธ์ล่าสุด</p>
                                <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                                    ประกาศรับสมัคร
                                    <span className="block text-orange-400">ร้านค้าเช่าพื้นที่</span>
                                    <span className="block">ภายในมหาวิทยาลัย</span>
                                    <span className="block text-3xl font-bold text-white/70 mt-1">ปี 2567</span>
                                </h1>
                            </div>

                            <p className="text-white/60 text-sm leading-relaxed max-w-md">
                                ติดตามประกาศสำคัญ ข่าวประชาสัมพันธ์ และข้อมูลการรับสมัครพื้นที่เชิงพาณิชย์
                                ด้วยรูปแบบที่อ่านง่าย สบายตา และเน้นการใช้งานจริง
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <Link href="/news/detail">
                                    <button className="group flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3.5 rounded-2xl transition-all hover:shadow-[0_8px_25px_rgba(249,115,22,0.4)]">
                                        อ่านเพิ่มเติม
                                        <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                                <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-2xl border border-white/20 transition-all backdrop-blur-sm">
                                    <Download className="size-4" />
                                    ดาวน์โหลดระเบียบการ
                                </button>
                            </div>
                        </div>

                        {/* Featured image area */}
                        <div className="hidden md:block">
                            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative">
                                <img
                                    src="https://placehold.co/800x600/f26522/ffffff?text=ประกาศรับสมัคร+2567"
                                    alt="ประกาศรับสมัครร้านค้า"
                                    className="w-full h-full object-cover opacity-80"
                                />
                                <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                    <Megaphone className="size-3.5" />
                                    ประกาศด่วน
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <main className="px-6 sm:px-10 pb-20">

                    {/* Section Header + Filter */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">ข่าวสารและประกาศล่าสุด</h2>
                            <p className="text-slate-500 text-sm mt-1">พบ {latestNews.length} รายการ</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
                                <Search className="size-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาข่าวสาร..."
                                    className="text-sm outline-none bg-transparent text-slate-700 placeholder:text-slate-400 w-40"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Filter Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {filterTags.map((tag, i) => (
                            <button
                                key={tag}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                                    i === 0
                                        ? "bg-orange-500 text-white border-orange-500"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-500"
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    {/* News Layout */}
                    <div className="grid gap-8 xl:grid-cols-[1.6fr_0.9fr]">

                        {/* Main Highlight News */}
                        <div className="space-y-6">
                            <Link href="/news/detail" className="group block">
                                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100">
                                    <div className="absolute left-4 top-4 z-10 bg-orange-500 px-3 py-1.5 text-xs font-bold text-white rounded-full shadow flex items-center gap-1.5">
                                        <Megaphone className="size-3.5" />
                                        ประกาศด่วน
                                    </div>
                                    <img
                                        src="https://placehold.co/1200x675/f26522/ffffff?text=ข่าวสาร+มทส."
                                        alt="ประกาศด่วน"
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="space-y-3 mt-5 px-1">
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                        <CalendarDays className="size-3.5" />
                                        <span>15 ตุลาคม 2567</span>
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight group-hover:text-orange-500 transition-colors">
                                        เปิดจองพื้นที่ตลาดนัดนักศึกษา ประจำภาคเรียนที่ 2
                                    </h3>
                                    <p className="text-sm leading-relaxed text-slate-500 line-clamp-3">
                                        ขอเชิญนักศึกษาที่มีความประสงค์จะจำหน่ายสินค้า ลงทะเบียนเพื่อรับสิทธิ์ในการจัดสรรพื้นที่
                                        จำหน่ายสินค้า บริเวณลานกิจกรรมกลาง แจ้งความจำนงได้ตั้งแต่วันนี้...
                                    </p>
                                    <div className="inline-flex items-center gap-2 text-sm font-bold text-orange-500 group-hover:gap-3 transition-all">
                                        อ่านต่อ <ArrowRight className="size-4" />
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Side News */}
                        <aside className="space-y-4">
                            {latestNews.map((news, index) => (
                                <Link href="/news" key={news.title}>
                                    <div
                                        className={`group flex flex-col gap-2.5 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer mb-4
                                            ${index === 0
                                                ? "border-orange-200 bg-orange-50/50"
                                                : "border-slate-100 bg-white hover:border-orange-100 hover:bg-orange-50/30"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Tag className="size-3 text-orange-400" />
                                                <span className="text-xs font-semibold text-orange-500">{news.tag}</span>
                                                {news.isNew && (
                                                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">NEW</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                                <CalendarDays className="size-3" />
                                                {news.date}
                                            </div>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
                                            {news.title}
                                        </h4>
                                        <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">
                                            {news.description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </aside>
                    </div>

                    {/* Services Section */}
                    <section className="mt-16 pt-10 border-t border-slate-200">
                        <div className="mb-8 flex items-end justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500 mb-2">
                                    เมนูบริการหลัก
                                </p>
                                <h2 className="text-2xl font-black text-slate-900">เข้าถึงข้อมูลอย่างรวดเร็ว</h2>
                            </div>
                            <button className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors hidden sm:block">
                                ดูทั้งหมด
                            </button>
                        </div>

                        <div className="grid gap-5 md:grid-cols-3">
                            {services.map((service) => {
                                const Icon = service.icon
                                return (
                                    <Link key={service.title} href={service.href} className="group">
                                        <Card className="border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-100 hover:border-orange-100 cursor-pointer">
                                            <CardContent className="p-7 text-center flex flex-col items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                    <Icon className="size-7 text-orange-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                                                        {service.title}
                                                    </h3>
                                                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                                                        {service.description}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500 group-hover:gap-3 transition-all">
                                                    ดูเพิ่มเติม <ArrowRight className="size-3.5" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}
