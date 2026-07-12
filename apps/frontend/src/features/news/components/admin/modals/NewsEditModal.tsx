"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NewsBasicInfo } from "../form/NewsBasicInfo";
import { NewsContractInfo } from "../form/NewsContractInfo";
import { NewsUploads } from "../form/NewsUploads";

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] mt-14 overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>แก้ไขข่าวสาร / ประกาศ</DialogTitle>
        </DialogHeader>
        {selectedNews && (
          <div className="grid gap-8 py-4">
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button className="bg-[#C2410C] hover:bg-[#9a330a] text-white">บันทึกข้อมูล</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
