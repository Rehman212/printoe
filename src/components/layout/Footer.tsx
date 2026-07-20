"use client";

import Link from "next/link";
import {
  AtSign,
  Globe,
  Link as LinkIcon,
  Mail,
  MapPin,
  Phone,
  Share2,
  Zap,
} from "lucide-react";
import { SITE, categories } from "@/lib/data";
import { Container } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

const columns = [
  {
    title: "Products",
    links: categories.slice(0, 6).map((c) => ({
      label: c.name,
      href: `/products?category=${c.slug}`,
    })),
  },
  {
    title: "Services",
    links: [
      { label: "Graphic Design", href: "/services" },
      { label: "Brand Identity", href: "/services" },
      { label: "Packaging Design", href: "/services" },
      { label: "Large Format", href: "/services" },
      { label: "Custom Printing", href: "/services" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Pressora", href: "/#why-us" },
      { label: "Careers", href: "/blog" },
      { label: "Press", href: "/blog" },
      { label: "Partners", href: "/services" },
      { label: "Contact", href: "/#newsletter" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Design Studio", href: "/editor" },
      { label: "Templates", href: "/editor" },
      { label: "Artwork Guidelines", href: "/blog" },
      { label: "Help Center", href: "/dashboard/support-tickets" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Accessibility", href: "#" },
    ],
  },
];

export function Footer() {
  const { toast } = useToast();
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-border bg-secondary text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <Container size="wide" className="relative py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-soft">
                <Zap className="h-5 w-5" fill="currentColor" />
              </span>
              <span className="text-xl font-bold">{SITE.name}</span>
            </Link>
            <p className="max-w-sm text-sm font-medium leading-relaxed text-slate-300">
              {SITE.description}
            </p>
            <div className="space-y-3 text-sm font-medium text-slate-300">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" />
                {SITE.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent" />
                {SITE.phone}
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {SITE.address}
              </p>
            </div>
            <div className="flex gap-2">
              {[Share2, Globe, LinkIcon, AtSign].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white focus-ring"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-sm font-bold tracking-wide text-white">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm font-medium text-slate-400 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h3 className="text-lg font-bold">Stay ahead of print trends</h3>
              <p className="mt-1 text-sm font-medium text-slate-300">
                Production tips, finish guides, and enterprise playbooks — monthly.
              </p>
            </div>
            <form
              className="flex w-full max-w-md gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                toast({
                  title: "You're subscribed",
                  description: "Expect thoughtful print insights in your inbox.",
                  tone: "success",
                });
              }}
            >
              <Input
                type="email"
                required
                placeholder="Work email"
                className="border-white/10 bg-white/10 text-white placeholder:text-slate-400"
                aria-label="Email for newsletter"
              />
              <Button type="submit" className="shrink-0">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-medium text-slate-400">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Visa
            </span>
            <span className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Mastercard
            </span>
            <span className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Amex
            </span>
            <span className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
              PayPal
            </span>
            <span className="rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
              FSC Certified
            </span>
            <span className="rounded-lg border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success">
              SOC 2
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
