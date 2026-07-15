"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteAdmin } from "../services/user-management.service";
import { useAdmins } from "../hooks/useUserManagement";
import AdminDrawer from "./AdminDrawer";
import type { AdminUser } from "../types";

export default function AdminTab() {
  const { admins, loading, error, refetch } = useAdmins();
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const filtered = admins.filter((a) =>
    `${a.first_name} ${a.last_name} ${a.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบ Admin นี้ใช่หรือไม่?")) return;
    setDeleting(id);
    try { await deleteAdmin(id); refetch(); } catch { alert("ลบไม่สำเร็จ"); }
    finally { setDeleting(null); }
  };

  const openCreate = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (a: AdminUser) => { setEditing(a); setDrawerOpen(true); };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ค้นหาชื่อ, อีเมล..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-xl border-gray-200 text-sm"
          />
        </div>
        <Button onClick={openCreate} className="h-9 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm rounded-xl gap-2 shrink-0">
          <Plus className="w-4 h-4" /> เพิ่ม เจ้าหน้าที่บริหารส่วนสินทรัพย์
        </Button>
      </div>

      {/* States */}
      {error && <div className="px-4 py-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>}

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <ShieldCheck className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">{search ? "ไม่พบผลการค้นหา" : "ยังไม่มี เจ้าหน้าที่บริหารส่วนสินทรัพย์"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-brand-primary">
                    {admin.first_name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {admin.first_name} {admin.last_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{admin.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-3 shrink-0">
                <span className={`hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                  {admin.is_active ? "ใช้งาน" : "ปิดใช้งาน"}
                </span>
                <button onClick={() => openEdit(admin)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(admin.id)}
                  disabled={deleting === admin.id}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={refetch}
        admin={editing}
      />
    </div>
  );
}
