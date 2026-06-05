"use client"

import React, { useRef, useState, useEffect } from "react";
import { UploadCloud, X, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/lib/services/upload";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function ImageUpload({ value, onChange, error }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);
    setUploadError(null);

    try {
      const result = await uploadFile(file, "images");
      URL.revokeObjectURL(localUrl);
      setPreview(result.url);
      onChange(result.url);
    } catch (err) {
      URL.revokeObjectURL(localUrl);
      setPreview(null);
      setUploadError("อัปโหลดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setUploadError(null);
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {preview ? (
        <div className="relative group aspect-video rounded-[7px] overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 text-white text-sm font-bold">
              <Loader2 size={20} className="animate-spin" />
              กำลังอัปโหลด...
            </div>
          )}

          {!uploading && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-[7px] font-bold gap-2"
              >
                <RefreshCw size={14} />
                เปลี่ยนรูป
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="rounded-[7px] font-bold gap-2"
              >
                <X size={14} />
                ลบรูป
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-[7px] p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group shadow-inner",
            error
              ? "border-red-200 bg-red-50/30 hover:bg-red-50/50"
              : "border-slate-200 bg-slate-50 hover:bg-white hover:border-[#f26522]/30"
          )}
        >
          <div className="size-16 rounded-[7px] bg-white shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            {uploading
              ? <Loader2 size={32} className="text-[#f26522] animate-spin" />
              : <UploadCloud size={32} className={cn(error ? "text-red-400" : "text-[#f26522]")} />
            }
          </div>
          <div className="text-center space-y-1">
            <p className={cn("text-base font-bold", error ? "text-red-600" : "text-slate-900")}>
              {uploading ? "กำลังอัปโหลด..." : "คลิกเพื่ออัปโหลดรูปภาพ"}
            </p>
            <p className="text-xs text-slate-400 font-medium">รองรับ JPG, PNG (สูงสุด 10MB)</p>
          </div>
        </div>
      )}

      {(error || uploadError) && (
        <p className="text-[10px] font-bold text-red-500 ml-1 flex items-center gap-1">
          <X size={10} /> {uploadError ?? error}
        </p>
      )}
    </div>
  );
}
