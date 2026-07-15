"use client";

import React, { useRef, useState, useEffect } from "react";
import { Upload, X, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  uploadFile,
  UPLOAD_FOLDERS,
  UploadFolder,
} from "@/lib/services/upload";

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: UploadFolder | string;
  error?: string;
  label?: string;
  description?: string;
  icon?: React.ReactNode;
  aspectRatio?: string; // e.g., "aspect-video", "aspect-square", "h-40 w-40 rounded-full"
  objectFit?: "object-contain" | "object-cover" | "object-fill";
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  folder = UPLOAD_FOLDERS.LOCATION_PICS,
  error,
  label = "คลิกเพื่ออัปโหลดรูปภาพ",
  description = "รองรับ JPG, PNG (สูงสุด 10MB)",
  icon,
  aspectRatio = "aspect-video",
  objectFit = "object-contain",
  className,
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
      setPreview(result.url); // Use URL for previewing only
      onChange(result.object_key); // Store object_key in DB (backend generates new URL on fetch)
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
    <div className="flex items-center justify-center w-12 h-12 rounded-md bg-orange-100 text-[#f26522] mb-4">
      <Upload className="w-6 h-6" />
    </div>
  );

  return (
    <div className={cn("w-full space-y-2", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
      />

      {preview ? (
        <div className={cn(
          "relative w-full overflow-hidden border border-slate-200 group bg-slate-50 flex items-center justify-center shadow-sm rounded-md",
          aspectRatio
        )}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className={cn(
              "w-full h-full transition-opacity duration-300",
              objectFit,
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
                className="rounded-md font-bold gap-2 shadow-lg cursor-pointer"
              >
                <RefreshCw size={14} />
                เปลี่ยนรูป
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="rounded-md font-bold gap-2 shadow-lg cursor-pointer"
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
            "border-2 border-dashed rounded-md py-12 px-6 flex flex-col items-center justify-center gap-5 transition-all cursor-pointer group shadow-sm",
            error
              ? "border-red-200 bg-red-50/30 hover:bg-red-50/50"
              : "border-slate-200 bg-slate-50 hover:bg-white hover:border-[#f26522]/30",
            aspectRatio
          )}
        >
          <div className="size-16 rounded-md flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            {uploading ? (
              <Loader2 size={32} className="text-[#f26522] animate-spin" />
            ) : (
              icon || defaultIcon
            )}
          </div>
          <div className="text-center space-y-1">
            <p
              className={cn(
                "text-base font-bold",
                error ? "text-red-600" : "text-slate-900",
              )}
            >
              {uploading ? "กำลังอัปโหลด..." : label}
            </p>
            {description && (
              <p className="text-xs text-slate-400 font-medium">
                {description}
              </p>
            )}
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
