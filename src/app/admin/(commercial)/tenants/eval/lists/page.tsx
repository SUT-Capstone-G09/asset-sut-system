"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { PlusIcon, SearchIcon, FilterIcon } from "lucide-react"

export default function DashboardPage() {
    const [activeCategory, setActiveCategory] = useState("all")

    const categories = [
        { id: "all", label: "ทั้งหมด" },
        { id: "food", label: "อาหาร" },
        { id: "drink", label: "เครื่องดื่ม" },
        { id: "snack", label: "ของว่าง" },
    ]

    return (
        <div className="flex flex-col gap-6 p-8 bg-slate-50 min-h-screen">
            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Asset SUT</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>รายการประเมินผู้ประกอบการ</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">รายการประเมินผู้ประกอบการ</h1>
                <Link href="/admin/tenants/form">
                    <Button className="bg-[#f26522] hover:bg-orange-600 text-white">
                        <PlusIcon className="h-4 w-4" />เพิ่มการประเมินผู้ประกอบการ
                    </Button>
                </Link>
            </div>

            {/* Filters Section */}
            {/* <Card className="bg-white border-orange-100 shadow-sm"> */}
            <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                    {/* Category Tabs */}
                    <div className="flex gap-8">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`pb-4 text-sm font-bold transition-colors relative ${activeCategory === category.id
                                    ? "text-black"
                                    : "text-gray-500 hover:text-black"
                                    }`}
                            >
                                {category.label}
                                {activeCategory === category.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Search & Actions */}
                    <div className="flex items-center gap-4 pb-3">
                        <div className="relative w-64">
                            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="ค้นหาชื่อร้านค้า..." className="pl-9" />
                        </div>
                        <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                            <FilterIcon className="mr-2 h-4 w-4" /> ร้านที่ต่ำกว่าเกณฑ์
                        </Button>
                    </div>
                </div>
            </CardContent>
            {/* </Card> */}

            <hr className="border-slate-200" />

            {/* Table Section */}
            <Card className="bg-white border-none shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[100px]">รูปภาพ</TableHead>
                            <TableHead>ชื่อร้านค้า</TableHead>
                            <TableHead>สถานที่</TableHead>
                            <TableHead className="text-center">คะแนน (100)</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead className="text-center">ต่ำกว่าเกณฑ์</TableHead>
                            <TableHead className="text-right">การดำเนินการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Example Row 1 */}
                        <TableRow className="hover:bg-orange-50/30">
                            <TableCell>
                                <div className="w-16 h-12 bg-slate-200 rounded-md overflow-hidden">
                                    <img src="/shop-1.jpg" alt="shop" className="object-cover" />
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">ร้านส้มตำแซ่บ</TableCell>
                            <TableCell>โรงอาหารกลาง 1</TableCell>
                            <TableCell className="text-center font-bold text-black">85</TableCell>
                            <TableCell>
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">ผ่าน</span>
                            </TableCell>
                            <TableCell className="text-center font-bold text-red-600">0</TableCell>
                            <TableCell className="text-right">
                                <Link href="/admin/tenants/detail">
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
                        {/* Example Row 2 (Warning State) */}
                        <TableRow className="hover:bg-orange-50/30">
                            <TableCell>
                                <div className="w-16 h-12 bg-slate-200 rounded-md overflow-hidden"></div>
                            </TableCell>
                            <TableCell className="font-medium">ก๋วยเตี๋ยวเรืออยุธยา</TableCell>
                            <TableCell>ศูนย์อาหารริมน้ำ</TableCell>
                            <TableCell className="text-center font-bold text-red-600">45</TableCell>
                            <TableCell>
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">ไม่ผ่าน</span>
                            </TableCell>
                            <TableCell className="text-center font-bold text-red-600">8</TableCell>
                            <TableCell className="text-right">
                                <Link href="/admin/tenants/detail">
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
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}