"use client";

import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { categories } from "@/lib/data";
import { Container } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { Logo } from "@/components/shared/Logo";
import { useSiteSettings } from "@/components/settings/SiteSettingsProvider";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M14 13.5h2.5l.5-3H14V8.5c0-.9.2-1.5 1.6-1.5H17V4.1C16.7 4 15.7 4 14.6 4 12.1 4 10.5 5.5 10.5 8.2V10.5H8v3h2.5V20h3.5v-6.5z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm11 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6.94 8.5H4V20h2.94V8.5zM5.47 4A1.74 1.74 0 1 0 5.48 7.48 1.74 1.74 0 0 0 5.47 4zM20 20h-2.93v-5.6c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94V20H10.15V8.5h2.81v1.57h.04c.39-.74 1.35-1.52 2.78-1.52 2.97 0 3.52 1.96 3.52 4.5V20z" />
    </svg>
  );
}

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
    {
      href: site.social.facebook || "https://www.facebook.com/share/1DufBwMubg/",
      Icon: FacebookIcon,
      label: "Facebook",
    },
    {
      href: site.social.instagram || "https://www.instagram.com/_printoe",
      Icon: InstagramIcon,
      label: "Instagram",
    },
    {
      href: site.social.linkedin || "https://www.linkedin.com/company/printoe/",
      Icon: LinkedInIcon,
      label: "LinkedIn",
    },
  ];

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
                <a
                  href={`mailto:${site.email}`}
                  className="transition hover:text-white"
                >
                  {site.email}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent" />
                <a
                  href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}
                  className="transition hover:text-white"
                >
                  {site.phone}
                </a>
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
              {socialLinks.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
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
            © {new Date().getFullYear()} {site.name}. All rights reserved. Powered by{" "}
            <a
              href="https://aurexone.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 underline-offset-2 hover:text-white hover:underline"
            >
              Aurexone.com
            </a>
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assests/images/newpayment.png"
            alt="Accepted payment methods"
            className="h-8 w-auto max-w-full object-contain md:h-10"
          />
        </div>
      </Container>
    </footer>
  );
}
