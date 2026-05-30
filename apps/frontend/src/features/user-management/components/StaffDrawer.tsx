"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStaff, updateStaff, assignStaffPermissions } from "../services/user-management.service";
import type { StaffUser, Permission } from "../types";
import PermissionCheckboxes from "./PermissionCheckboxes";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  staff?: StaffUser | null;
  allPermissions: Permission[];
}

export default function StaffDrawer({ open, onClose, onSuccess, staff, allPermissions }: Props) {
  const isEdit = !!staff;
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", phone: "", line_id: "" });
  const [showPass, setShowPass] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
      if (staff) {
        setForm({ first_name: staff.first_name, last_name: staff.last_name, email: staff.email, password: "", phone: staff.phone ?? "", line_id: staff.line_id ?? "" });
        setSelectedPerms(staff.permissions?.map((p) => p.id) ?? []);
      } else {
        setForm({ first_name: "", last_name: "", email: "", password: "", phone: "", line_id: "" });
        setSelectedPerms([]);
      }
    }
  }, [open, staff]);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (isEdit && staff) {
        await updateStaff(staff.id, { first_name: form.first_name, last_name: form.last_name, phone: form.phone, line_id: form.line_id });
        await assignStaffPermissions(staff.id, selectedPerms);
      } else {
        const created = await createStaff({ ...form });
        await assignStaffPermissions(created.id, selectedPerms);
      }
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-[199] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-screen w-full max-w-lg bg-white shadow-2xl z-[200] flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">{isEdit ? "แก้ไขข้อมูล Staff" : "เพิ่ม Staff ใหม่"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{isEdit ? staff?.email : "กรอกข้อมูลและกำหนดสิทธิ์"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">{error}</div>
            )}

            {/* Basic Info */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">ข้อมูลส่วนตัว</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700">ชื่อ <span className="text-red-400">*</span></Label>
                    <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required placeholder="ชื่อจริง" className="h-9 rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700">นามสกุล <span className="text-red-400">*</span></Label>
                    <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required placeholder="นามสกุล" className="h-9 rounded-lg" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700">อีเมล <span className="text-red-400">*</span></Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="email@example.com" disabled={isEdit} className="h-9 rounded-lg disabled:opacity-60" />
                </div>

                {!isEdit && (
                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700">รหัสผ่าน <span className="text-red-400">*</span></Label>
                    <div className="relative">
                      <Input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} placeholder="อย่างน้อย 8 ตัวอักษร" className="h-9 rounded-lg pr-9" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700">เบอร์โทร</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08x-xxx-xxxx" className="h-9 rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700">LINE ID</Label>
                    <Input value={form.line_id} onChange={(e) => setForm({ ...form, line_id: e.target.value })} placeholder="@lineid" className="h-9 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">สิทธิ์การใช้งาน</h3>
                <span className="text-xs text-brand-primary font-medium">{selectedPerms.length} รายการที่เลือก</span>
              </div>
              <PermissionCheckboxes permissions={allPermissions} selected={selectedPerms} onChange={setSelectedPerms} />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10 rounded-xl">ยกเลิก</Button>
            <Button type="submit" disabled={loading} className="flex-1 h-10 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? "บันทึกการเปลี่ยนแปลง" : "เพิ่ม Staff"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
