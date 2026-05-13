import React, { useState } from "react";
import { History, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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
import { MOCK_NEWS } from "@/features/news/data/mocknews";
import { NewsEditModal } from "@/features/news/components/admin/NewsEditModal";
import { NewsDeleteModal } from "@/features/news/components/admin/NewsDeleteModal";

export const NewsTable = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any>(null);

  const handleEditClick = (news: any) => {
    setSelectedNews(news);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (news: any) => {
    setSelectedNews(news);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[45%] text-gray-600 font-semibold py-4">หัวข้อข่าว</TableHead>
              <TableHead className="w-[15%] text-gray-600 font-semibold py-4">หมวดหมู่</TableHead>
              <TableHead className="w-[15%] text-gray-600 font-semibold py-4">วันที่อัปเดต</TableHead>
              <TableHead className="w-[15%] text-gray-600 font-semibold py-4">สถานะ</TableHead>
              <TableHead className="text-right text-gray-600 font-semibold py-4 pr-6">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_NEWS.map((news) => (
              <TableRow key={news.id} className="hover:bg-gray-50/50 transition-colors group">
                <TableCell className="py-4">
                  <div className="flex gap-4 items-center">
                    <div className={`w-14 h-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 ${news.status === 'Archived' ? 'grayscale opacity-70' : ''}`}>
                      <img
                        src={news.imageUrl}
                        alt={news.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-semibold text-[15px] ${news.status === 'Archived' ? 'text-gray-400' : 'text-gray-900'}`}>
                        {news.title}
                      </span>
                      <span className="text-gray-500 text-xs mt-1">รหัสประกาศ: {news.id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge 
                    variant="secondary" 
                    className={`font-normal ${
                      news.category === 'Asset' ? 'bg-[#FFE4D6] text-[#C2410C] hover:bg-[#FFE4D6]' : 
                      'bg-[#FFE4D6] text-[#C2410C] hover:bg-[#FFE4D6]'
                    }`}
                  >
                    {news.category}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-gray-600 text-sm">
                  {news.date}
                </TableCell>
                <TableCell className="py-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium ${
                    news.status === 'Published' ? 'bg-green-100 text-green-700' :
                    news.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      news.status === 'Published' ? 'bg-green-500' :
                      news.status === 'Draft' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`} />
                    {news.status}
                  </div>
                </TableCell>
                <TableCell className="py-4 text-right pr-6">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {news.status === 'Archived' ? (
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors" title="Restore">
                        <History className="h-4 w-4" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleEditClick(news)}
                        className="p-1.5 text-gray-400 hover:text-[#C2410C] rounded-md hover:bg-orange-50 transition-colors" 
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteClick(news)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors" 
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
          แสดง 1 ถึง 10 จากทั้งหมด 142 รายการ
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="default" size="sm" className="h-8 w-8 bg-[#C2410C] hover:bg-[#9a330a] text-white">
            1
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 text-gray-600">
            2
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 text-gray-600">
            3
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Modal Component */}
      <NewsEditModal 
        isOpen={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen} 
        selectedNews={selectedNews} 
      />

      {/* Delete Confirm Modal Component */}
      <NewsDeleteModal 
        isOpen={isDeleteModalOpen} 
        onOpenChange={setIsDeleteModalOpen} 
        selectedNews={selectedNews} 
      />
    </div>
  );
};
