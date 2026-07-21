"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { testimonials } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Section";

const accentAvatars = [
  "bg-primary text-white",
  "bg-accent text-white",
  "bg-secondary text-white",
  "bg-brand-yellow text-secondary",
  "bg-primary/90 text-white",
  "bg-accent/90 text-white",
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating ? "fill-brand-yellow text-brand-yellow" : "text-border",
          )}
        />
      ))}
    </div>
  );
}

export function TestimonialsSlider() {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(testimonials.length / perPage);

  const go = useCallback(
    (dir: number) => {
      setPage((p) => {
        const next = p + dir;
        if (next < 0) return totalPages - 1;
        if (next >= totalPages) return 0;
        return next;
      });
    },
    [totalPages],
  );

  useEffect(() => {
    const timer = setInterval(() => go(1), 8000);
    return () => clearInterval(timer);
  }, [go]);

  const visible = testimonials.slice(page * perPage, page * perPage + perPage);

  return (
    <Section className="bg-secondary text-white overflow-hidden relative">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <Container className="relative">
        <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Testimonials
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Brands that print with Printoe
            </h2>
            <p className="mt-3 text-sm font-medium text-white/65 md:text-base">
              Real feedback from teams who trust us with packaging, marketing, and
              large-format print.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 md:gap-8">
            <div>
              <p className="text-3xl font-extrabold tracking-tight">4.9</p>
              <div className="mt-1 flex items-center gap-2">
                <Stars rating={5} />
                <span className="text-xs font-medium text-white/55">Avg rating</span>
              </div>
            </div>
            <div className="h-10 w-px bg-white/15 hidden sm:block" />
            <div>
              <p className="text-3xl font-extrabold tracking-tight">2,400+</p>
              <p className="mt-1 text-xs font-medium text-white/55">Verified reviews</p>
            </div>
            <div className="ml-auto flex gap-2 sm:ml-0">
              <Button
                variant="outline"
                size="icon"
                onClick={() => go(-1)}
                aria-label="Previous testimonials"
                className="border-white/20 bg-transparent text-white hover:bg-white hover:text-secondary"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => go(1)}
                aria-label="Next testimonials"
                className="border-white/20 bg-transparent text-white hover:bg-white hover:text-secondary"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {visible.map((t, i) => (
            <article
              key={t.id}
              className="group relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm transition hover:border-primary/40 hover:bg-white/[0.09]"
            >
              <Quote className="absolute right-5 top-5 h-8 w-8 text-primary/40" aria-hidden />
              <Stars rating={t.rating} />
              <blockquote className="mt-4 flex-1">
                <p className="text-[15px] font-medium leading-relaxed text-white/90">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </blockquote>
              <footer className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                    accentAvatars[(page * perPage + i) % accentAvatars.length],
                  )}
                  aria-hidden
                >
                  {t.avatar}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{t.name}</p>
                  <p className="truncate text-xs font-medium text-white/55">
                    {t.role} · {t.company}
                  </p>
                </div>
                <span className="ml-auto hidden rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/70 sm:inline">
                  {t.logo}
                </span>
              </footer>
            </article>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2" role="tablist" aria-label="Testimonial pages">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === page}
              aria-label={`Testimonials page ${i + 1}`}
              onClick={() => setPage(i)}
              className={cn(
                "h-2 rounded-full transition-all focus-ring",
                i === page ? "w-8 bg-primary" : "w-2 bg-white/25 hover:bg-white/50",
              )}
            />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-white/10 pt-8">
          <p className="w-full text-center text-xs font-semibold uppercase tracking-[0.12em] text-white/40 md:w-auto md:text-left">
            Trusted by
          </p>
          {testimonials.map((t) => (
            <span
              key={t.id}
              className="text-sm font-bold tracking-tight text-white/35 transition hover:text-white/70"
            >
              {t.logo}
            </span>
          ))}
        </div>
      </Container>
    </Section>
  );
}
