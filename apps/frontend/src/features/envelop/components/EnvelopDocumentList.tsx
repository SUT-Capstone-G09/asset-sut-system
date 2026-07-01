"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mockEnvelopDocuments } from "../data/envelop";
import { DocumentStatus, EnvelopDocument } from "../types/envelop";
import { AddEnvelopDocumentModal } from "./AddEnvelopDocumentModal";
import { EditEnvelopDocumentModal } from "./EditEnvelopDocumentModal";

// ---- Status Badge ----
const statusConfig: Record<DocumentStatus, { label: string; className: string }> = {
  พร้อมใช้งาน: {
    label: "พร้อมใช้งาน",
    className: "bg-emerald-100 text-emerald-700",
  },
  ใช้งานอยู่: {
    label: "ใช้งานอยู่",
    className: "bg-blue-100 text-blue-700",
  },
  หมดอายุ: {
    label: "หมดอายุ",
    className: "bg-red-100 text-red-500",
  },
};

function StatusBadge({ status }: { status: DocumentStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

// ---- Table Row ----
function EnvelopDocumentRow({
  document,
  onEdit,
}: {
  document: EnvelopDocument;
  onEdit: (doc: EnvelopDocument) => void;
}) {
  return (
    <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50/60">
      {/* ชื่อเอกสาร */}
      <td className="py-3.5 pl-4 pr-3">
        <span className="text-sm font-medium text-slate-800">{document.name}</span>
      </td>

      {/* สถานที่ */}
      <td className="px-3 py-3.5">
        <span className="text-sm text-slate-500">{document.location}</span>
      </td>

      {/* สถานะ */}
      <td className="px-3 py-3.5">
        <StatusBadge status={document.documentStatus} />
      </td>

      {/* วันที่ */}
      <td className="px-3 py-3.5">
        <span className="text-sm text-slate-500">{document.date}</span>
      </td>

      {/* การจัดการ */}
      <td className="py-3.5 pl-3 pr-4">
        <div className="flex items-center gap-1">
          <button
            aria-label="แก้ไข"
            onClick={() => onEdit(document)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Pencil size={14} />
          </button>
          <button
            aria-label="ลบ"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ---- Main Component ----
export default function EnvelopDocumentList() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<EnvelopDocument | null>(null);

  return (
    <>
      <div className="rounded-sm border border-slate-100 bg-white shadow-sm">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">คลังซองเอกสาร</h2>
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-1.5 bg-[#EA580C] text-xs font-semibold text-white hover:bg-[#C2410C]"
          >
            <Plus size={14} strokeWidth={2.5} />
            เพิ่มเอกสารใหม่
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="py-3 pl-4 pr-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  ชื่อเอกสาร
                </th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  สถานที่
                </th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  สถานะ
                </th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  วันที่
                </th>
                <th className="py-3 pl-3 pr-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {mockEnvelopDocuments.map((doc) => (
                <EnvelopDocumentRow
                  key={doc.id}
                  document={doc}
                  onEdit={setEditingDocument}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Document Modal */}
      <AddEnvelopDocumentModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={(data) => {
          console.log("New envelop document:", data);
          // TODO: integrate with API
        }}
      />

      {/* Edit Document Modal */}
      <EditEnvelopDocumentModal
        isOpen={!!editingDocument}
        onOpenChange={(open) => { if (!open) setEditingDocument(null); }}
        document={editingDocument}
        onSubmit={(id, data) => {
          console.log("Edit envelop document:", id, data);
          // TODO: integrate with API
        }}
      />
    </>
  );
}
