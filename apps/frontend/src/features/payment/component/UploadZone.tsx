"use client";

import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useRef } from "react";

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
    <div className="upload-zone flex flex-col items-center justify-center p-8 m-4 rounded-2xl bg-slate-50/50 border-2 border-dashed transition-colors duration-200 hover:bg-orange-50">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="p-3 bg-orange-50 rounded-2xl text-orange-500 mb-4">
        <Upload className="w-6 h-6" />
      </div>
      <h4 className="text-md font-bold text-slate-800 mb-1">
        อัปโหลดหลักฐานการชำระเงิน
      </h4>
      <p className="text-md text-slate-400 text-center mb-6">
        หลักโหลดไฟล์ JPG, PNG or PDF และขนาดไฟล์ไม่เกิน 5MB.
      </p>
      <Button
        onClick={handleButtonClick}
        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-semibold shadow-md shadow-orange-500/20"
      >
        เลือกไฟล์
      </Button>
    </div>
  );
}
