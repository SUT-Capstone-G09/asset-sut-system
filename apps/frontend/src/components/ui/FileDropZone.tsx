"use client";

import React from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  file: File | null;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  className?: string;
  accept?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  fileTypeLabel?: string;
}

export function FileDropZone({
  file,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onRemove,
  className,
  accept = ".pdf",
  title = "คลิกเพื่อเลือกไฟล์ หรือลากเอกสารมาวางที่นี่",
  description = "รองรับเฉพาะเอกสารรูปแบบ PDF ขนาดไม่เกิน 10MB ต่อไฟล์",
  fileTypeLabel = "PDF",
}: FileDropZoneProps) {
  return (
    <label
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "relative flex flex-col items-center justify-center min-h-[220px]",
        "rounded-md border-2 border-dashed cursor-pointer transition-all duration-200",
        isDragging
          ? "border-orange-400 bg-orange-50"
          : file
          ? "border-emerald-300 bg-emerald-50/40 cursor-default"
          : "border-slate-200 bg-slate-50/60 hover:border-orange-300 hover:bg-orange-50/20",
        className
      )}
    >
      {/* Hidden file input — whole label is the click target */}
      <input
        type="file"
        className="hidden"
        accept={accept}
        onChange={onFileChange}
        onClick={(e) => e.stopPropagation()}
      />

      {/* ── File selected state ── */}
      {file ? (
        <div className="flex flex-col items-center text-center px-6 py-8 gap-4">
          {/* PDF icon (same SVG as file-dropzone.tsx) + checkmark badge */}
          <div className="relative inline-flex">
            <svg
              viewBox="0 0 48 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-20 h-24 drop-shadow-sm"
            >
              <rect width="48" height="56" rx="6" fill="#EEF0FF" />
              <path d="M32 2L46 16H32V2Z" fill="#C7CBFF" />
              <path
                d="M32 2H8C5.8 2 4 3.8 4 6v44c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V16L32 2Z"
                fill="#C7CBFF"
                fillOpacity="0.4"
              />
              <text x="7" y="44" fontFamily="Arial" fontSize="11" fontWeight="bold" fill="#6366f1">
                {fileTypeLabel}
              </text>
            </svg>
            {/* Checkmark badge */}
            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 12 12" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,6 5,9 10,3" />
              </svg>
            </div>
          </div>

          {/* Filename + size */}
          <div>
            <p className="text-sm font-semibold text-slate-800 max-w-[240px] truncate">
              {file.name}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {(file.size / 1024 / 1024).toFixed(2)} MB &bull; {fileTypeLabel}
            </p>
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
            className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline"
          >
            <X size={12} />
            ลบไฟล์และเลือกใหม่
          </button>
        </div>


      ) : (
        /* ── Empty / dragging state ── */
        <div className="flex flex-col items-center text-center px-10 py-10">
          {/* Orange rounded square icon */}
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4 text-orange-500">
            <Upload size={24} strokeWidth={2.5} />
          </div>
          <h4 className="text-base font-bold text-slate-800 mb-1.5">
            {title}
          </h4>
          <p className="text-sm text-slate-400">
            {description}
          </p>
        </div>
      )}
    </label>
  );
}
