"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Store,
  Building,
  Wallet,
  ClipboardList,
  Calendar,
  Wrench,
  Settings,
  Mail,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/lib/context/auth-context";

// ── Types ──────────────────────────────────────────
interface SubItem {
  label: string;
  href: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  subItems?: SubItem[];
  roles?: string[]; // ถ้าไม่กำหนด = ทุก role เห็น
}

interface MenuGroup {
  label?: string;
  items: MenuItem[];
  roles?: string[]; // ถ้าไม่กำหนด = ทุก role เห็น
}

// ── Menu Data ──────────────────────────────────────
const menuGroups: MenuGroup[] = [
  {
    items: [
      {
        id: "dashboard",
        label: "แดชบอร์ด",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
      },
    ],
  },
  {
    label: "การจัดการพื้นที่เช่า",
    roles: ["admin"], // staff ไม่เห็น section นี้
    items: [
      {
        id: "areas",
        label: "พื้นที่เช่า",
        icon: Building,
        href: "/admin/areas",
      },
      {
        id: "tenants",
        label: "ผู้ประกอบการ & ร้านค้า",
        icon: Store,
        subItems: [
          { label: "รายชื่อผู้ประกอบการ", href: "/admin/tenants/lists" },
          { label: "ผลการประเมินผู้ประกอบการ", href: "/admin/tenants/eval" },
        ],
      },
      {
        id: "contracts",
        label: "สัญญา",
        icon: ClipboardList,
        href: "/admin/contracts",
      },
      {
        id: "finance",
        label: "การเงิน",
        icon: Wallet,
        subItems: [
          { label: "อัพโหลดใบแจ้งหนี้", href: "/admin/finance/invoices" },
          { label: "จัดการซอง & ใบเสร็จ", href: "/admin/finance/envelop" },
        ],
      },
      {
        id: "requests",
        label: "รายการคำร้อง",
        icon: ClipboardList,
        href: "/admin/requests",
      },
    ],
  },
  {
    label: "การจองพื้นที่",
    items: [
      {
        id: "booking",
        label: "ขอใช้พื้นที่",
        icon: Calendar,
        href: "/admin/booking",
      },
      {
        id: "payment-verify",
        label: "ตรวจสอบการชำระเงิน",
        icon: Wallet,
        href: "/admin/payment/verify",
      },
      {
        id: "manage-rooms",
        label: "จัดการห้อง",
        icon: Building,
        href: "/admin/manage-rooms",
      },
      {
        id: "manage-halls",
        label: "จัดการโถงพื้นที่",
        icon: LayoutGrid,
        href: "/admin/manage-halls",
        roles: ["admin"], // เฟสนี้ admin เท่านั้น
      },
      {
        id: "calendar",
        label: "ปฏิทินรายการขอใช้พื้นที่",
        icon: Calendar,
        href: "/admin/calendar",
      },
    ],
  },
  {
    items: [
      {
        id: "news",
        label: "จัดการประชาสัมพันธ์",
        icon: Wrench,
        href: "/admin/news-management",
      },
      {
        id: "email-templates",
        label: "เทมเพลตอีเมล",
        icon: Mail,
        subItems: [
          { label: "จัดการเทมเพลต", href: "/admin/email-templates" },
          { label: "ส่งอีเมล", href: "/admin/email-templates/send" },
          { label: "ประวัติการส่ง", href: "/admin/email-templates/broadcasts" },
        ],
      },
      {
        id: "access-setting",
        label: "ตั้งค่าสิทธิ์การเข้าถึง",
        icon: Settings,
        href: "/admin/access-setting",
        roles: ["admin"], // staff ไม่เห็นเมนูนี้
      },
    ],
  },
];

// ── Component ──────────────────────────────────────
export default function AdminSidebar() {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const { user } = useAuthContext();
  const role = user?.role ?? "staff";

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isSubItemActive = (href: string) => pathname === href;
  const isMenuItemActive = (item: MenuItem) => {
    if (item.href) return pathname === item.href;
    return item.subItems?.some((sub) => pathname === sub.href) ?? false;
  };

  const canSee = (roles?: string[]) => !roles || roles.includes(role);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-[98]">
      {/* Logo Header */}
      <div className="h-25 flex items-center px-5 border-b border-gray-200 shrink-0">
        <Link href="/" className="flex flex-col">
          <span className="text-2xl font-bold text-orange-600 leading-tight">
            Asset SUT
          </span>
          <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium">
            {role === "admin" ? "Admin Portal" : "Staff Portal"}
          </span>
        </Link>
      </div>

      {/* Menu */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="px-4 pt-6 pb-6 space-y-6">
          {menuGroups.filter((g) => canSee(g.roles)).map((group, groupIdx, arr) => {
            const visibleItems = group.items.filter((item) => canSee(item.roles));
            if (visibleItems.length === 0) return null;

            return (
              <div
                key={groupIdx}
                className={cn(
                  "space-y-1",
                  groupIdx < arr.length - 1 && "pb-6 border-b border-gray-100"
                )}
              >
                {/* Section Label */}
                {group.label && (
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                    {group.label}
                  </h3>
                )}

                {/* Items */}
                <div className="space-y-0.5 -mx-4">
                  {visibleItems.map((item) => {
                    const isActive = isMenuItemActive(item);
                    const isOpen = openItems.has(item.id);
                    const Icon = item.icon;

                    if (item.href) {
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 transition-colors text-sm",
                            isActive
                              ? "bg-brand-primary/10 text-brand-primary font-semibold border-l-[3px] border-brand-primary"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-l-[3px] border-transparent"
                          )}
                        >
                          <span className={cn("flex-shrink-0", isActive ? "text-brand-primary" : "text-gray-400")}>
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className="flex-1">{item.label}</span>
                        </Link>
                      );
                    }

                    return (
                      <div key={item.id}>
                        <button
                          onClick={() => toggleItem(item.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-sm",
                            isActive
                              ? "bg-brand-primary/10 text-brand-primary font-semibold border-l-[3px] border-brand-primary"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-l-[3px] border-transparent"
                          )}
                        >
                          <span className={cn("flex-shrink-0", isActive ? "text-brand-primary" : "text-gray-400")}>
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronDown
                            className={cn(
                              "w-3.5 h-3.5 text-gray-400 transition-transform duration-200",
                              isOpen && "rotate-180"
                            )}
                          />
                        </button>

                        {isOpen && item.subItems && (
                          <div className="bg-gray-50/80">
                            {item.subItems.map((sub) => {
                              const isSubActive = isSubItemActive(sub.href);
                              return (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  className={cn(
                                    "flex items-center gap-3 pl-11 pr-4 py-2 transition-colors text-sm border-l-[3px]",
                                    isSubActive
                                      ? "text-brand-primary font-semibold border-brand-primary bg-brand-primary/5"
                                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-100 border-transparent"
                                  )}
                                >
                                  <span className={cn("w-1 h-1 rounded-full flex-shrink-0", isSubActive ? "bg-brand-primary" : "bg-gray-300")} />
                                  {sub.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
