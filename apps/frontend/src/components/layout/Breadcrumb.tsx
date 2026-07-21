"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockBuildings } from "@/features/space-rental/data/mock-buildings";
import { mockLocations } from "@/features/space-rental/data/mock-rental-spaces";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "แดชบอร์ด",
  bookings: "จองพื้นที่",
  confirm: "ยืนยันการจอง",
  "my-bookings": "การจองของฉัน",
  payment: "ชำระเงิน",
  success: "ชำระเงินสำเร็จ",
  news: "ข่าวสาร",
  detail: "รายละเอียด",
  areas: "พื้นที่",
  admin: "จัดการระบบ",
  staff: "Staff Portal",
  booking: "การขอใช้พื้นที่",
  "manage-rooms": "จัดการห้อง",
  verify: "ตรวจสอบการชำระเงิน",
  "access-setting": "ตั้งค่าสิทธิ์",
  "news-management": "จัดการข่าวสาร",
  requests: "คำร้องขอ",
  "manage-requests": "รายละเอียดคำร้อง",
  "email-templates": "จัดการเทมเพลตอีเมล",
  "send": "ส่งอีเมล",
  "broadcasts": "รายการส่งอีเมล",
  "manage-halls": "จัดการโถงอาคาร",
  "calendar": "ปฏิทินรายการขอใช้พื้นที่",
  create: "สร้างใหม่",
  finance: "การเงิน",
  invoices: "ใบแจ้งหนี้",
  envelop: "ใบเสร็จ",
  tenants: "ผู้เช่า",
  eval: "ประเมิน",
  categories: "หมวดหมู่",
  form: "แบบฟอร์ม",
  lists: "รายการ",
  classroom: "ห้องเรียน",
  meeting: "ห้องประชุม",
  "space-rental": "พื้นที่เช่า & ร้านค้า",
  type: "ประเภทพื้นที่",
  building: "อาคาร",
  space: "ยูนิตพื้นที่",
  expenses: "ค่าใช้จ่าย",
};

// กำหนดว่า section ไหนสามารถเป็น "referrer context" ของ section ไหนได้
// เช่น /bookings สามารถมี context จาก /my-bookings หรือ /dashboard ได้
const VALID_REFERRER_SECTIONS: Record<string, string[]> = {
  "/bookings": ["/my-bookings", "/dashboard"],
  "/payment": ["/my-bookings"],
};

// ซ่อน Path ที่ไม่มีหน้า UI จริง เพื่อไม่ให้แสดงเป็นคำคั่นตรงกลาง
const GHOST_PATHS = new Set([
  "/admin/payment",
  "/admin/booking",
]);

// แทนที่ Path ที่คลิกแล้วให้วิ่งไปหน้าที่ต้องการ (เช่น คลิก "จัดการระบบ" ให้วิ่งไป "แดชบอร์ด")
const PATH_REDIRECTS: Record<string, string> = {
  "/admin": "/admin/dashboard",
};

const SKIP_PATHS = new Set(["/", "/login", "/contact-us"]);
const STORAGE_KEY = "nav_breadcrumb";
const MAX_CRUMBS = 6;

interface Crumb {
  href: string;
  label: string;
}

function getSection(pathname: string): string {
  const first = pathname.split("/").filter(Boolean)[0];
  return first ? `/${first}` : "/";
}

function formatDynamic(seg: string, parent: string) {
  if (parent === "my-bookings" || parent === "payment") return `#BK-${seg}`;
  if (parent === "bookings") return `ห้อง #${seg}`;
  if (parent === "lists") return `พื้นที่ #${seg}`;
  if (parent === "building") {
    const b = mockBuildings.find((item) => String(item.id) === seg);
    return b ? b.name : `อาคาร #${seg}`;
  }
  return `#${seg}`;
}

function segmentLabel(seg: string, parent: string) {
  const decodedSeg = decodeURIComponent(seg);
  const decodedParent = decodeURIComponent(parent);
  
  if (decodedParent === "space") {
    const s = mockLocations.find((item) => item.id === decodedSeg);
    return s ? s.name : decodedSeg;
  }

  if (/^\d+$/.test(decodedSeg)) return formatDynamic(decodedSeg, decodedParent);
  return SEGMENT_LABELS[decodedSeg] ?? decodedSeg;
}

