"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { SearchIcon, FilterIcon, Eye, Pencil, Award, ChevronLeft, ChevronRight } from "lucide-react";
import {
  mockEvaluations,
  evalCategories,
} from "../../data/mock-evals";
import { cn } from "@/lib/utils";

export function AdminEvalTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const formatDateTh = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const months = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    const month = months[date.getMonth()];
    const yearBE = date.getFullYear() + 543;
    return `${day} ${month} ${yearBE}`;
  };

  const filteredData = useMemo(() => {
    return mockEvaluations.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const matchesSearch = item.storeName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  const getCategoryBadge = (catId: string) => {
    const cat = evalCategories.find((c) => c.id === catId);
    const label = cat ? cat.label : catId;

    const colorMap: Record<string, string> = {
      cafe_drink_snack: "bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-50",
      convenience_store: "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50",
      vending_machine: "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-50",
      laundromat: "bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-50",
      atm: "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-50",
      telecom_network: "bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-50",
      it_equipment: "bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-50",
      public_relations_sign: "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-50",
      copier_printer: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50",
      space_utilization: "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50",
      canteen: "bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-50",
    };

    const colorClass = colorMap[catId] || "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-50";

    return (
      <Badge variant="outline" className={cn("font-medium px-2.5 py-0.5 rounded-full text-xs border whitespace-nowrap", colorClass)}>
        {label}
      </Badge>
    );
  };

  return (
    <>
      <CardContent className="px-0">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200">
          {/* Category Tabs */}
          <div className="flex overflow-x-auto no-scrollbar w-full md:max-w-[70%] lg:max-w-[75%] -mb-[2px] gap-1 pb-0.5 scroll-smooth">
            {evalCategories.map((category) => {
              const count = mockEvaluations.filter(
                (e) => category.id === "all" || e.category === category.id,
              ).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-semibold transition-colors whitespace-nowrap shrink-0",
                    activeCategory === category.id
                      ? "border-b-2 border-[#E9652B] text-[#E9652B]"
                      : "border-b-2 border-transparent text-slate-500 hover:text-slate-700",
                  )}
                >
                  {category.label}
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold transition-colors",
                      activeCategory === category.id
                        ? "bg-[#E9652B] text-white"
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-4 pb-3 w-full md:w-auto justify-between md:justify-end">
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาชื่อร้านค้า..."
                className="pl-9 bg-slate-100 border-none rounded-[7px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardContent>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="w-[35%] text-gray-600 font-semibold py-4 pl-6">ผู้ประกอบการ / ร้านค้า</TableHead>
                <TableHead className="w-[20%] text-gray-600 font-semibold py-4">หมวดหมู่</TableHead>
                <TableHead className="w-[15%] text-gray-600 font-semibold py-4">วันที่ตรวจล่าสุด</TableHead>
                <TableHead className="w-[10%] text-gray-600 font-semibold py-4">คะแนน</TableHead>
                <TableHead className="w-[10%] text-gray-600 font-semibold py-4">สถานะ</TableHead>
                <TableHead className="text-right text-gray-600 font-semibold py-4 pr-6">จัดการ</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <TableCell className="py-4 pl-6">
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.storeName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                            -
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[15px] text-gray-900">
                          {item.storeName}
                        </span>
                        <span className="text-gray-500 text-xs mt-1">รหัส: {item.id} • {item.location}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {getCategoryBadge(item.category)}
                  </TableCell>
                  <TableCell className="py-4 text-gray-600 text-sm">
                    {formatDateTh(item.lastAuditDate)}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1.5 text-gray-700 text-sm">
                      <Award className={cn("w-4 h-4", item.score < 50 ? "text-red-400" : "text-orange-400")} />
                      <span className={cn("font-semibold", item.score < 50 ? "text-red-600" : "text-gray-900")}>
                        {item.score}
                      </span>
                      <span className="text-gray-400 text-xs">/ 100</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium",
                      item.status === 'ผ่าน' ? 'bg-green-100 text-green-700' :
                      item.status === 'ไม่ผ่าน' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        item.status === 'ผ่าน' ? 'bg-green-500' :
                        item.status === 'ไม่ผ่าน' ? 'bg-red-500' :
                        'bg-yellow-500'
                      )} />
                      {item.status}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-3">
                      <Link href="/admin/tenants/eval/detail">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                        >
                          ดูรายละเอียด
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-gray-50/50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
          <span className="text-sm text-gray-500">
            แสดง 1 ถึง {filteredData.length} จากทั้งหมด {filteredData.length} รายการ
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="default" size="sm" className="h-8 w-8 bg-[#C2410C] hover:bg-[#9a330a] text-white">
              1
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
