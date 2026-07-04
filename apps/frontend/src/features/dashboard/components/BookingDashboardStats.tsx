"use client";

import { Calendar, Users, Wallet, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingResponseDTO } from "@/features/bookings/services/booking.service";

interface BookingDashboardStatsProps {
  bookings: BookingResponseDTO[];
}

export function BookingDashboardStats({ bookings }: BookingDashboardStatsProps) {
  // 1. Total bookings
  const totalBookings = bookings.length;

  // 2. Total Users (unique users)
  const uniqueUsers = new Set(bookings.map((b) => b.user_id)).size;

  // 3. Revenue (only completed or approved)
  const revenue = bookings
    .filter((b) => b.status === "completed" || b.status === "approved")
    .reduce((sum, b) => sum + b.total_price, 0);

  // 4. Occupancy Rate (Mock logic for now: (Total Bookings / 100) * 100 capped at 100%)
  const occupancyRate = Math.min((totalBookings / 100) * 100, 100).toFixed(1);

  const stats = [
    {
      title: "การจองทั้งหมด",
      value: totalBookings.toLocaleString(),
      trend: "+ 0%",
      trendUp: true,
      icon: Calendar,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50",
    },
    {
      title: "จำนวนผู้ขอใช้พื้นที่",
      value: uniqueUsers.toLocaleString(),
      trend: "+ 0%",
      trendUp: true,
      icon: Users,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50",
    },
    {
      title: "รายรับจากการขอใช้บริการ",
      value: `฿${revenue.toLocaleString()}`,
      trend: "+ 0%",
      trendUp: true,
      icon: Wallet,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50",
    },
    {
      title: "อัตราการใช้งานพื้นที่",
      value: `${occupancyRate}%`,
      trend: "- 0%",
      trendUp: false,
      icon: Gauge,
      iconColor: "text-red-400",
      iconBg: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col justify-between shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  stat.iconBg
                )}
              >
                <Icon className={cn("w-5 h-5", stat.iconColor)} />
              </div>
              <span
                className={cn(
                  "text-xs font-semibold px-2 py-1 rounded-full",
                  stat.trendUp
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-gray-500 bg-gray-50"
                )}
              >
                {stat.trendUp ? "↗ " : "– "}{stat.trend.replace(/[+\-]\s*/, "")}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
