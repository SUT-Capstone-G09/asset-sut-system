import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { History, Pencil, Trash2, ChevronLeft, ChevronRight, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
import { NewsEditModal } from "../modals/NewsEditModal";
import { NewsDeleteModal } from "../modals/NewsDeleteModal";

interface NewsTableProps {
  activeTab?: string;
}

export const NewsTable = ({ activeTab = "ทั้งหมด" }: NewsTableProps) => {
  const router = useRouter();
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

  const filteredNews = activeTab === "ทั้งหมด"
    ? MOCK_NEWS
    : MOCK_NEWS.filter((news) => news.category === activeTab);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[40%] text-gray-600 font-semibold py-4">หัวข้อข่าว</TableHead>
              <TableHead className="w-[13%] text-gray-600 font-semibold py-4">หมวดหมู่</TableHead>
              <TableHead className="w-[13%] text-gray-600 font-semibold py-4">วันที่อัปเดต</TableHead>
              <TableHead className="w-[12%] text-gray-600 font-semibold py-4">ยอดเข้าชม</TableHead>
              <TableHead className="w-[12%] text-gray-600 font-semibold py-4">สถานะ</TableHead>
              <TableHead className="text-right text-gray-600 font-semibold py-4 pr-6">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNews.map((news) => (
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
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                    <span>{news.views.toLocaleString()}</span>
                  </div>
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
                    {news.status === 'Published' ? 'เผยแพร่แล้ว' :
                     news.status === 'Draft' ? 'แบบร่าง' :
                     'เก็บถาวร'}
                  </div>
                </TableCell>
                <TableCell className="py-4 text-right pr-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-white border border-gray-150 shadow-md rounded-xl p-1 z-50">
                      {/* View Details Option */}
                      <DropdownMenuItem 
                        onClick={() => router.push(`/admin/news-management/${news.id}`)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <Eye className="h-4 w-4 text-gray-500" />
                        <span>ดูรายละเอียด</span>
                      </DropdownMenuItem>

                      {/* Edit Option */}
                      {news.status !== 'Archived' ? (
                        <DropdownMenuItem 
                          onClick={() => handleEditClick(news)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <Pencil className="h-4 w-4 text-gray-500" />
                          <span>แก้ไข</span>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          title="Restore"
                        >
                          <History className="h-4 w-4 text-gray-500" />
                          <span>คืนค่า</span>
                        </DropdownMenuItem>
                      )}

                      {/* Delete Option */}
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(news)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span>ลบ</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
          <Button variant="default" size="sm" className="h-8 w-8 bg-brand-primary hover:bg-brand-primary/90 text-white">
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
