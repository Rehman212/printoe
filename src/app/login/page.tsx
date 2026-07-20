import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/AuthForms";

export const metadata = {
  title: "Sign In",
  description: "Sign in to your Printoe account to manage orders, quotes, and designs.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage orders, saved designs, invoices, and team access."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold text-primary hover:underline">
            Create one free
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
