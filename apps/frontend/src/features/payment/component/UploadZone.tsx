"use client";

import { Button } from "@/components/ui/button";
import { Upload, FileUp } from "lucide-react";
import { useRef } from "react";
import { SectionHeader } from "./SectionHeader";

export function UploadZone() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      console.log("Selected file:", file.name, file.type, file.size);
      // สามารถจัดการไฟล์ที่เลือกได้ที่นี่
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <SectionHeader
        icon={<FileUp size={14} />}
        label="อัปโหลดหลักฐานการชำระเงิน"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="mt-4 flex flex-col items-center justify-center p-8 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 transition-colors duration-200 hover:border-brand-primary/30 hover:bg-orange-50">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 text-brand-primary mb-4">
          <Upload className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-gray-800 mb-1">
          อัปโหลดหลักฐานการชำระเงิน
        </h4>
        <p className="text-xs text-gray-400 text-center mb-6">
          รองรับไฟล์ JPG, PNG หรือ PDF ขนาดไม่เกิน 5MB
        </p>
        <Button
          onClick={handleButtonClick}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold h-12 px-6 rounded-xl"
        >
          เลือกไฟล์
        </Button>
      </div>
    </section>
  );
}
