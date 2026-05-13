import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { NewsBasicInfo } from "./NewsBasicInfo";
import { NewsContractInfo } from "./NewsContractInfo";
import { NewsUploads } from "./NewsUploads";

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
    details: "",
    qualifications: "",
    documents: "",
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
        details: selectedNews.details || "",
        qualifications: selectedNews.qualifications || "",
        documents: selectedNews.documents || "",
      });
      setContractData({
        contractDuration: selectedNews.contractDuration || "",
        areaSize: selectedNews.areaSize || "",
        entranceFee: selectedNews.entranceFee || "",
      });
    }
  }, [selectedNews]);

  const handleBasicChange = (field: string, value: string) => {
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
              <NewsUploads />
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
