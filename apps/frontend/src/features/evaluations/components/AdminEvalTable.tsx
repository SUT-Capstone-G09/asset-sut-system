"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { SearchIcon, FilterIcon } from "lucide-react"
import { mockEvaluations, evalCategories, evalTableHeaders } from "@/features/evaluations/data/mock-evals"
import { cn } from "@/lib/utils"

export function AdminEvalTable() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredData = useMemo(() => {
        return mockEvaluations.filter(item => {
            const matchesCategory = activeCategory === "all" || item.category === activeCategory;
            const matchesSearch = item.storeName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchTerm]);

    return (
        <>
            <CardContent className="px-0">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200">
                    {/* Category Tabs */}
                    <div className="flex">
                        {evalCategories.map((category) => {
                            const count = mockEvaluations.filter(e => category.id === "all" || e.category === category.id).length;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-semibold transition-colors",
                                        activeCategory === category.id
                                            ? "border-b-2 border-[#E9652B] text-[#E9652B]"
                                            : "border-b-2 border-transparent text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {category.label}
                                    <span 
                                        className={cn(
                                            "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold transition-colors",
                                            activeCategory === category.id 
                                            ? "bg-[#E9652B] text-white" 
                                            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                                        )}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search & Actions */}
                    <div className="flex items-center gap-4 pb-3">
                        <div className="relative w-64">
                            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="ค้นหาชื่อร้านค้า..." 
                                className="pl-9" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                            <FilterIcon className="mr-2 h-4 w-4" /> ร้านที่ต่ำกว่าเกณฑ์
                        </Button>
                    </div>
                </div>
            </CardContent>

            {/* Table Section */}
            <Card className="bg-white p-0 border-none shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            {evalTableHeaders.map((header) => (
                                <TableHead key={header.id} className={header.className}>
                                    {header.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredData.map((item) => (
                            <TableRow key={item.id} className="hover:bg-orange-50/30">
                                <TableCell>
                                    <div className="w-16 h-12 bg-slate-200 rounded-md overflow-hidden">
                                        {item.image ? (
                                            <img src={item.image} alt={item.storeName} className="object-cover w-full h-full" />
                                        ) : null}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{item.storeName}</TableCell>
                                <TableCell>{item.location}</TableCell>
                                <TableCell className={`text-center font-bold ${item.score < 50 ? 'text-red-600' : 'text-black'}`}>
                                    {item.score}
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'ผ่าน' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {item.status}
                                    </span>
                                </TableCell>
                                <TableCell className={`text-center font-bold ${item.warningCount > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                    {item.warningCount}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href="/admin/tenants/eval/detail">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                                        >
                                            ดูรายละเอียด
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </>
    )
}
