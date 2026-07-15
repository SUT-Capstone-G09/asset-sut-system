"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Download, Megaphone, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: "slide-1",
    tag: "Highlight 2024",
    title: "ประกาศรับสมัคร",
    titleColored: "ร้านค้าเช่าพื้นที่",
    titleSuffix: "ภายในมหาวิทยาลัย",
    year: "ปี 2567",
    description: "ติดตามประกาศสำคัญ ข่าวประชาสัมพันธ์ และข้อมูลการรับสมัครพื้นที่เชิงพาณิชย์ ด้วยรูปแบบที่อ่านง่าย สบายตา และเน้นการใช้งานจริง",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    href: "/news/detail",
  },
  {
    id: "slide-2",
    tag: "Urgent 2024",
    title: "โครงการประมูลสิทธิ์",
    titleColored: "พื้นที่เช่าศูนย์กีฬา",
    titleSuffix: "และสุขภาพ มทส.",
    year: "เปิดรับข้อเสนอ",
    description: "เปิดรับข้อเสนอโครงการบริหารจัดการและพัฒนาศูนย์กีฬาและสระว่ายน้ำ เพื่อยกระดับการให้บริการแก่บุคลากรและนักศึกษาทุกระดับ",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    href: "/news/detail",
  },
  {
    id: "slide-3",
    tag: "Market 2024",
    title: "เปิดลงทะเบียน",
    titleColored: "จัดสรรพื้นที่ตลาดนัด",
    titleSuffix: "ลานประดู่เชิงพาณิชย์",
    year: "ภาคเรียนที่ 2",
    description: "เปิดลงทะเบียนล่วงหน้าสำหรับนักศึกษาและบุคคลทั่วไปที่มีความประสงค์จะจำหน่ายสินค้าและอาหารแห้ง ประจำภาคเรียนนี้",
    imageUrl: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80",
    href: "/news/detail",
  }
];

export const NewsHero = () => {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const extendedSlides = [...slides, slides[0]];

  const nextSlide = () => {
    if (current === slides.length) return;
    setIsTransitioning(true);
    setCurrent((prev) => prev + 1);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    if (current === 0) {
      setIsTransitioning(false);
      setCurrent(slides.length);
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrent(slides.length - 1);
      }, 50);
    } else {
      setCurrent((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (current === slides.length) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrent(0);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [current]);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [current]);

  const activeDot = current % slides.length;

  return (
    <div className="relative mx-6 sm:mx-10 mb-10 rounded-[32px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 group">
      {/* Background Accent */}
      <div className="absolute inset-0 opacity-20"
          style={{
              backgroundImage: "radial-gradient(circle at 70% 50%, #f26522 0%, transparent 60%)"
          }}
      />
      <div className="absolute inset-0 opacity-5"
          style={{
              backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px"
          }}
      />

      {/* Slides Container */}
      <div className="relative w-full overflow-hidden">
        <div 
          className={`flex ${isTransitioning ? "transition-transform duration-700 ease-in-out" : ""}`}
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {extendedSlides.map((slide, index) => (
            <div key={`${slide.id}-${index}`} className="w-full flex-shrink-0 grid md:grid-cols-2 gap-10 items-center px-8 sm:px-16 py-14 md:py-20">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-4 py-2 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  <span className="text-orange-300 text-xs font-bold uppercase tracking-[0.2em]">{slide.tag}</span>
                </div>

                <div>
                  <p className="text-orange-400 text-sm font-semibold mb-3">ประชาสัมพันธ์ล่าสุด</p>
                  <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                    {slide.title}
                    <span className="block text-orange-400">{slide.titleColored}</span>
                    <span className="block">{slide.titleSuffix}</span>
                    <span className="block text-3xl font-bold text-white/70 mt-1">{slide.year}</span>
                  </h1>
                </div>

                <p className="text-white/60 text-sm leading-relaxed max-w-md">
                  {slide.description}
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link href={slide.href}>
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

              <div className="hidden md:block">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute top-4 left-4 bg-orange-50 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Megaphone className="size-3.5" />
                    ประกาศด่วน
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons (Left & Right) */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 hover:bg-orange-500 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 hover:bg-orange-500 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIsTransitioning(true);
              setCurrent(i);
            }}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              activeDot === i ? "w-8 bg-orange-500" : "w-2.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
