import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Truck, Zap } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { SITE } from "@/lib/data";

const perks = [
  { icon: Zap, text: "Instant quotes & live pricing" },
  { icon: ShieldCheck, text: "Secure checkout & artwork review" },
  { icon: Truck, text: "Fast, tracked nationwide delivery" },
];

export function AuthShell({
  children,
  title,
  subtitle,
  footer,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-secondary lg:flex lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 20%, rgba(230,0,122,0.45), transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(255,212,0,0.22), transparent 45%), radial-gradient(ellipse at 70% 80%, rgba(0,174,239,0.35), transparent 45%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-14">
          <div className="inline-flex rounded-xl bg-white px-3 py-2">
            <Logo />
          </div>

          <div className="max-w-md space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                {SITE.tagline}
              </p>
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                Print that looks as good as it sells.
              </h2>
              <p className="text-base font-medium leading-relaxed text-slate-300">
                Join thousands of brands managing business cards, packaging,
                banners, and campaigns in one place.
              </p>
            </div>

            <ul className="space-y-4">
              {perks.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm font-semibold text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
            <p className="text-sm font-medium text-slate-200">
              Trusted by 84,000+ customers · 98.6% satisfaction rate
            </p>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <div className="flex flex-col bg-background">
        <div className="flex items-center justify-between border-b border-border bg-card px-5 py-4 lg:hidden">
          <Logo />
          <Link href="/" className="text-sm font-semibold text-primary hover:underline">
            Back to shop
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[420px]">
            <div className="mb-8 space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-secondary">
                {title}
              </h1>
              <p className="text-sm font-medium leading-relaxed text-text-secondary">
                {subtitle}
              </p>
            </div>

            {children}

            <div className="mt-8 text-center text-sm font-medium text-text-secondary">
              {footer}
            </div>

            <p className="mt-6 text-center text-xs font-medium text-text-secondary/80">
              <Link href="/" className="hidden text-primary hover:underline lg:inline">
                ← Back to Printoe
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
