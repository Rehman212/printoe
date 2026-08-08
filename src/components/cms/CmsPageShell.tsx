import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Container } from "@/components/ui/Section";
import { RichTextContent } from "@/components/ui/RichTextEditor";
import { cn } from "@/lib/utils";

export function CmsPageShell({
  title,
  eyebrow = "Printoe",
  description,
  backHref = "/",
  backLabel = "Home",
  meta,
  children,
  coverImage,
}: {
  title: string;
  eyebrow?: string;
  description?: string | null;
  backHref?: string;
  backLabel?: string;
  meta?: string | null;
  coverImage?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[70vh] bg-[#f3f4f7]">
      {/* Profile-style page header */}
      <div className="relative overflow-hidden border-b border-border bg-secondary text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-0 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute right-0 top-10 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-72 rounded-full bg-brand-yellow/15 blur-3xl" />
          <div className="brand-cmy-bar absolute inset-x-0 bottom-0 h-1 opacity-90" />
        </div>

        <Container className="relative py-10 md:py-14">
          <Link
            href={backHref}
            className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur transition hover:bg-white/15"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Link>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 max-w-3xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                {eyebrow}
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-[2.75rem] lg:leading-tight">
                {title}
              </h1>
              {description ? (
                <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-slate-300 md:text-base">
                  {description}
                </p>
              ) : null}
              {meta ? (
                <p className="mt-4 text-xs font-medium text-white/50">{meta}</p>
              ) : null}
            </div>

            <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-soft sm:flex">
              <FileText className="h-7 w-7 text-white/80" />
            </div>
          </div>
        </Container>
      </div>

      {/* Content card overlapping the header slightly */}
      <Container className="relative -mt-6 pb-16 md:-mt-8 md:pb-20">
        {coverImage ? (
          <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt=""
              className="max-h-[360px] w-full object-cover"
            />
          </div>
        ) : null}

        <article
          className={cn(
            "overflow-hidden rounded-2xl border border-border bg-card shadow-card",
            "px-5 py-8 sm:px-8 sm:py-10 md:px-12 md:py-12",
          )}
        >
          {children}
        </article>
      </Container>
    </div>
  );
}

export function CmsDocumentBody({ html }: { html: string }) {
  return (
    <RichTextContent
      html={html}
      className={cn(
        "!text-[#374151]",
        "[&_h1]:!mb-4 [&_h1]:!mt-0 [&_h1]:!text-left [&_h1]:!text-2xl [&_h1]:!font-extrabold md:[&_h1]:!text-3xl",
        "[&_h2]:!mb-3 [&_h2]:!mt-10 [&_h2]:!text-left [&_h2]:!text-xl [&_h2]:!font-bold",
        "[&_h3]:!mb-2 [&_h3]:!mt-8 [&_h3]:!text-left [&_h3]:!text-lg",
        "[&_p]:!mb-4 [&_p]:!text-[15px] [&_p]:!leading-7 md:[&_p]:!text-base md:[&_p]:!leading-8",
        "[&_ul]:!my-4 [&_ol]:!my-4",
        "[&_li]:!text-[15px] [&_li]:!leading-7",
        "[&_hr]:!my-8 [&_hr]:!border-border",
      )}
    />
  );
}
