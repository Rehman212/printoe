"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { Logo } from "@/components/shared/Logo";
import { ADMIN_CREDENTIALS } from "@/lib/admin-data";

export function AdminLoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState(ADMIN_CREDENTIALS.email);
  const [password, setPassword] = useState(ADMIN_CREDENTIALS.password);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid admin email";
    }
    if (!password || password.length < 6) {
      next.password = "Password is required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await adminLogin(email.trim(), password);
      toast({
        title: "Admin signed in",
        description: "Welcome to the Printoe admin panel.",
        tone: "success",
      });
      router.push("/admin");
    } catch (err) {
      toast({
        title: "Admin login failed",
        description: err instanceof Error ? err.message : "Invalid credentials",
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-secondary px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-card p-8 shadow-card">
        <div className="mb-8 space-y-4 text-center">
          <div className="mx-auto inline-flex rounded-xl bg-white px-3 py-2">
            <Logo href="/admin/login" />
          </div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary">Admin Portal</h1>
            <p className="mt-1 text-sm font-medium text-text-secondary">
              Staff access only — not for customer accounts
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            label="Admin email"
            type="email"
            name="email"
            autoComplete="username"
            placeholder="admin@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email}
          />
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-text-secondary hover:text-secondary focus-ring rounded"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password}
          />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Sign in to Admin
          </Button>
        </form>
      </div>
    </div>
  );
}
