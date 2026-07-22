import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

export const metadata = {
  title: "Admin Login",
  description: "Printoe staff admin portal login.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
