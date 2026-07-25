"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Laptop,
  Lock,
  Shield,
  Smartphone,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { changePasswordRequest } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

function PasswordField({
  label,
  value,
  onChange,
  name,
  hint,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  name: string;
  hint?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <Input
      label={label}
      name={name}
      type={show ? "text" : "password"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      hint={hint}
      autoComplete={autoComplete}
      required
      rightIcon={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="text-text-secondary hover:text-text-primary"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  );
}

function strengthScore(password: string) {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

const STRENGTH_LABEL = ["Too short", "Weak", "Fair", "Good", "Strong", "Excellent"];

export function AccountSecurity() {
  const { user, refresh } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const score = strengthScore(newPassword);
  const lastChanged = useMemo(() => {
    if (!user?.passwordChangedAt) return "Not changed recently";
    const d = new Date(user.passwordChangedAt);
    return `Last changed ${d.toLocaleDateString()}`;
  }, [user?.passwordChangedAt]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Use at least 6 characters.",
        tone: "warning",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Confirm password must match the new password.",
        tone: "warning",
      });
      return;
    }
    setSaving(true);
    try {
      await changePasswordRequest({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await refresh();
      toast({
        title: "Password updated",
        description: "Your new password is saved in the database.",
        tone: "success",
      });
    } catch (err) {
      toast({
        title: "Could not update password",
        description: err instanceof Error ? err.message : "Please try again.",
        tone: "danger",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
            Account Security
          </h1>
          <p className="mt-1 text-sm font-medium text-text-secondary">
            Change your password, review sessions, and protect your Printoe account.
          </p>
        </div>
        <Link href="/dashboard/profile-settings">
          <Button variant="outline">Back to profile</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-start gap-3 p-4">
            <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-text-primary">Password</p>
              <p className="text-xs font-medium text-text-secondary">{lastChanged}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-3 p-4">
            <span className="rounded-xl bg-accent/10 p-2.5 text-accent">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-text-primary">Two-factor</p>
              <p className="text-xs font-medium text-text-secondary">
                {twoFactor ? "Enabled" : "Not enabled yet"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-3 p-4">
            <span className="rounded-xl bg-success/10 p-2.5 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-text-primary">Account</p>
              <p className="text-xs font-medium text-text-secondary">Email verified</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-bold text-text-primary">Change password</h2>
              <p className="text-xs font-medium text-text-secondary">
                Enter your current password, then choose a new one. Saved to the database.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-4">
            <PasswordField
              label="Current password"
              name="currentPassword"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
            <PasswordField
              label="New password"
              name="newPassword"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              hint="At least 6 characters. Mix letters, numbers, and symbols for a stronger password."
            />
            {newPassword ? (
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                  <span className="text-text-secondary">Strength</span>
                  <span
                    className={cn(
                      score <= 2 && "text-danger",
                      score === 3 && "text-warning",
                      score >= 4 && "text-success",
                    )}
                  >
                    {STRENGTH_LABEL[score]}
                  </span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 flex-1 rounded-full bg-border",
                        i < score && score <= 2 && "bg-danger",
                        i < score && score === 3 && "bg-warning",
                        i < score && score >= 4 && "bg-success",
                      )}
                    />
                  ))}
                </div>
              </div>
            ) : null}
            <PasswordField
              label="Confirm new password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="submit" loading={saving} className="gap-2">
                <KeyRound className="h-4 w-4" />
                Update password
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <Smartphone className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Two-factor authentication</h2>
              <p className="text-xs font-medium text-text-secondary">
                Add an authenticator app for an extra login step (coming soon — toggle saves locally).
              </p>
            </div>
          </div>
          <Badge variant={twoFactor ? "success" : "outline"}>
            {twoFactor ? "On" : "Off"}
          </Badge>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            type="button"
            variant={twoFactor ? "outline" : "primary"}
            onClick={() => {
              setTwoFactor((v) => !v);
              toast({
                title: twoFactor ? "2FA disabled (local)" : "2FA enabled (local)",
                description: "Full authenticator setup will be wired in a later update.",
                tone: "info",
              });
            }}
          >
            {twoFactor ? "Disable 2FA" : "Enable 2FA"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Laptop className="h-5 w-5 text-accent" />
            <div>
              <h2 className="text-lg font-bold text-text-primary">Active sessions</h2>
              <p className="text-xs font-medium text-text-secondary">
                Devices currently signed in to your account.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-text-primary">This browser</p>
              <p className="text-xs font-medium text-text-secondary">
                {user?.email || "Signed in"} · Current session
              </p>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
