"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  FileText,
  Download,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SubMenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface MenuItem {
  label: string;
  subItems: SubMenuItem[];
}

export default function OperatorSidebar() {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      label: "ข้อมูลร้านค้า",
      subItems: [
        {
          label: "ข้อมูลร้านค้า & สัญญา",
          href: "/operator/contracts",
          icon: <Home className="w-4 h-4" />,
        },
        {
          label: "ข้อมูลส่วนตัว",
          href: "/operator/profile",
          icon: <User className="w-4 h-4" />,
        },
      ],
    },
    {
      label: "การเงิน & เอกสาร",
      subItems: [
        {
          label: "ใบแจ้งหนี้ & บิล",
          href: "/operator/bills",
          icon: <FileText className="w-4 h-4" />,
        },
        {
          label: "เอกสารของฉัน",
          href: "/operator/documents",
          icon: <Download className="w-4 h-4" />,
        },
      ],
    },
    {
      label: "แจ้งเรื่อง",
      subItems: [
        {
          label: "แจ้งปัญหา",
          href: "/operator/report",
          icon: <AlertCircle className="w-4 h-4" />,
        },
      ],
    },
  ];

  const isSubItemActive = (subItem: SubMenuItem): boolean => {
    return pathname === subItem.href;
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-[98]">
      {/* Logo Header — same height as topbar */}
      <div className="h-25 flex items-center px-5 border-b border-gray-200 shrink-0">
        <Link href="/" className="flex flex-col">
          <span className="text-2xl font-bold text-orange-600 leading-tight">
            Asset SUT
          </span>
          <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium">
            Modern Concierge
          </span>
        </Link>

      </div>

      {/* Menu — vertically centered, left-aligned */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="px-4 pt-6 space-y-6">
          {menuItems.map((menu, menuIdx) => (
            <div
              key={menuIdx}
              className={cn(
                "space-y-1",
                menuIdx < menuItems.length - 1 && "pb-6 border-b border-gray-100"
              )}
            >
              {/* Category Title */}
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                {menu.label}
              </h3>

              {/* Submenu Items */}
              <div className="space-y-0.5 -mx-4">
                {menu.subItems.map((subItem, subIdx) => {
                  const isActive = isSubItemActive(subItem);
                  return (
                    <Link
                      key={subIdx}
                      href={subItem.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 transition-colors text-sm",
                        isActive
                          ? "bg-brand-primary/10 text-brand-primary font-semibold border-l-[3px] border-brand-primary"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-l-[3px] border-transparent"
                      )}
                    >
                      <span className={cn("flex-shrink-0", isActive ? "text-brand-primary" : "text-gray-400")}>
                        {subItem.icon}
                      </span>
                      <span className="flex-1">{subItem.label}</span>

                      {/* Badge */}
                      {subItem.badge && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-600 text-white">
                          {subItem.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
