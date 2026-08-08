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
} from "lucide-react";
import { categories } from "@/lib/data";
import { Container } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { Logo } from "@/components/shared/Logo";
import { useSiteSettings } from "@/components/settings/SiteSettingsProvider";

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
      { label: "Custom Printing", href: "/custom-printing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Printoe", href: "/#why-us" },
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
      { label: "Custom Product Builder", href: "/custom-printing" },
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
  const site = useSiteSettings();
  const socialLinks = [
    { href: site.social.instagram, Icon: Share2, label: "Instagram" },
    { href: site.social.facebook, Icon: Globe, label: "Facebook" },
    { href: site.social.linkedin, Icon: LinkIcon, label: "LinkedIn" },
    { href: site.social.twitter, Icon: AtSign, label: "X / Twitter" },
    { href: site.social.youtube, Icon: AtSign, label: "YouTube" },
  ].filter((l) => Boolean(l.href));

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-border bg-secondary text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assests/images/footerbg.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#0b1220]/92 via-[#0b1220]/80 to-[#0b1220]/55"
        aria-hidden
      />

      <Container size="wide" className="relative py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="space-y-6">
            <div className="inline-flex rounded-lg bg-white px-2 py-1">
              <Logo />
            </div>
            <p className="max-w-sm text-sm font-medium leading-relaxed text-slate-300">
              {site.description}
            </p>
            <div className="space-y-3 text-sm font-medium text-slate-300">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" />
                {site.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent" />
                {site.phone}
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {site.address}
              </p>
              {site.businessHours ? (
                <p className="flex items-center gap-2 text-slate-400">
                  <span className="inline-block h-4 w-4 shrink-0 text-center text-[10px] font-bold text-accent">
                    ⏱
                  </span>
                  {site.businessHours}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2">
              {(socialLinks.length
                ? socialLinks
                : [
                    { href: "#", Icon: Share2, label: "Social" },
                    { href: "#", Icon: Globe, label: "Web" },
                    { href: "#", Icon: LinkIcon, label: "Link" },
                    { href: "#", Icon: AtSign, label: "Contact" },
                  ]
              ).map(({ href, Icon, label }, i) => (
                <a
                  key={`${label}-${i}`}
                  href={href || "#"}
                  target={href && href !== "#" ? "_blank" : undefined}
                  rel={href && href !== "#" ? "noopener noreferrer" : undefined}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white focus-ring"
                  aria-label={label}
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
            © {new Date().getFullYear()} {site.name}. All rights reserved.
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
