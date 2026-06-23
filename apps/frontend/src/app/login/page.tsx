"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginApi, registerApi } from "@/lib/services/auth.service";
import { useAuthContext } from "@/lib/context/auth-context";

type Tab = "login" | "register";

const REQUESTER_TYPES = [
  { id: 1, label: "บุคลากร / นักศึกษา SUT (ภายใน)" },
  { id: 2, label: "บุคคลภายนอก" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login: saveAuth } = useAuthContext();
  const [tab, setTab] = useState<Tab>("login");

  // login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // register form
  const [reg, setReg] = useState({
    first_name: "", last_name: "", email: "", password: "",
    confirm_password: "", line_id: "", phone: "", requester_type_id: 2,
  });
  const [showRegPass, setShowRegPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const result = await loginApi(email, password);
      saveAuth(result.token, result.user);
      if (result.user.role === "admin") router.push("/admin/dashboard");
      else if (result.user.role === "staff") router.push("/staff/dashboard");
      else router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (reg.password !== reg.confirm_password) {
      setError("รหัสผ่านไม่ตรงกัน"); return;
    }
    setLoading(true);
    try {
      await registerApi({
        first_name: reg.first_name,
        last_name: reg.last_name,
        email: reg.email,
        password: reg.password,
        line_id: reg.line_id || undefined,
        phone: reg.phone || undefined,
        requester_type_id: reg.requester_type_id,
      });
      setSuccess("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
      setTab("login");
      setEmail(reg.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="pt-8 pb-4 px-8 flex flex-col items-center gap-3">
            <Image src="/SUT_logo.png" alt="SUT Logo" width={72} height={72} className="object-contain" />
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">Asset SUT</h1>
              <p className="text-xs text-gray-400 mt-0.5">ระบบบริหารจัดการสินทรัพย์</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-8 pt-2">
            <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
              {(["login", "register"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tab === t
                      ? "bg-white text-brand-primary shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
                </button>
              ))}
            </div>
          </div>

          {/* Forms */}
          <div className="px-8 pt-5 pb-8">
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 px-4 py-3 bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl">
                {success}
              </div>
            )}

            {/* ── LOGIN FORM ── */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">อีเมล</Label>
                  <Input
                    id="login-email" type="email" placeholder="example@email.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    required className="h-11 rounded-xl border-gray-200 focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">รหัสผ่าน</Label>
                  <div className="relative">
                    <Input
                      id="login-password" type={showPass ? "text" : "password"}
                      placeholder="กรอกรหัสผ่าน" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required className="h-11 rounded-xl border-gray-200 pr-10 focus:border-brand-primary [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    />
                    <button
                      type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit" disabled={loading}
                  className="w-full h-11 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold rounded-xl mt-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "เข้าสู่ระบบ"}
                </Button>
              </form>
            )}

            {/* ── REGISTER FORM ── */}
            {tab === "register" && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">ชื่อ</Label>
                    <Input
                      placeholder="ชื่อจริง" value={reg.first_name}
                      onChange={(e) => setReg({ ...reg, first_name: e.target.value })}
                      required className="h-10 rounded-xl border-gray-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">นามสกุล</Label>
                    <Input
                      placeholder="นามสกุล" value={reg.last_name}
                      onChange={(e) => setReg({ ...reg, last_name: e.target.value })}
                      required className="h-10 rounded-xl border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">อีเมล</Label>
                  <Input
                    type="email" placeholder="example@email.com" value={reg.email}
                    onChange={(e) => setReg({ ...reg, email: e.target.value })}
                    required className="h-10 rounded-xl border-gray-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">เบอร์โทร</Label>
                    <Input
                      placeholder="08x-xxx-xxxx" value={reg.phone}
                      onChange={(e) => setReg({ ...reg, phone: e.target.value })}
                      className="h-10 rounded-xl border-gray-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">LINE ID</Label>
                    <Input
                      placeholder="@lineid" value={reg.line_id}
                      onChange={(e) => setReg({ ...reg, line_id: e.target.value })}
                      className="h-10 rounded-xl border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">ประเภทผู้ใช้</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {REQUESTER_TYPES.map((t) => (
                      <label
                        key={t.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                          reg.requester_type_id === t.id
                            ? "border-brand-primary bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio" name="requester_type" value={t.id}
                          checked={reg.requester_type_id === t.id}
                          onChange={() => setReg({ ...reg, requester_type_id: t.id })}
                          className="accent-brand-primary"
                        />
                        <span className="text-sm text-gray-700">{t.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">รหัสผ่าน</Label>
                  <div className="relative">
                    <Input
                      type={showRegPass ? "text" : "password"} placeholder="อย่างน้อย 8 ตัวอักษร"
                      value={reg.password}
                      onChange={(e) => setReg({ ...reg, password: e.target.value })}
                      required minLength={8} className="h-10 rounded-xl border-gray-200 pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    />
                    <button type="button" onClick={() => setShowRegPass(!showRegPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน</Label>
                  <Input
                    type="password" placeholder="กรอกรหัสผ่านอีกครั้ง"
                    value={reg.confirm_password}
                    onChange={(e) => setReg({ ...reg, confirm_password: e.target.value })}
                    required className="h-10 rounded-xl border-gray-200"
                  />
                </div>

                <Button
                  type="submit" disabled={loading}
                  className="w-full h-11 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold rounded-xl"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "สมัครสมาชิก"}
                </Button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          © {new Date().getFullYear()} Suranaree University of Technology
        </p>
      </div>
    </div>
  );
}
