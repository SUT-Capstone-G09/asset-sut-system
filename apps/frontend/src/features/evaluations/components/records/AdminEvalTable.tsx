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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SearchIcon, Award, ChevronLeft, ChevronRight, ShieldCheck, Users, ClipboardCheck, ArrowUpRight, Store, CheckSquare, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { mockEvaluations, evalCategories } from "../../data/mock-evals";
import { cn } from "@/lib/utils";
import { EvaluatorType } from "../../types/evaluation";

interface StoreSummary {
  id: string; // Store name as ID for grouping
  storeName: string;
  location: string;
  category: string;
  image?: string;
  totalEvals: number;
  adminEvals: number;
  staffEvals: number;
  externalEvals: number;
  avgScore: number;
  latestAuditDate: string;
  status: 'ผ่าน' | 'ไม่ผ่าน' | 'ปรับปรุง';
  warningCount: number;
}

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

  // 1. Group records by store
  const storeSummaries = useMemo(() => {
    const map = new Map<string, StoreSummary>();

    mockEvaluations.forEach(record => {
      const key = record.storeName;
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          storeName: record.storeName,
          location: record.location,
          category: record.category,
          image: record.image,
          totalEvals: 0,
          adminEvals: 0,
          staffEvals: 0,
          externalEvals: 0,
          avgScore: 0,
          latestAuditDate: record.lastAuditDate,
          status: 'ผ่าน', // Will be calculated
          warningCount: 0,
        });
      }

      const summary = map.get(key)!;
      summary.totalEvals += 1;
      summary.avgScore += record.score;
      summary.warningCount += record.warningCount;

      if (record.evaluatorType === 'admin') summary.adminEvals += 1;
      if (record.evaluatorType === 'staff') summary.staffEvals += 1;
      if (record.evaluatorType === 'external') summary.externalEvals += 1;

      // Keep the most recent date
      if (new Date(record.lastAuditDate) > new Date(summary.latestAuditDate)) {
        summary.latestAuditDate = record.lastAuditDate;
      }
    });

    // Finalize averages and status
    Array.from(map.values()).forEach(summary => {
      summary.avgScore = Math.round(summary.avgScore / summary.totalEvals);
      if (summary.avgScore >= 80) summary.status = 'ผ่าน';
      else if (summary.avgScore >= 50) summary.status = 'ปรับปรุง';
      else summary.status = 'ไม่ผ่าน';
    });

    return Array.from(map.values());
  }, []);

  // 2. Filter the grouped summaries
  const filteredData = useMemo(() => {
    return storeSummaries.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const matchesSearch = item.storeName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm, storeSummaries]);

  // Statistics (Global action counts)
  const stats = useMemo(() => {
    const total = mockEvaluations.length;
    const adminCount = mockEvaluations.filter(e => e.evaluatorType === "admin").length;
    const staffCount = mockEvaluations.filter(e => e.evaluatorType === "staff").length;
    const externalCount = mockEvaluations.filter(e => e.evaluatorType === "external").length;
    return { total, adminCount, staffCount, externalCount };
  }, []);

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
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">การประเมินทั้งหมด</p>
            <p className="text-3xl font-bold text-slate-900">{stats.total} <span className="text-sm font-medium text-slate-400">ครั้ง</span></p>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
            <ClipboardCheck className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">แอดมินประเมิน</p>
            <p className="text-3xl font-bold text-violet-700">{stats.adminCount} <span className="text-sm font-medium text-violet-400">ครั้ง</span></p>
          </div>
          <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center text-violet-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">บุคลากรประเมิน</p>
            <p className="text-3xl font-bold text-blue-700">{stats.staffCount} <span className="text-sm font-medium text-blue-400">ครั้ง</span></p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">บุคคลภายนอกประเมิน</p>
            <p className="text-3xl font-bold text-emerald-700">{stats.externalCount} <span className="text-sm font-medium text-emerald-400">ครั้ง</span></p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 pb-2">
        {/* Category Tabs */}
        <div className="flex overflow-x-auto no-scrollbar w-full md:max-w-[70%] lg:max-w-[75%] -mb-[10px] gap-1 pb-0.5 scroll-smooth">
          {evalCategories.map((category) => {
            const count = storeSummaries.filter(
              (e) => (category.id === "all" || e.category === category.id)
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

        {/* Search */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="relative w-64">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อร้านค้า..."
              className="pl-9 bg-slate-50 border border-slate-200 rounded-[7px] focus:ring-orange-400 focus:border-orange-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-slate-600 font-bold py-4 pl-6">ร้านค้า / สถานที่</TableHead>
                <TableHead className="text-slate-600 font-bold py-4 w-[15%]">หมวดหมู่</TableHead>
                <TableHead className="text-slate-600 font-bold py-4 w-[22%]">การประเมินสะสม</TableHead>
                <TableHead className="text-slate-600 font-bold py-4 w-[12%]">วันที่ตรวจล่าสุด</TableHead>
                <TableHead className="text-slate-600 font-bold py-4 w-[10%] text-center">คะแนนเฉลี่ย</TableHead>
                <TableHead className="text-slate-600 font-bold py-4 w-[10%] text-center">สถานะรวม</TableHead>
                <TableHead className="text-right text-slate-600 font-bold py-4 pr-6 w-[8%]"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                    ไม่พบข้อมูลร้านค้าที่ตรงกับเงื่อนไข
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <TableCell className="py-4 pl-6 align-top">
                      <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.storeName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Store className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col pt-0.5">
                          <span className="font-bold text-[14px] text-slate-900 leading-tight">
                            {item.storeName}
                          </span>
                          <span className="text-slate-500 text-xs mt-1 flex items-center gap-1.5">
                            {item.location}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4 align-top pt-5">
                      {getCategoryBadge(item.category)}
                    </TableCell>

                    <TableCell className="py-4 align-top pt-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-bold text-slate-800">
                          รวม {item.totalEvals} ครั้ง
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.adminEvals > 0 && (
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-violet-200 bg-violet-50 text-[10px] font-bold text-violet-700">
                              <ShieldCheck className="w-3 h-3" /> {item.adminEvals}
                            </div>
                          )}
                          {item.staffEvals > 0 && (
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-[10px] font-bold text-blue-700">
                              <CheckSquare className="w-3 h-3" /> {item.staffEvals}
                            </div>
                          )}
                          {item.externalEvals > 0 && (
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-700">
                              <Users className="w-3 h-3" /> {item.externalEvals}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 align-top pt-5 text-slate-600 text-sm font-medium">
                      {formatDateTh(item.latestAuditDate)}
                    </TableCell>
                    
                    <TableCell className="py-4 align-top pt-5 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                        <Award className={cn("w-4 h-4", item.avgScore < 50 ? "text-red-500" : item.avgScore < 80 ? "text-amber-500" : "text-emerald-500")} />
                        <span className={cn("font-bold text-sm", item.avgScore < 50 ? "text-red-700" : item.avgScore < 80 ? "text-amber-700" : "text-emerald-700")}>
                          {item.avgScore}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4 align-top pt-5 text-center">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
                        item.status === 'ผ่าน' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        item.status === 'ไม่ผ่าน' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      )}>
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          item.status === 'ผ่าน' ? 'bg-emerald-500' :
                          item.status === 'ไม่ผ่าน' ? 'bg-red-500' :
                          'bg-amber-500'
                        )} />
                        {item.status}
                      </div>
                      {item.warningCount > 0 && (
                        <div className="mt-1.5 text-[10px] font-semibold text-red-500 bg-red-50 rounded px-1.5 py-0.5 w-fit mx-auto border border-red-100">
                          สะสม {item.warningCount} เตือน
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell className="py-4 align-top pt-5 text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-white border border-slate-150 shadow-md rounded-xl p-1 z-50">
                          <Link href="/admin/tenants/eval/detail" className="w-full">
                            <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                              <Eye className="h-4 w-4 text-slate-500" />
                              <span>ดูประวัติทั้งหมด</span>
                            </DropdownMenuItem>
                          </Link>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {filteredData.length > 0 && (
          <div className="bg-slate-50/50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
            <span className="text-sm font-medium text-slate-500">
              แสดง 1 ถึง {filteredData.length} จากทั้งหมด {filteredData.length} ร้านค้า
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="default" size="sm" className="h-8 w-8 font-bold">
                1
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
