"use client";

import React, { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// SVG Icons (inline — no extra deps)
// ---------------------------------------------------------------------------

function PdfIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="48" height="56" rx="6" fill="#EEF0FF" />
      <path d="M32 2L46 16H32V2Z" fill="#C7CBFF" />
      <path
        d="M32 2H8C5.8 2 4 3.8 4 6v44c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V16L32 2Z"
        fill="#C7CBFF"
        fillOpacity="0.4"
      />
      <text x="7" y="44" fontFamily="Arial" fontSize="11" fontWeight="bold" fill="#6366f1">
        PDF
      </text>
    </svg>
  );
}

function GenericFileIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="48" height="56" rx="6" fill="#EEF0FF" />
      <path d="M32 2L46 16H32V2Z" fill="#C7CBFF" />
      <rect x="10" y="26" width="8" height="8" rx="1" fill="#6366f1" />
      <rect x="20" y="26" width="8" height="8" rx="1" fill="#6366f1" />
      <rect x="30" y="26" width="8" height="8" rx="1" fill="#6366f1" />
      <rect x="10" y="36" width="8" height="8" rx="1" fill="#6366f1" />
      <rect x="20" y="36" width="8" height="8" rx="1" fill="#6366f1" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// FileCard — one card per file
// ---------------------------------------------------------------------------

interface FileCardProps {
  file: File;
  onRemove: () => void;
}

