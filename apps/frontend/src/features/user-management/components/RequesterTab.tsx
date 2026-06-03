"use client";

import { useState } from "react";
import { Trash2, Search, UserCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { deleteRequester } from "../services/user-management.service";
import { useRequesters } from "../hooks/useUserManagement";

export default function RequesterTab() {
  const { requesters, loading, error, refetch } = useRequesters();
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  const filtered = requesters.filter((r) =>
    `${r.first_name} ${r.last_name} ${r.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบผู้ใช้งานนี้ใช่หรือไม่?")) return;
    setDeleting(id);
    try { await deleteRequester(id); refetch(); } catch { alert("ลบไม่สำเร็จ"); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="ค้นหาชื่อ, อีเมล..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 rounded-xl border-gray-200 text-sm"
        />
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
          <UserCircle2 className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">{search ? "ไม่พบผลการค้นหา" : "ยังไม่มีผู้ขอใช้บริการ"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((req) => {
            const isInternal = req.requester_type_id === 1;
            return (
              <div
                key={req.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-purple-500">
                      {req.first_name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {req.first_name} {req.last_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{req.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span className={`hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${isInternal ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600"}`}>
                    {isInternal ? "บุคลากรภายใน" : "บุคคลภายนอก"}
                  </span>
                  <span className={`hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${req.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {req.is_active ? "ใช้งาน" : "ปิดใช้งาน"}
                  </span>
                  <button
                    onClick={() => handleDelete(req.id)}
                    disabled={deleting === req.id}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
