import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/AuthForms";

export const metadata = {
  title: "Create Account",
  description: "Create your Printoe account and start ordering premium print in minutes.",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up Printoe in under a minute — quotes, orders, and designs in one dashboard."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
