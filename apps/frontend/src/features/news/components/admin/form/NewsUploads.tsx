"use client";

import React from "react";
import { Image as ImageIcon, FileText } from "lucide-react";
import { NewsFileCard } from "./NewsFileCard";

interface NewsUploadsProps {
  mainImagePreview: string | null;
  mainImageName: string | null;
  mainImageSize: number | null;
  attachedFiles: { file: File; id: string }[];
  onChange: (field: string, value: unknown) => void;
}

export function NewsUploads({
  mainImagePreview,
  mainImageName,
  mainImageSize,
  attachedFiles,
  onChange,
}: NewsUploadsProps) {

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onChange("mainImageName", file.name);
      onChange("mainImageSize", file.size);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange("mainImagePreview", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        id: Math.random().toString(36).substring(7),
      }));
      onChange("attachedFiles", [...attachedFiles, ...newFiles]);
    }
  };

  const removePdfFile = (id: string) => {
    onChange("attachedFiles", attachedFiles.filter((item) => item.id !== id));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-4">
      {/* ภาพหลัก */}
      <div className="space-y-3">
        <div className="text-sm font-bold text-zinc-700">รูปภาพหลักของประกาศ</div>
        {mainImagePreview && mainImageName && mainImageSize !== null ? (
          <NewsFileCard
            name={mainImageName}
            size={mainImageSize}
            type="image"
            previewUrl={mainImagePreview}
            onRemove={() => {
              onChange("mainImageName", null);
              onChange("mainImageSize", null);
              onChange("mainImagePreview", null);
            }}
          />
        ) : (
          <div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <label
              htmlFor="image-upload"
              className="border-2 border-dashed border-zinc-300 hover:border-brand-primary/50 hover:bg-zinc-50/50 transition-all rounded-xl p-4 flex items-center gap-4 cursor-pointer bg-white w-full"
            >
              <div className="w-16 h-16 rounded-lg bg-zinc-50 flex items-center justify-center flex-shrink-0 border border-zinc-200">
                <ImageIcon className="w-8 h-8 text-zinc-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-zinc-800">อัปโหลดรูปภาพหลัก (JPG, PNG)</div>
                <div className="text-xs text-zinc-400">คลิกเพื่อเลือกไฟล์รูปภาพหลัก</div>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* ไฟล์ PDF (เพิ่มได้หลายไฟล์) */}
      <div className="space-y-3">
        <div className="text-sm font-bold text-zinc-700">เอกสารประกอบ/ประกาศฉบับเต็ม</div>
        
        {/* แสดงรายการไฟล์ PDF ที่อัปโหลดแล้ว (แสดงด้านบน) */}
        {attachedFiles.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {attachedFiles.map((item) => (
              <NewsFileCard
                key={item.id}
                name={item.file.name}
                size={item.file.size}
                type="pdf"
                onRemove={() => removePdfFile(item.id)}
              />
            ))}
          </div>
        )}

        {/* ช่องสำหรับคลิกเพื่อเพิ่มไฟล์ (แสดงด้านล่าง) */}
        <div>
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={handlePdfChange}
          />
          <label
            htmlFor="pdf-upload"
            className="border-2 border-dashed border-zinc-300 hover:border-brand-primary/50 hover:bg-zinc-50/50 transition-all rounded-xl p-4 flex items-center gap-4 cursor-pointer bg-white w-full"
          >
            <div className="w-16 h-16 rounded-lg bg-zinc-50 flex items-center justify-center flex-shrink-0 border border-zinc-200">
              <FileText className="w-8 h-8 text-zinc-400" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-zinc-800">คลิกเพื่อเพิ่มไฟล์ PDF</div>
              <div className="text-xs text-zinc-400">เลือกทีละไฟล์ หรือ หลายไฟล์พร้อมกัน</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
