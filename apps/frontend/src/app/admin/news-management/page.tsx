"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageContainer from "@/components/layout/PageContainer";
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";
import { NewsTable } from "@/features/news/components/admin/NewsTable";
import { NewsManagementHeader } from "@/features/news/components/admin/NewsManagementHeader";
import { NewsFilterTabs, TabItem } from "@/features/news/components/admin/NewsFilterTabs";

const NewsManagementPage = () => {
    const [activeTab, setActiveTab] = useState("ทั้งหมด");

    const tabs: TabItem[] = [
        { id: "ทั้งหมด", label: "ทั้งหมด", count: 142 },
        { id: "ประกาศสินทรัพย์", label: "ประกาศสินทรัพย์", count: 45 },
        { id: "ข่าวรับสมัครร้านค้า", label: "ข่าวรับสมัครร้านค้า", count: 68 },
        { id: "กิจกรรมมหาวิทยาลัย", label: "กิจกรรมมหาวิทยาลัย", count: 29 },
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
            <NewsTable />
        </div>
    );
};

export default NewsManagementPage;
