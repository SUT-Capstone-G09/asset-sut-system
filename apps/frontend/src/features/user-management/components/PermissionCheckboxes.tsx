"use client";

import type { Permission } from "../types";

const MODULE_LABELS: Record<string, string> = {
  user_mgmt: "จัดการผู้ใช้งาน",
  booking: "การจอง",
  payment: "การชำระเงิน",
  upload_doc: "อัพโหลดเอกสาร",
  location_mgmt: "จัดการสถานที่",
};

const ACTION_LABELS: Record<string, string> = {
  create: "เพิ่ม",
  read: "ดู",
  update: "แก้ไข",
  delete: "ลบ",
};

interface Props {
  permissions: Permission[];
  selected: number[];
  onChange: (ids: number[]) => void;
}

export default function PermissionCheckboxes({ permissions, selected, onChange }: Props) {
  const grouped = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  const toggle = (id: number) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  const toggleModule = (module: string) => {
    const ids = (grouped[module] ?? []).map((p) => p.id);
    const allSelected = ids.every((id) => selected.includes(id));
    if (allSelected) {
      onChange(selected.filter((id) => !ids.includes(id)));
    } else {
      onChange([...new Set([...selected, ...ids])]);
    }
  };

  if (permissions.length === 0) {
    return <p className="text-sm text-gray-400 py-2">ไม่มีข้อมูล permission</p>;
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([module, perms]) => {
        const allSelected = perms.every((p) => selected.includes(p.id));
        const someSelected = perms.some((p) => selected.includes(p.id));

        return (
          <div key={module} className="rounded-xl border border-gray-100 overflow-hidden">
            {/* Module header */}
            <label className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                onChange={() => toggleModule(module)}
                className="w-4 h-4 accent-brand-primary rounded"
              />
              <span className="font-semibold text-sm text-gray-800">
                {MODULE_LABELS[module] ?? module}
              </span>
              <span className="ml-auto text-xs text-gray-400">
                {perms.filter((p) => selected.includes(p.id)).length}/{perms.length}
              </span>
            </label>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-px bg-gray-100">
              {perms.map((p) => (
                <label
                  key={p.id}
                  className={`flex items-center gap-2.5 px-4 py-2.5 bg-white cursor-pointer hover:bg-orange-50 transition-colors ${
                    selected.includes(p.id) ? "bg-orange-50/60" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={() => toggle(p.id)}
                    className="w-3.5 h-3.5 accent-brand-primary"
                  />
                  <span className="text-sm text-gray-700">
                    {ACTION_LABELS[p.action] ?? p.action}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
