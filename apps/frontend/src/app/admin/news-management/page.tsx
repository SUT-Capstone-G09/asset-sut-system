"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageContainer from "@/components/layout/PageContainer";
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";
import { NewsTable } from "@/features/news/components/admin/table/NewsTable";
import { NewsManagementHeader } from "@/features/news/components/admin/layout/NewsManagementHeader";
import { NewsFilterTabs, TabItem } from "@/features/news/components/admin/table/NewsFilterTabs";

const NewsManagementPage = () => {
    const [activeTab, setActiveTab] = useState("ทั้งหมด");

    const tabs: TabItem[] = [
        { id: "ทั้งหมด", label: "ทั้งหมด", count: 142 },
        { id: "สรรหาผู้เช่าพื้นที่/ร้านค้า", label: "สรรหาผู้เช่าพื้นที่/ร้านค้า", count: 45 },
        { id: "การประมูลและจำหน่ายพัสดุ", label: "การประมูลและจำหน่ายพัสดุ", count: 28 },
        { id: "งานซ่อมบำรุงและปรับปรุงพื้นที่", label: "งานซ่อมบำรุงและปรับปรุงพื้นที่", count: 19 },
        { id: "ร้านค้า", label: "ร้านค้า", count: 32 },
        { id: "ข่าวประชาสัมพันธ์ทั่วไป", label: "ข่าวประชาสัมพันธ์ทั่วไป", count: 18 },
    ];

    return (
        <div className="space-y-10 p-8">
           <NewsManagementHeader />

            {/* Filter Tabs */}
            <NewsFilterTabs 
                tabs={tabs} 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
            />

            {/* News Table Component */}
            <NewsTable activeTab={activeTab} />
        </div>
    );
};

export default NewsManagementPage;
