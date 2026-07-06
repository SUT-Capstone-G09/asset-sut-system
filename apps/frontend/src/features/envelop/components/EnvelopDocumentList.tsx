"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mockEnvelopDocuments } from "../data/envelop";
import { DocumentStatus, EnvelopDocument } from "../types/envelop";
import { AddEnvelopDocumentModal, AddEnvelopDocumentFormData } from "./AddEnvelopDocumentModal";
import { EditEnvelopDocumentModal, EditEnvelopDocumentFormData } from "./EditEnvelopDocumentModal";
import { toast } from "sonner";

// ---- Status Badge ----
const statusConfig: Record<DocumentStatus, { label: string; className: string }> = {
  draft: {
    label: "ร่าง",
    className: "bg-slate-100 text-slate-600",
  },
  on_sale: {
    label: "เปิดขาย",
    className: "bg-emerald-100 text-emerald-700",
  },
  unavailable: {
    label: "ปิดชั่วคราว",
    className: "bg-amber-100 text-amber-700",
  },
  archived: {
    label: "ปิดถาวร",
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

// ---- Delete Confirm Dialog ----
function DeleteConfirmDialog({
  document,
  onConfirm,
  onCancel,
}: {
  document: EnvelopDocument;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative z-10 mx-4 w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="size-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertTriangle size={26} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">ยืนยันการลบซองเอกสาร</h3>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
              คุณต้องการลบ{" "}
              <span className="font-semibold text-slate-800">&ldquo;{document.name}&rdquo;</span>{" "}
              ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
          </div>
          <div className="flex w-full gap-3 mt-1">
            <button
              onClick={onCancel}
              className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 h-11 rounded-xl bg-red-500 text-sm font-bold text-white hover:bg-red-600 transition-colors shadow-sm shadow-red-200"
            >
              ลบเอกสาร
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Table Row ----
function EnvelopDocumentRow({
  document,
  onEdit,
  onDelete,
}: {
  document: EnvelopDocument;
  onEdit: (doc: EnvelopDocument) => void;
  onDelete: (doc: EnvelopDocument) => void;
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

      {/* ราคา */}
      <td className="px-3 py-3.5 whitespace-nowrap">
        <span className="text-sm font-semibold text-slate-700">
          {document.amount.toLocaleString()} บาท
        </span>
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
            onClick={() => onDelete(document)}
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
  const [documents, setDocuments] = useState<EnvelopDocument[]>(mockEnvelopDocuments);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<EnvelopDocument | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<EnvelopDocument | null>(null);

  // ── Add ──────────────────────────────────────────────────────
  const handleAdd = (data: AddEnvelopDocumentFormData) => {
    const newDoc: EnvelopDocument = {
      id: String(Date.now()),
      name: data.title,
      location: data.location,
      amount: data.price,
      documentStatus: "draft",
      date: new Date().toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    toast.success("เพิ่มซองเอกสารสำเร็จ", {
      description: `"${newDoc.name}" ถูกเพิ่มเข้าคลังเรียบร้อยแล้ว`,
    });
  };

  // ── Edit ─────────────────────────────────────────────────────
  const handleEdit = (id: string, data: EditEnvelopDocumentFormData) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? {
            ...doc,
            name: data.title,
            location: data.location,
            amount: data.price,
            documentStatus: data.documentStatus,
          }
          : doc
      )
    );
    toast.success("บันทึกการแก้ไขสำเร็จ", {
      description: `ซองเอกสาร "${data.title}" ถูกอัปเดตแล้ว`,
    });
  };

  // ── Delete ───────────────────────────────────────────────────
  const handleDeleteConfirm = () => {
    if (!deletingDocument) return;
    const name = deletingDocument.name;
    setDocuments((prev) => prev.filter((doc) => doc.id !== deletingDocument.id));
    setDeletingDocument(null);
    toast.error("ลบซองเอกสารแล้ว", {
      description: `"${name}" ถูกลบออกจากระบบเรียบร้อยแล้ว`,
    });
  };

  return (
    <>
      <div className="rounded-sm border border-slate-100 bg-white shadow-sm">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">คลังซองเอกสาร</h2>
            <p className="text-xs text-slate-400 mt-0.5">{documents.length} รายการ</p>
          </div>
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
                  ราคา (บาท)
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
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                    ยังไม่มีซองเอกสารในระบบ
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <EnvelopDocumentRow
                    key={doc.id}
                    document={doc}
                    onEdit={setEditingDocument}
                    onDelete={setDeletingDocument}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Document Modal */}
      <AddEnvelopDocumentModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAdd}
      />

      {/* Edit Document Modal */}
      <EditEnvelopDocumentModal
        isOpen={!!editingDocument}
        onOpenChange={(open) => { if (!open) setEditingDocument(null); }}
        document={editingDocument}
        onSubmit={handleEdit}
      />

      {/* Delete Confirm Dialog */}
      {deletingDocument && (
        <DeleteConfirmDialog
          document={deletingDocument}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingDocument(null)}
        />
      )}
    </>
  );
}