function FileCard({ file, onRemove }: FileCardProps) {
  const isPdf = file.name.toLowerCase().endsWith(".pdf");

  return (
    <div className="group relative flex flex-col items-center p-3 bg-white rounded-[7px] border border-slate-200 shadow-sm hover:shadow-md transition-all">
      {/* Remove button — visible on hover */}
      <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-6 h-6 flex items-center justify-center rounded-md bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
        >
          <X size={12} />
        </button>
      </div>

      {/* File icon */}
      <div className="w-12 h-14 mb-2 flex items-end justify-center">
        {isPdf ? (
          <PdfIcon className="w-full h-full" />
        ) : (
          <GenericFileIcon className="w-full h-full" />
        )}
      </div>

      {/* File info */}
      <p className="text-[11px] text-slate-600 font-medium text-center leading-tight line-clamp-2 break-all w-full">
        {file.name}
      </p>
      <p className="text-[10px] text-slate-400 mt-0.5">
        {(file.size / 1024 / 1024).toFixed(2)} MB
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ExistingFile — represents a file already saved on the server
// ---------------------------------------------------------------------------

export interface ExistingFile {
  id: string;
  name: string;
  sizeBytes?: number;
  url?: string;
}

interface ExistingFileCardProps {
  file: ExistingFile;
  onRemove: () => void;
}

function ExistingFileCard({ file, onRemove }: ExistingFileCardProps) {
  const isPdf = file.name.toLowerCase().endsWith(".pdf");

  return (
    <div className="group relative flex flex-col items-center p-3 bg-white rounded-[7px] border border-slate-200 shadow-sm hover:shadow-md transition-all">
      {/* Cloud badge — marks file as already uploaded */}
      <div className="absolute top-2 left-2">
        <span className="text-[9px] font-bold text-sky-500 bg-sky-50 border border-sky-100 rounded px-1 py-0.5 leading-none">
          บันทึกแล้ว
        </span>
      </div>

      {/* Remove button */}
      <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-6 h-6 flex items-center justify-center rounded-md bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
        >
          <X size={12} />
        </button>
      </div>

      {/* File icon */}
      <div className="w-12 h-14 mt-3 mb-2 flex items-end justify-center">
        {isPdf ? (
          <PdfIcon className="w-full h-full" />
        ) : (
          <GenericFileIcon className="w-full h-full" />
        )}
      </div>

      {/* File info */}
      <p className="text-[11px] text-slate-600 font-medium text-center leading-tight line-clamp-2 break-all w-full">
        {file.name}
      </p>
      {file.sizeBytes !== undefined && (
        <p className="text-[10px] text-slate-400 mt-0.5">
          {(file.sizeBytes / 1024 / 1024).toFixed(2)} MB
        </p>
      )}
    </div>
  );
}


// ---------------------------------------------------------------------------
// FileDropzone — public API
// ---------------------------------------------------------------------------

export interface FileDropzoneProps {
  /** Controlled list of selected files */
  files: File[];
  /** Called whenever the file list changes */
  onFilesChange: (files: File[]) => void;
  /**
   * Files already saved on the server (pre-populated on edit forms).
   * Shown with a "บันทึกแล้ว" badge to distinguish from new uploads.
   */
  existingFiles?: ExistingFile[];
  /** Called with the id of the existing file the user wants to remove */
  onExistingFileRemove?: (id: string) => void;
  /**
   * Allow picking more than one file at a time.
   * - true  → append new picks, show grid (3 cols)
   * - false → replace with latest pick, show single card
   * Defaults to false.
   */
  multiple?: boolean;
  /** Accepted MIME types / extensions passed to <input accept>. Defaults to ".pdf,.zip" */
  accept?: string;
  /** Max allowed file size in megabytes. No limit if omitted. */
  maxSizeMB?: number;
  /** Helper text shown in the empty state. Auto-generated from `accept` if omitted. */
  hint?: string;
  /**
   * Extra classes applied to the outer wrapper.
   * Use this to control sizing, margins, and layout from the call-site.
   * The component itself has no opinion about width or position.
   */
  className?: string;
  disabled?: boolean;
}

export function FileDropzone({
  files,
  onFilesChange,
  existingFiles = [],
  onExistingFileRemove,
  multiple = false,
  accept = ".pdf,.zip",
  maxSizeMB,
  hint,
  className,
  disabled = false,
}: FileDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const resolvedHint = hint ?? (multiple ? `${accept} · เลือกได้หลายไฟล์` : accept);

  // Check whether a single File matches the accept string
  // Handles both extensions (.pdf) and MIME wildcards (image/*)
  const isFileAccepted = (file: File): boolean => {
    if (accept === "*") return true;
    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    return accept.split(",").some((token) => {
      const t = token.trim().toLowerCase();
      if (t.startsWith(".")) return ext === t;                     // ".pdf"
      if (t.endsWith("/*")) return file.type.startsWith(t.replace("/*", "/")); // "image/*"
      return file.type === t;                                       // "application/pdf"
    });
  };

  // Filter incoming files → show toast for rejections → update state
  const addFiles = (incoming: File[]) => {
    if (incoming.length === 0) return;

    const allowed: File[] = [];
    const rejectedType: string[] = [];
    const rejectedSize: string[] = [];

    for (const file of incoming) {
      if (!isFileAccepted(file)) {
        rejectedType.push(file.name);
      } else if (maxSizeMB !== undefined && file.size > maxSizeMB * 1024 * 1024) {
        rejectedSize.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`);
      } else {
        allowed.push(file);
      }
    }

    if (rejectedType.length > 0) {
      toast.error(
        rejectedType.length === 1
          ? `"${rejectedType[0]}" ไม่รองรับชนิดไฟล์นี้`
          : `${rejectedType.length} ไฟล์ถูกปฏิเสธ: ${rejectedType.join(", ")}`,
        { description: `รองรับเฉพาะ: ${accept}` },
      );
    }

    if (rejectedSize.length > 0) {
      toast.error(
        rejectedSize.length === 1
          ? `"${rejectedSize[0]}" ขนาดเกินกำหนด`
          : `${rejectedSize.length} ไฟล์มีขนาดเกินกำหนด`,
        { description: `ขนาดสูงสุดที่อนุญาต: ${maxSizeMB} MB` },
      );
    }

    if (allowed.length === 0) return;
    onFilesChange(multiple ? [...files, ...allowed] : [allowed[0]]);
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []));
    // Reset so selecting the same file again re-triggers onChange
    e.target.value = "";
  };

  const hasFiles = existingFiles.length > 0 || files.length > 0;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-[7px] border-2 border-dashed p-4 transition-all",
        isDragging ? "bg-orange-50 border-[#f26522]" : "bg-slate-50 border-slate-200",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
    >
      {/* File list: existing (server) + new (local) */}
      {hasFiles && (
        <div className={cn("mb-3", multiple && "max-h-52 overflow-y-auto pr-0.5")}>
          <div className={cn(multiple ? "grid grid-cols-3 gap-3" : "flex gap-3")}>
            {existingFiles.map((ef) => (
              <ExistingFileCard
                key={ef.id}
                file={ef}
                onRemove={() => onExistingFileRemove?.(ef.id)}
              />
            ))}
            {files.map((file, index) => (
              <FileCard key={`new-${index}`} file={file} onRemove={() => removeFile(index)} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state — click-to-upload prompt */}
      {!hasFiles ? (
        <div
          className="flex flex-col items-center text-center gap-1 cursor-pointer py-6 rounded-[7px] hover:bg-white/60 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={24} className="text-slate-300 mb-1" />
          <p className="text-sm font-semibold text-slate-700">
            ลากไฟล์มาวางที่นี่ หรือ{" "}
            <span className="text-[#f26522] underline underline-offset-2">คลิกเพื่ออัปโหลด</span>
          </p>
          <p className="text-xs text-slate-400">{resolvedHint}</p>
        </div>
      ) : (
        /* Add-more / Change-file button */
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[7px] border border-dashed border-slate-300 text-slate-500 text-sm font-medium hover:border-[#f26522] hover:bg-white hover:text-[#f26522] transition-all"
        >
          <Upload size={14} />
          {multiple ? "เพิ่มไฟล์" : "เปลี่ยนไฟล์"} · {resolvedHint}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
