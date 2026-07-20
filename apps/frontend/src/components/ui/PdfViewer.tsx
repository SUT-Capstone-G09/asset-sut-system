"use client";

import React, { useEffect, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface PdfViewerProps {
  file: File;
  className?: string;
}

export function PdfViewer({ file, className }: PdfViewerProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(100);

  // Create object URL from File when file changes
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const zoomIn = () => setScale((s) => Math.min(s + 25, 200));
  const zoomOut = () => setScale((s) => Math.max(s - 25, 50));
  const resetZoom = () => setScale(100);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
        {/* File info */}
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={14} className="text-orange-400 shrink-0" />
          <span className="text-xs font-medium text-slate-600 truncate max-w-[180px]">
            {file.name}
          </span>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            disabled={scale <= 50}
            className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="ย่อ"
          >
            <ZoomOut size={13} className="text-slate-600" />
          </button>
          <span className="text-xs font-medium text-slate-500 w-10 text-center tabular-nums">
            {scale}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 200}
            className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="ขยาย"
          >
            <ZoomIn size={13} className="text-slate-600" />
          </button>
          <button
            onClick={resetZoom}
            className="p-1.5 rounded hover:bg-slate-200 transition-colors ml-0.5"
            title="รีเซ็ต"
          >
            <RotateCcw size={12} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* PDF iframe container */}
      <div className="flex-1 overflow-auto bg-slate-100 relative">
        {objectUrl ? (
          <div
            className="transition-transform duration-200 origin-top-left"
            style={{
              width: `${scale}%`,
              minHeight: "100%",
            }}
          >
            <iframe
              src={`${objectUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              title="PDF Preview"
              className="w-full h-full min-h-[480px] border-0"
              style={{ height: "calc(100vh - 280px)", minHeight: 480 }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center animate-pulse">
                <FileText size={18} />
              </div>
              <span className="text-xs">กำลังโหลด PDF...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
