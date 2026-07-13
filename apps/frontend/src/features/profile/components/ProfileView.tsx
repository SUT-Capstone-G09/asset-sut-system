"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/lib/context/auth-context";
import { getMyRequesterProfile, changePasswordApi, RequesterProfile } from "@/features/profile/services/profile.service";
import { getSavedSignature, saveSignature, deleteSavedSignature, SignatureResult } from "@/lib/services/signature.service";

const MAX_SIGNATURE_KB = 500;
const MIN_SIGNATURE_KB = 2;

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-bold text-gray-900 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value || "-"}</span>
    </div>
  );
}

export default function ProfileView() {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<RequesterProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    getMyRequesterProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoadingProfile(false));
  }, []);

  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
  const initial = fullName.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-5">
      {/* Account summary */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-brand-primary">{initial}</span>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-lg text-gray-900 truncate">{fullName || user?.email}</p>
          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          {profile?.requester_type && (
            <span className="inline-block mt-1.5 text-xs font-semibold text-brand-primary bg-brand-primary/10 rounded-full px-2.5 py-0.5">
              {profile.requester_type}
            </span>
          )}
        </div>
      </section>

      {/* Personal info — read-only until self-service edit is supported by the API */}
      <SectionCard title="ข้อมูลส่วนตัว">
        {loadingProfile ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
          </div>
        ) : profile ? (
          <div>
            <InfoRow label="ชื่อ" value={profile.first_name} />
            <InfoRow label="นามสกุล" value={profile.last_name} />
            <InfoRow label="เบอร์โทรศัพท์" value={profile.phone} />
            <InfoRow label="LINE ID" value={profile.line_id} />
            <InfoRow label="ประเภทผู้ขอใช้" value={profile.requester_type} />
          </div>
        ) : (
          <p className="text-sm text-gray-400">ไม่สามารถโหลดข้อมูลส่วนตัวได้</p>
        )}
      </SectionCard>

      <ChangePasswordSection />
      <SignatureSection />
    </div>
  );
}

function ChangePasswordSection() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const tooShort = newPassword.length > 0 && newPassword.length < 8;
  const canSubmit = oldPassword && newPassword && confirmPassword && !mismatch && !tooShort;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await changePasswordApi(oldPassword, newPassword);
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionCard title="เปลี่ยนรหัสผ่าน">
      <div className="flex flex-col gap-3 max-w-sm">
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="รหัสผ่านปัจจุบัน"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="ยืนยันรหัสผ่านใหม่"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
        />
        {mismatch && <p className="text-xs text-red-500">รหัสผ่านใหม่ไม่ตรงกัน</p>}
        {tooShort && <p className="text-xs text-red-500">รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="w-fit bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
          เปลี่ยนรหัสผ่าน
        </Button>
      </div>
    </SectionCard>
  );
}

function SignatureSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState<SignatureResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  const loadSaved = () => {
    setLoadError(false);
    setLoading(true);
    getSavedSignature()
      .then(setSaved)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (file.type !== "image/png") {
      setError("รองรับเฉพาะไฟล์ PNG เท่านั้น");
      return;
    }
    const sizeKB = file.size / 1024;
    if (sizeKB > MAX_SIGNATURE_KB) {
      setError(`ไฟล์ใหญ่เกินไป (ไม่เกิน ${MAX_SIGNATURE_KB} KB)`);
      return;
    }
    if (sizeKB < MIN_SIGNATURE_KB) {
      setError(`ไฟล์เล็กเกินไป (อย่างน้อย ${MIN_SIGNATURE_KB} KB)`);
      return;
    }
    setUploading(true);
    try {
      const result = await saveSignature(file);
      setSaved(result);
      toast.success("บันทึกลายเซ็นสำเร็จ");
    } catch {
      setError("บันทึกลายเซ็นไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSavedSignature();
      setSaved(null);
      toast.success("ลบลายเซ็นแล้ว");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SectionCard title="ลายเซ็นของฉัน">
      <p className="text-xs text-gray-400 mb-3">
        ใช้สำหรับเซ็นเอกสารคำขออนุญาตใช้สถานที่โดยไม่ต้องวาดใหม่ทุกครั้ง — เฉพาะไฟล์ PNG พื้นหลังโปร่งใส ขนาด {MIN_SIGNATURE_KB}–{MAX_SIGNATURE_KB} KB
      </p>
      {loadError && (
        <div className="flex items-center justify-between gap-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3 max-w-xs">
          <span>โหลดลายเซ็นที่บันทึกไว้ไม่สำเร็จ</span>
          <button type="button" onClick={loadSaved} className="font-semibold underline underline-offset-2 shrink-0">
            ลองใหม่
          </button>
        </div>
      )}
      {loading ? (
        <Skeleton className="h-20 w-full max-w-xs" />
      ) : (
        <div className="flex items-center gap-4">
          <div className="h-20 w-48 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
            {saved ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={saved.url} alt="ลายเซ็นที่บันทึกไว้" className="h-full max-h-[70px] object-contain" />
            ) : (
              <span className="text-xs text-gray-300">ยังไม่มีลายเซ็น</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png"
              className="hidden"
              onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-fit bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-sm h-9 flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {saved ? "อัปโหลดใหม่" : "อัปโหลดลายเซ็น"}
            </Button>
            {saved && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 disabled:opacity-50"
              >
                {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                ลบลายเซ็น
              </button>
            )}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </SectionCard>
  );
}
