"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Image as ImageIcon, ZoomIn, Upload, Loader2 } from "lucide-react";
import { uploadFile, UPLOAD_FOLDERS } from "@/lib/services/upload";
import { cn } from "@/lib/utils";
import LightboxModal from "./LightboxModal";

interface InteractiveGalleryProps {
  primaryImage: string;
  images?: any[];
  onImageUploaded?: (newImageUrl: string) => void;
}

export default function InteractiveGallery({
  primaryImage,
  images = [],
  onImageUploaded,
}: InteractiveGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeImg, setActiveImg] = useState<string>(primaryImage);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Sync activeImg when primaryImage updates
  useEffect(() => {
    setActiveImg(primaryImage);
  }, [primaryImage]);

  // Extract URLs from images list or use fallback mock images
  const galleryImages = images.length > 0
    ? images.map((img: any) => img.URL || img.url)
    : [
        primaryImage,
        "https://beta.sut.ac.th/damt/wp-content/uploads/sites/189/2021/01/1-3.jpg",
        "https://lh3.googleusercontent.com/pw/AP1GczMGwZjKiuSSjheARj_maqQpi1EyPVvPQ6T2AxpFzT5gwXw-UZiESV390VeDfKz9v5pqASaAUucc9IpNs2MjFJ9quJLAnA7AkZ4cBt1Ij-EhwEy3PGxLWfCRMg5rYOZOjxzbf3-3hR_3MQRYR8Ac8Mtq=w1036-h869-s-no-gm?authuser=0",
      ].filter(Boolean);

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Connect with actual S3 upload service
      const result = await uploadFile(file, UPLOAD_FOLDERS.LOCATION_PICS);
      setActiveImg(result.url);
      
      if (onImageUploaded) {
        onImageUploaded(result.url);
      }
    } catch (err) {
      console.error("Failed to upload space image:", err);
      // Fallback local preview on error for testing UX
      const localUrl = URL.createObjectURL(file);
      setActiveImg(localUrl);
    } finally {
      setUploading(false);
    }
  };

  // Helper to check if Next Image should be unoptimized (prevents config domain errors on dynamic mock images)
  const shouldBeUnoptimized = (url: string) => {
    return url.startsWith("blob:") || url.startsWith("data:") || !url.includes("s3") && !url.includes("localhost");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Left: Big Active View Container */}
      <div
        onClick={() => setIsLightboxOpen(true)}
        className="md:col-span-2 relative rounded-[7px] overflow-hidden aspect-video bg-slate-100 group border border-slate-200/60 shadow-sm cursor-zoom-in"
      >
        {activeImg ? (
          <Image
            src={activeImg}
            alt="Active preview"
            fill
            sizes="(max-width: 768px) 100vw, 66vw"
            unoptimized={shouldBeUnoptimized(activeImg)}
            className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
            priority
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <ImageIcon size={32} />
            <span className="text-xs">ไม่มีรูปภาพ</span>
          </div>
        )}

        {/* Fade Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />

        {/* Top Banner Tag */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black text-white bg-slate-900/60 backdrop-blur-md rounded border border-white/10 uppercase tracking-widest">
            <ImageIcon size={10} className="text-[#f26522]" />
            {activeImg === primaryImage ? "รูปภาพหลัก" : "รูปภาพประกอบ"}
          </span>
        </div>

        {/* Center Magnify Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="size-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-lg shadow-black/10 scale-95 group-hover:scale-100 transition-transform duration-300">
            <ZoomIn size={18} strokeWidth={2.5} />
          </div>
        </div>

        {/* Bottom detail text */}
        <div className="absolute bottom-3 left-3 text-white">
          <p className="text-[10px] opacity-75 font-semibold">คลิกเพื่อดูรูปภาพขนาดใหญ่</p>
        </div>
      </div>

      {/* Right: Thumbnails Side Panel */}
      <div className="grid grid-cols-2 grid-rows-2 gap-3 h-full min-h-[160px] md:min-h-0">
        {galleryImages.map((imgUrl: string, index: number) => {
          const isActive = activeImg === imgUrl;
          return (
            <button
              key={index}
              type="button"
              onClick={() => setActiveImg(imgUrl)}
              className={cn(
                "relative rounded-[7px] overflow-hidden bg-slate-50 border transition-all duration-200 outline-none select-none hover:scale-[1.02] active:scale-95 shadow-sm w-full h-full",
                isActive
                  ? "border-[#f26522] ring-2 ring-[#f26522]/15 scale-[1.02]"
                  : "border-slate-200/50 hover:border-[#f26522]/40"
              )}
            >
              <Image
                src={imgUrl}
                alt={`gallery thumbnail ${index}`}
                fill
                sizes="(max-width: 768px) 50vw, 15vw"
                unoptimized={shouldBeUnoptimized(imgUrl)}
                className={cn(
                  "object-cover transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                )}
              />
            </button>
          );
        })}

        {/* Upload Button or Shimmer Skeleton */}
        <button
          type="button"
          onClick={handleFileUploadClick}
          disabled={uploading}
          className="rounded-[7px] border-2 border-dashed border-slate-200 hover:border-[#f26522]/30 hover:bg-[#f26522]/5 text-slate-400 hover:text-[#f26522] flex flex-col items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 w-full h-full relative"
        >
          {uploading ? (
            <div className="absolute inset-0 bg-slate-50/50 flex flex-col items-center justify-center gap-2 rounded-[7px]">
              <Loader2 size={20} className="animate-spin text-[#f26522]" />
              <span className="text-[9px] font-black text-slate-400 animate-pulse">UPLOADING...</span>
            </div>
          ) : (
            <>
              <Upload size={16} strokeWidth={2.5} />
              <span className="text-[9px] font-black uppercase tracking-wider">เพิ่มรูป</span>
            </>
          )}
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageSrc={activeImg}
      />
    </div>
  );
}
