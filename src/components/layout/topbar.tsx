"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { LoginModal } from "@/app/login/page";

export default function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const navItems = [
    { label: "เกี่ยวกับเรา", href: "/about" },
    {
      label: "บริการ",
      href: "/services",
      subItems: [
        { label: "สำหรับผู้ประกอบการ", href: "/services/entrepreneur" },
        { label: "สำหรับผู้สนใจเช่า", href: "/services/tenant" },
        { label: "ผู้ใช้บริการ", href: "/services/user" },
      ],
    },
    { label: "พื้นที่ในการดูแล", href: "/areas" },
    { label: "ประชาสัมพันธ์", href: "/news" },
    { label: "ติดต่อเรา", href: "/report" },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-[99] border-b border-slate-100 shadow-sm">
        <div className="max-w px-6 mx-auto h-20 flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group transition-all">
            <div className="overflow-hidden transform group-hover:scale-105 transition-transform">
              <Image
                src="/SUT_logo.png"
                alt="SUT Logo"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-brand-primary tracking-tighter text-xl leading-none">
                ASSET
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <div className="flex items-center gap-10">
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <div key={item.label} className="relative group">
                  {item.subItems ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 text-brand-secondary font-medium text-base hover:text-brand-primary transition-colors outline-none cursor-pointer">
                        {item.label}
                        <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56 p-2 z-[100]">
                        {item.subItems.map((subItem) => (
                          <DropdownMenuItem key={subItem.href} asChild>
                            <Link
                              href={subItem.href}
                              className="w-full cursor-pointer p-3 focus:text-brand-primary"
                            >
                              <div className="text-sm">{subItem.label}</div>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-brand-secondary font-medium text-base hover:text-brand-primary transition-colors relative py-2"
                    >
                      {item.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-primary transition-all group-hover:w-full" />
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated && user ? (
                <>
                  <span className="text-sm font-medium text-brand-secondary">
                    {user.name}
                  </span>
                  <Button
                    onClick={() => logout()}
                    className="px-8 font-bold bg-red-600 hover:bg-red-700 text-white"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-8 font-bold bg-brand-primary hover:bg-brand-primary/90 text-white"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LoginModal isOpen={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </>
  );
}