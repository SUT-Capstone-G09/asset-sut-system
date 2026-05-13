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
    Menu,
    Download,
} from "lucide-react"
import Link from "next/link"

const latestNews = [
    {
        date: "12 ตุลาคม 2567",
        title: "สรุปมาตรการสุขอนามัยประจำเดือน",
        description: "รายงานภาพรวมด้านสุขาภิบาลและข้อเสนอแนะสำหรับร้านค้าในพื้นที่",
    },
    {
        date: "10 ตุลาคม 2567",
        title: "มาตรการรักษาความสะอาดพื้นที่โซนอาหาร",
        description: "แนวทางการจัดพื้นที่และการดูแลความสะอาดที่ร้านค้าควรปฏิบัติ",
    },
    {
        date: "08 ตุลาคม 2567",
        title: "ประกาศการปรับปรุงพื้นที่จราจรภายใน",
        description: "แจ้งช่วงเวลาปรับปรุงและข้อควรระวังในการใช้งานพื้นที่ร่วมกัน",
    },
]

const services = [
    {
        icon: Newspaper,
        title: "ข่าวสินทรัพย์",
        description: "ติดตามข้อมูลและประกาศสำคัญ",
    },
    {
        icon: Store,
        title: "รับสมัครร้านค้า",
        description: "ดูรายละเอียดและสมัครเข้าพื้นที่",
    },
    {
        icon: FileText,
        title: "ระเบียบการ",
        description: "ข้อกำหนดและเงื่อนไขการใช้งาน",
    },
]

export default function NewsPage() {
    return (
        <div className="min-h-screen text-slate-900">
            <div className="mx-auto flex min-h-screen max-w-[1440px] pt-20">
                {/* Main Content */}
                <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between px-5 py-4 sm:px-8">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="lg:hidden">
                                <Menu className="size-5" />
                            </Button>
                            <div>
                                <AssetBreadcrumb
                                    items={[
                                        { label: "หน้าหลัก", href: "/" },
                                        { label: "ข่าวสารและประกาศ" }
                                    ]}
                                />
                            </div>
                        </div>

                    </div>

                    <div className="p-5 sm:p-8">
                        {/* <div className="max-w-2xl"> */}
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                            Highlight 2024
                        </p>
                        <h2 className="mt-5 text-7xl font-black leading-tight tracking-tight sm:text-5xl">
                            ประกาศรับสมัคร
                            <span className="block text-4xl font-black leading-tight tracking-tight sm:text-5xl">ร้านค้า</span>
                            <span className="block text-orange-500">เช่าพื้นที่ภายใน
                                มหาวิทยาลัย</span>
                            <span className="block">ปี 2567</span>
                        </h2>
                        <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                            ติดตามประกาศสำคัญ ข่าวประชาสัมพันธ์ และข้อมูลการรับสมัครพื้นที่เชิงพาณิชย์
                            ด้วยรูปแบบที่อ่านง่าย สบายตา และเน้นการใช้งานจริง
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link href={('/news/detail')}>
                                <Button className="bg-orange-500 text-white hover:bg-orange-600">
                                    อ่านเพิ่มเติม
                                    <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                            <Button variant="outline" className="border-orange-200 hover:bg-orange-50">
                                <Download className="size-4" />
                                ดาวน์โหลดระเบียบการ
                            </Button>
                        </div>
                        {/* </div> */}
                    </div>

                    <div className="p-5 sm:p-8 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                            ข่าวสารและประกาศล่าสุด
                        </h1>
                        <div className="flex items-center gap-2">
                            <Button className="bg-orange-500 text-white hover:bg-orange-600">
                                ดูทั้งหมด
                                <ArrowRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="grid gap-6 p-5 sm:p-8 xl:grid-cols-[1.6fr_0.9fr]">
                        {/* Main Highlight News */}
                        <div className="flex flex-col gap-6">
                            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#8c937d]">
                                <div className="absolute left-6 top-6 z-10 rounded bg-orange-500 px-3 py-1.5 text-sm font-bold text-white shadow-sm hover:bg-orange-600 cursor-default">
                                    ประกาศด่วน
                                </div>
                                {/* Placeholder for the stall image - you can replace src with your actual image */}
                                <img
                                    src="https://placehold.co/1200x675/8c937d/ffffff?text=Image+Placeholder"
                                    alt="ประกาศด่วน"
                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                            </div>

                            <div className="space-y-4 px-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                    <CalendarDays className="size-4" />
                                    <span>15 ตุลาคม 2567</span>
                                </div>
                                <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl cursor-pointer hover:text-orange-600 transition-colors">
                                    เปิดจองพื้นที่ตลาดนัดนักศึกษา ประจำภาคเรียนที่ 2
                                </h2>
                                <p className="text-base leading-relaxed text-slate-600">
                                    ขอเชิญนักศึกษาที่มีความประสงค์จะจำหน่ายสินค้า ลงทะเบียนเพื่อรับสิทธิ์ในการจัดสรรพื้นที่
                                    จำหน่ายสินค้า บริเวณลานกิจกรรมกลาง แจ้งความจำนงได้ตั้งแต่วันนี้...
                                </p>
                            </div>
                        </div>

                        {/* Detail News */}
                        <aside className="space-y-4">
                            {latestNews.map((news, index) => (
                                <Card
                                    key={news.title}
                                    className={`border-l-4 ${index === 0 ? "border-l-orange-500" : "border-l-orange-200"
                                        } border-orange-100 bg-white shadow-sm`}
                                >
                                    <CardContent className="p-5">
                                        <p className="text-xs font-medium text-slate-500">{news.date}</p>
                                        <h3 className="mt-2 text-base font-bold text-slate-900">{news.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            {news.description}
                                        </p>
                                        <button className="mt-4 text-sm font-semibold text-orange-500 hover:text-orange-600">
                                            อ่านต่อ
                                        </button>
                                    </CardContent>
                                </Card>
                            ))}
                        </aside>
                    </div>

                    {/* Services */}
                    <section className="border-t border-orange-100 px-5 py-6 sm:px-8">
                        <div className="mb-5 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                                    เมนูบริการหลัก
                                </p>
                                <h2 className="mt-2 text-2xl font-bold text-slate-900">เข้าถึงข้อมูลอย่างรวดเร็ว</h2>
                            </div>
                            <button className="text-sm font-semibold text-orange-500 hover:text-orange-600">
                                ดูทั้งหมด
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {services.map((service) => {
                                const Icon = service.icon

                                return (
                                    <Card
                                        key={service.title}
                                        className="border-orange-100 bg-white shadow-sm transition-transform hover:-translate-y-0.5"
                                    >
                                        <CardContent className="p-6 text-center">
                                            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-orange-50 text-orange-500">
                                                <Icon className="size-6" />
                                            </div>
                                            <h3 className="mt-4 text-lg font-bold text-slate-900">{service.title}</h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                {service.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}
