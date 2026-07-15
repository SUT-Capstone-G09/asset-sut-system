"use client";

import React from "react";
import { X } from "lucide-react";

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
}

export default function LightboxModal({
  isOpen,
  onClose,
  imageSrc,
}: LightboxModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        type="button"
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all border border-white/10"
        onClick={onClose}
      >
        <X size={20} />
      </button>

      {/* Full Image */}
      <div
        className="relative max-w-[90%] max-h-[85vh] overflow-hidden rounded-[7px] border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt="Fullscreen gallery preview"
          className="object-contain max-h-[85vh] max-w-full rounded-[7px]"
        />
      </div>

      <p className="text-white/60 text-xs font-semibold mt-4">
        คลิกพื้นที่ใดก็ได้เพื่อปิดหน้าจอ
      </p>
    </div>
  );
}
