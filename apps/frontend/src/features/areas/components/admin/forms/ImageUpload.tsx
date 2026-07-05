"use client";

import React, { useRef, useState, useEffect } from "react";
import { UploadCloud, X, RefreshCw, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  uploadFile,
  UPLOAD_FOLDERS,
  UploadFolder,
} from "@/lib/services/upload";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: UploadFolder | string;
  error?: string;
  label?: string;
  icon?: React.ReactNode;
}

export default function ImageUpload({
  value,
  onChange,
  folder = UPLOAD_FOLDERS.LOCATION_PICS,
  error,
  label = "คลิกเพื่ออัปโหลดรูปภาพ",
  icon,
}: ImageUploadProps) {
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
      const result = await uploadFile(file, folder);
      URL.revokeObjectURL(localUrl);
      setPreview(result.url); // ใช้ URL สำหรับ preview เท่านั้น
      onChange(result.object_key); // เก็บ object_key ลง DB (backend จะ generate URL ใหม่ตอน fetch)
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

  const defaultIcon = (
    <Upload size={28} className="text-[#f26522]" />
  );

  return (
    <div className="w-full space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
      />

      {preview ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 group bg-slate-50 flex items-center justify-center shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className={cn(
              "object-contain w-full h-full transition-opacity duration-300",
              uploading ? "opacity-50 blur-sm" : "opacity-100 group-hover:opacity-90"
            )}
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={32} className="text-[#f26522] animate-spin drop-shadow-md" />
            </div>
          )}
          {!uploading && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg font-bold gap-2 shadow-lg"
              >
                <RefreshCw size={14} />
                เปลี่ยนรูป
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="rounded-lg font-bold gap-2 shadow-lg"
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
            "border-2 border-dashed rounded-2xl py-12 px-6 flex flex-col items-center justify-center gap-5 transition-all cursor-pointer group shadow-sm",
            error
              ? "border-red-200 bg-red-50/50 hover:bg-red-50"
              : "border-slate-200 bg-slate-50/80 hover:bg-slate-100/50 hover:border-[#f26522]/40"
          )}
        >
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
            {uploading ? (
              <Loader2 size={28} className="text-[#f26522] animate-spin" />
            ) : (
              icon || defaultIcon
            )}
          </div>
          <div className="text-center space-y-1.5">
            <p
              className={cn(
                "text-[15px] font-bold tracking-tight transition-colors",
                error ? "text-red-600" : "text-slate-800 group-hover:text-[#f26522]"
              )}
            >
              {uploading ? "กำลังอัปโหลด..." : label}
            </p>
            <p className="text-[13px] text-slate-400 font-medium">
              รองรับ JPG, PNG (สูงสุด 10MB)
            </p>
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