function labelForPath(pathname: string): string {
  const decodedPathname = decodeURIComponent(pathname);
  const segs = decodedPathname.split("/").filter(Boolean);
  if (!segs.length) return "หน้าหลัก";
  const last = segs[segs.length - 1];
  const parent = segs[segs.length - 2] ?? "";
  return segmentLabel(last, parent);
}

function buildUrlCrumbs(pathname: string): Crumb[] {
  const segs = pathname.split("/").filter(Boolean);
  return segs.map((seg, i) => {
    let href = "/" + segs.slice(0, i + 1).join("/");
    if (href === "/admin") {
      href = "/admin/dashboard";
    }
    return {
      href,
      label: segmentLabel(seg, segs[i - 1] ?? ""),
    };
  });
}

function computeNext(newPath: string, history: Crumb[]): Crumb[] {
  // 1. หน้านี้อยู่ใน history แล้ว → ตัดกลับไปจุดนั้น (กดย้อนกลับ)
  const existingIdx = history.findIndex((c) => c.href === newPath);
  if (existingIdx >= 0) return history.slice(0, existingIdx + 1);

  const last = history[history.length - 1];

  // 2. หน้าใหม่เป็น sub-path ของ crumb ล่าสุด → ต่อเนื่องตาม URL
  if (last && newPath.startsWith(last.href + "/")) {
    const next = [...history, { href: newPath, label: labelForPath(newPath) }];
    return next.length > MAX_CRUMBS ? next.slice(-MAX_CRUMBS) : next;
  }

  // 3. เช็ค referrer whitelist
  const newSection = getSection(newPath);
  const validReferrers = VALID_REFERRER_SECTIONS[newSection];
  if (validReferrers && last) {
    const lastSection = getSection(last.href);
    if (validReferrers.includes(lastSection)) {
      // เก็บ crumbs จาก referrer section + เพิ่ม URL crumbs ของหน้าใหม่
      const refCrumbs = history.filter(
        (c) => getSection(c.href) === lastSection,
      );
      const newUrlCrumbs = buildUrlCrumbs(newPath).filter(
        (c) => getSection(c.href) !== lastSection,
      );
      const combined = [...refCrumbs, ...newUrlCrumbs];
      return combined.length > MAX_CRUMBS
        ? combined.slice(-MAX_CRUMBS)
        : combined;
    }
  }

  // 4. Default: ใช้ URL-based crumbs ตาม path ปัจจุบัน (reset context)
  return buildUrlCrumbs(newPath);
}

function loadCrumbs(): Crumb[] {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveCrumbs(crumbs: Crumb[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(crumbs));
}

export default function Breadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);
  const [mounted, setMounted] = useState(false);
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setCrumbs(loadCrumbs());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    if (SKIP_PATHS.has(pathname)) {
      saveCrumbs([]);
      setCrumbs([]);
      return;
    }

    const next = computeNext(pathname, loadCrumbs());
    // รีเฟรช label จาก href เสมอ — กัน label เก่าที่ถูก cache ไว้ใน sessionStorage ค้าง
    // (เช่น crumb ที่ถูกเก็บก่อนเพิ่ม SEGMENT_LABELS จะยังโชว์ seg ดิบ เช่น "send"/"broadcasts")
    const refreshed = next.map((c) => ({ ...c, label: labelForPath(c.href) }));
    saveCrumbs(refreshed);
    setCrumbs(refreshed);
  }, [pathname, mounted]);

  if (!mounted || crumbs.length === 0) return null;

  // กรองเอาเฉพาะ Path ที่ไม่ใช่ Ghost Path ออกมาแสดง
  const displayCrumbs = crumbs.filter((c) => !GHOST_PATHS.has(c.href));

  return (
    <nav
      aria-label="breadcrumb"
      className={cn("flex items-center gap-1 text-sm flex-wrap", className)}
    >
      <Link
        href="/"
        className="flex items-center text-gray-400 hover:text-brand-primary transition-colors shrink-0"
      >
        <Home size={13} />
      </Link>

      {displayCrumbs.map((crumb, i) => {
        const isLast = i === displayCrumbs.length - 1;
        const targetHref = PATH_REDIRECTS[crumb.href] || crumb.href;
        
        return (
          <span
            key={crumb.href + i}
            className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-200"
            style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
          >
            <ChevronRight size={13} className="text-gray-300 shrink-0" />
            {isLast ? (
              <span className="text-gray-700 font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={targetHref}
                className="text-gray-400 hover:text-brand-primary transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
