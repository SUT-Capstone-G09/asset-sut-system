"use client";

import { cn } from "@/lib/utils";

export default function FField({ label, placeholder, value, onChange, required, type = "text", className, maxLength, selectOptions }: {
  label: string; placeholder?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean; type?: string; className?: string; maxLength?: number;
  // When provided (even as []), renders a <select> instead of a text input —
  // used when a postal code maps to several possible subdistricts and the
  // user must pick one rather than have it guessed.
  selectOptions?: string[];
}) {
  const fieldClassName = cn("w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
    required && !value ? "border-red-200" : "border-gray-200");
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {selectOptions ? (
        <select value={value} onChange={onChange} className={cn(fieldClassName, "bg-white", !value && "text-gray-400")}>
          <option value="">เลือก{label}...</option>
          {selectOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength}
          className={cn(fieldClassName, "placeholder-gray-300")} />
      )}
    </div>
  );
}
