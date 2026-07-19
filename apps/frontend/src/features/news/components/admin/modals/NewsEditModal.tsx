"use client";

import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Pencil, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NewsBasicInfo } from "../form/NewsBasicInfo";
import { NewsContractInfo } from "../form/NewsContractInfo";
import { NewsUploads } from "../form/NewsUploads";
import { toast } from "sonner";

interface NewsEditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNews: any | null;
}

export const NewsEditModal: React.FC<NewsEditModalProps> = ({
  isOpen,
  onOpenChange,
  selectedNews,
}) => {
  const [basicData, setBasicData] = useState({
    title: "",
    category: "",
    referenceId: "",
    selectedAsset: "",
    scheduleEnabled: false,
    isFeatured: false,
    startDate: "",
    endDate: "",
    resultTimeline: "",
    qualifications: [] as { id: string; text: string }[],
    documents: [] as { id: string; name: string; isPreset: boolean; checked?: boolean }[],
    mainImagePreview: null as string | null,
    mainImageName: null as string | null,
    mainImageSize: null as number | null,
    attachedFiles: [] as { file: File; id: string }[],
  });

  const [contractData, setContractData] = useState({
    contractDuration: "",
    areaSize: "",
    entranceFee: "",
  });

  useEffect(() => {
    if (selectedNews) {
      setBasicData({
        title: selectedNews.title || "",
        category: selectedNews.category || "",
        referenceId: selectedNews.referenceId || "",
        selectedAsset: selectedNews.selectedAsset || "",
        scheduleEnabled: selectedNews.scheduleEnabled ?? false,
        isFeatured: selectedNews.isFeatured ?? false,
        startDate: selectedNews.startDate || "",
        endDate: selectedNews.endDate || "",
        resultTimeline: selectedNews.resultTimeline || "",
        qualifications: selectedNews.qualifications || [],
        documents: selectedNews.documents || [],
        mainImagePreview: selectedNews.mainImagePreview || null,
        mainImageName: selectedNews.mainImageName || null,
        mainImageSize: selectedNews.mainImageSize || null,
        attachedFiles: selectedNews.attachedFiles || [],
      });
      setContractData({
        contractDuration: selectedNews.contractDuration || "",
        areaSize: selectedNews.areaSize || "",
        entranceFee: selectedNews.entranceFee || "",
      });
    }
  }, [selectedNews]);

  const handleBasicChange = (field: string, value: unknown) => {
    setBasicData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContractChange = (field: string, value: string) => {
    setContractData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    toast.success("บันทึกการแก้ไขเรียบร้อยแล้ว!");
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-[640px] p-0 border-none bg-white flex flex-col h-full shadow-2xl"
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-radix-portal]")) {
            e.preventDefault();
          }
        }}
      >
        <SheetHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-[7px] bg-brand-primary/10 flex items-center justify-center">
              <Pencil size={20} className="text-brand-primary" strokeWidth={2.5} />
            </div>
            
            <div>
              <SheetTitle className="text-xl font-bold text-slate-900 tracking-tight line-clamp-1">
                {selectedNews ? selectedNews.title : "แก้ไขข่าวสาร / ประกาศ"}
              </SheetTitle>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                กำลังแก้ไขข่าวสาร / ประกาศ
              </p>
            </div>

            <SheetDescription className="sr-only">
              ฟอร์มสำหรับแก้ไขข่าวสารและประกาศ
            </SheetDescription>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="size-9 rounded-[7px] bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center group"
          >
            <X size={18} className="transition-transform group-hover:rotate-90" />
          </button>
        </SheetHeader>

        {selectedNews && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            <div className="flex flex-col gap-6">
              <NewsBasicInfo data={basicData} onChange={handleBasicChange} />
            </div>
            
            <NewsContractInfo data={contractData} onChange={handleContractChange} />
            
            <div className="space-y-3">
              <Label className="text-base font-bold">เอกสารและรูปภาพแนบ</Label>
              <NewsUploads
                mainImagePreview={basicData.mainImagePreview}
                mainImageName={basicData.mainImageName}
                mainImageSize={basicData.mainImageSize}
                attachedFiles={basicData.attachedFiles}
                onChange={handleBasicChange}
              />
            </div>
          </div>
        )}

        {/* Sticky Footer */}
        <div className="px-6 py-5 border-t border-slate-100 flex items-center gap-4 bg-white/90 backdrop-blur-md shrink-0">
          <Button 
            type="button"
            variant="secondary" 
            onClick={() => onOpenChange(false)} 
            className="flex-1 h-12 rounded-[7px] font-bold transition-all"
          >
            ยกเลิก
          </Button>

          <Button 
            type="button"
            variant="default"
            onClick={handleSave}
            className="flex-1 h-12 rounded-[7px] font-bold text-white shadow-lg shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
          >
            <Save size={18} />
            บันทึกการแก้ไข
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
