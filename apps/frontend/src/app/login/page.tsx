"use client";

import { useState } from "react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/services/auth.service";
import { useAuthContext } from "@/lib/context/auth-context";

interface LoginModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LoginModal({ isOpen, onOpenChange }: LoginModalProps) {
    const { login: saveAuth } = useAuthContext();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await login(email, password);
            saveAuth(result.token, result.user);
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="py-6 flex flex-col items-center gap-4">
                    <Image
                        src="/SUT_logo.png"
                        alt="SUT Logo"
                        width={80}
                        height={80}
                        className="object-contain"
                    />
                    <DialogTitle className="text-2xl font-bold text-center">
                        เข้าสู่ระบบ
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 px-2 pb-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">อีเมล</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="กรอกอีเมลของคุณ"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">รหัสผ่าน</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="กรอกรหัสผ่านของคุณ"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-10"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold h-10"
                        disabled={isLoading}
                    >
                        {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}