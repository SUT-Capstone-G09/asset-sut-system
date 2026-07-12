import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, FileText, Newspaper, Store } from "lucide-react";

const services = [
    {
        icon: Newspaper,
        title: "ข่าวสารประชาสัมพันธ์",
        description: "ติดตามข้อมูลข่าวสารและประกาศสำคัญต่างๆ",
        href: "#",
    },
    {
        icon: Store,
        title: "รับสมัครร้านค้า",
        description: "ดูรายละเอียดข้อกำหนดและลงทะเบียนรับสิทธิ์พื้นที่เช่า",
        href: "/services/tenant",
    },
    {
        icon: FileText,
        title: "ระเบียบการใช้งาน",
        description: "ข้อกำหนดและเงื่อนไขการใช้บริการสำหรับผู้เช่า",
        href: "/services/entrepreneur",
    },
];

export const NewsServices = () => {
    return (
        <section className="mt-20 pt-12 border-t border-slate-200">
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500 mb-2">
                        เมนูบริการหลัก
                    </p>
                    <h2 className="text-2xl font-black text-slate-900">เข้าถึงข้อมูลอย่างรวดเร็ว</h2>
                </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
                {services.map((service) => {
                    const Icon = service.icon;
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
                    );
                })}
            </div>
        </section>
    );
};
