"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

function SocialButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-2xl border border-border bg-card text-sm font-semibold text-secondary transition hover:border-primary/30 hover:bg-primary/5 focus-ring"
      aria-label={label}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid work email";
    }
    if (!password || password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    toast({
      title: "Welcome back",
      description: "You're signed in to Printoe.",
      tone: "success",
    });
    router.push("/dashboard");
  };

  const socialToast = (provider: string) => {
    toast({
      title: `${provider} sign-in`,
      description: "Social login will connect once auth is configured.",
      tone: "info",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <SocialButton label="Google" onClick={() => socialToast("Google")}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path
              fill="#EA4335"
              d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.8-4.1 2.8-7 0-.7-.1-1.3-.2-1.9H12z"
            />
            <path
              fill="#34A853"
              d="M6.6 14.3l-.5.4-2.1 1.6C5.6 19.1 8.6 21 12 21c2.3 0 4.3-.8 5.8-2.1l-3.1-2.4c-.8.6-1.9.9-2.7.9-2.1 0-3.9-1.4-4.5-3.3z"
            />
            <path
              fill="#4A90E2"
              d="M4 7.7C3.4 8.9 3 10.4 3 12s.4 3.1 1 4.3c0 .1 2.6-2 2.6-2-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7L4 7.7z"
            />
            <path
              fill="#FBBC05"
              d="M12 4.9c1.3 0 2.5.5 3.4 1.3l2.6-2.5C16.3 2.2 14.3 1.4 12 1.4 8.6 1.4 5.6 3.3 4 6.3l2.6 2c.6-1.9 2.4-3.4 5.4-3.4z"
            />
          </svg>
        </SocialButton>
        <SocialButton label="Microsoft" onClick={() => socialToast("Microsoft")}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path fill="#F25022" d="M3 3h8.5v8.5H3z" />
            <path fill="#7FBA00" d="M12.5 3H21v8.5h-8.5z" />
            <path fill="#00A4EF" d="M3 12.5h8.5V21H3z" />
            <path fill="#FFB900" d="M12.5 12.5H21V21h-8.5z" />
          </svg>
        </SocialButton>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          or continue with email
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email}
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-semibold text-text-primary">
              Password
            </label>
            <Link
              href="/login"
              className="text-xs font-semibold text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault();
                toast({
                  title: "Password reset",
                  description: "Reset links will be available with backend auth.",
                  tone: "info",
                });
              }}
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
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
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 pt-1">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-text-secondary">
            Keep me signed in
          </span>
        </label>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>
    </div>
  );
}

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Full name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid work email";
    }
    if (form.password.length < 8) {
      next.password = "Use at least 8 characters";
    }
    if (form.password !== form.confirm) {
      next.confirm = "Passwords do not match";
    }
    if (!agree) next.agree = "Please accept the terms to continue";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1100));
    setLoading(false);
    toast({
      title: "Account created",
      description: "Welcome to Printoe — your dashboard is ready.",
      tone: "success",
    });
    router.push("/dashboard");
  };

  const strength =
    form.password.length === 0
      ? 0
      : form.password.length < 8
        ? 1
        : /[A-Z]/.test(form.password) && /[0-9]/.test(form.password)
          ? 3
          : 2;

  const strengthLabel = ["", "Weak", "Good", "Strong"][strength];
  const strengthColor = [
    "",
    "bg-danger",
    "bg-warning",
    "bg-success",
  ][strength];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            name="name"
            autoComplete="name"
            placeholder="Alex Morgan"
            value={form.name}
            onChange={set("name")}
            error={errors.name}
          />
          <Input
            label="Company"
            name="company"
            autoComplete="organization"
            placeholder="Optional"
            value={form.company}
            onChange={set("company")}
          />
        </div>

        <Input
          label="Work email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={set("email")}
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email}
        />

        <div className="space-y-2">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            value={form.password}
            onChange={set("password")}
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
          {form.password ? (
            <div className="space-y-1.5 px-0.5">
              <div className="flex gap-1">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "h-1.5 flex-1 rounded-full bg-border transition-colors",
                      strength >= level && strengthColor,
                    )}
                  />
                ))}
              </div>
              <p className="text-xs font-medium text-text-secondary">
                Password strength:{" "}
                <span className="font-semibold text-secondary">{strengthLabel}</span>
              </p>
            </div>
          ) : null}
        </div>

        <Input
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          name="confirm"
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={form.confirm}
          onChange={set("confirm")}
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.confirm}
        />

        <div className="space-y-1">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium leading-relaxed text-text-secondary">
              I agree to the{" "}
              <a href="#" className="font-semibold text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="font-semibold text-primary hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.agree ? (
            <p className="text-xs font-medium text-danger">{errors.agree}</p>
          ) : null}
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="text-center text-xs font-medium text-text-secondary">
        No credit card required · Free artwork review on every order
      </p>
    </div>
  );
}
