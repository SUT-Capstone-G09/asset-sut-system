"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  User,
  LogOut,
  Settings,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/lib/context/auth-context";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user, logout, isAuthenticated } = useAuthContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  // ไม่แสดง Navbar ในหน้าที่มี Sidebar
  const isDashboardPage = pathname?.startsWith("/admin") || 
                          pathname?.startsWith("/operator") || 
                          pathname?.startsWith("/user");

  if (!mounted || isDashboardPage) return null;

  // เมนูนำทางหลัก
  const navItems = [
    ...(isAuthenticated && user?.role === "requester"
      ? [{ label: "แดชบอร์ด", href: "/dashboard" }]
      : []),
    { label: "เกี่ยวกับเรา", href: "/about" ,
      subItems: [
        { label: "เกี่ยวกับเรา", href: "/about" },
      ],
    },
    {
      label: "บริการ",
      href: "/services",
      subItems: [
        { label: "สำหรับผู้ประกอบการ", href: "/services/entrepreneur" },
        { label: "สำหรับผู้สนใจเช่า", href: "/services/tenant" },
        { label: "ผู้ใช้บริการ", href: "/my-bookings" },
      ],
    },
    { label: "พื้นที่ในการดูแล", href: "/areas" },
    { label: "ประชาสัมพันธ์", href: "/news" },
    { label: "ติดต่อเรา", href: "/requests" },
  ];

  // เมนูสำหรับผู้ใช้งานที่ Login แล้ว (แยกตาม Role)
  const userMenuItems = user ? [
    {
      label: "จัดการระบบ",
      href: "/admin/dashboard",
      icon: Settings,
      show: user.role === "admin",
    },
    {
      label: "โปรไฟล์",
      href: user.role === "operator" ? "/operator/profile" : "/user/profile",
      icon: User,
      show: user.role !== "admin",
    },
    {
      label: "แจ้งปัญหา",
      href: user.role === "operator" ? "/operator/report" : "/user/report",
      icon: AlertCircle,
      show: user.role !== "admin",
    },
  ].filter(item => item.show) : [];

  return (
    <>
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-[1001] border-b border-slate-100 shadow-sm overflow-hidden no-scrollbar">
        <div className="max-w px-6 mx-auto h-20 flex items-center justify-between">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group transition-all">
            <div className="overflow-hidden transform group-hover:scale-105 transition-transform">
              <Image
                src="/SUT_logo_orange.png"
                alt="SUT Logo"
                width={0}
                height={0}
                sizes="100vw"
                className="object-contain"
                style={{ width: 'auto', height: '40px' }}
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-brand-primary tracking-tight text-2xl leading-none font-sut">
                ASSET
              </span>
              <span className="text-[9px] font-medium text-brand-secondary tracking-[0.25em] uppercase leading-none mt-1 opacity-70">
                Management
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-10">
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const isItemActive = item.href === "/" 
                  ? pathname === "/" 
                  : pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                
                const isSubItemActive = item.subItems?.some(sub => pathname === sub.href);
                const active = isItemActive || isSubItemActive;

                return (
                  <div key={item.label} className="relative group">
                    {item.subItems ? (
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger 
                          className={cn(
                            "flex items-center gap-1 font-medium text-base transition-colors relative py-2 outline-none cursor-pointer",
                            active ? "text-brand-primary" : "text-brand-secondary hover:text-brand-primary"
                          )}
                        >
                          {item.label}
                          <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
                          <span className={cn(
                            "absolute bottom-0 left-0 h-0.5 bg-brand-primary transition-all",
                            active ? "w-full" : "w-0 group-hover:w-full"
                          )} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 p-2 z-[1100]">
                          {item.subItems.map((subItem) => {
                            const isSubActive = pathname === subItem.href;
                            return (
                              <DropdownMenuItem key={subItem.href} asChild>
                                <Link
                                  href={subItem.href}
                                  className={cn(
                                    "w-full cursor-pointer p-3 transition-colors",
                                    isSubActive ? "text-brand-primary bg-brand-primary/5" : "focus:text-brand-primary"
                                  )}
                                >
                                  <div className="text-sm font-medium">{subItem.label}</div>
                                </Link>
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "font-medium text-base transition-colors relative py-2 block",
                          active ? "text-brand-primary" : "text-brand-secondary hover:text-brand-primary"
                        )}
                      >
                        {item.label}
                        <span className={cn(
                          "absolute bottom-0 left-0 h-0.5 bg-brand-primary transition-all",
                          active ? "w-full" : "w-0 group-hover:w-full"
                        )} />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-4">
              {isAuthenticated && user ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary/10 hover:bg-brand-primary/20 transition-colors cursor-pointer outline-none">
                      <User className="w-5 h-5 text-brand-primary" />
                    </button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent align="end" className="w-52 p-2 z-[1100]">
                    {/* User Header */}
                    <div className="px-3 py-2 mb-1 border-b border-slate-50">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">บัญชีผู้ใช้งาน</p>
                      <p className="text-sm font-bold text-brand-secondary truncate">{user.email}</p>
                    </div>

                    {/* Dynamic Role Items */}
                    {userMenuItems.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          className="w-full cursor-pointer p-3 focus:text-brand-primary flex items-center gap-3 transition-colors"
                        >
                          <item.icon className="w-4 h-4 text-gray-400 group-hover:text-brand-primary" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}

                    {/* Logout Button */}
                    <div className="mt-1 pt-1 border-t border-slate-50">
                      <DropdownMenuItem 
                        className="w-full cursor-pointer p-3 focus:bg-red-50 focus:text-red-600 text-red-500 flex items-center gap-3 transition-colors"
                        onClick={() => logout()}
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">ออกจากระบบ</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => router.push("/login")}
                  className="px-8 font-bold bg-brand-primary hover:bg-brand-primary/90 text-white"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

    </>
  );
}