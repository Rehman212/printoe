"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/Misc";
import {
  Container,
  Section,
  SectionHeader,
} from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

export function TestimonialsSlider() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = useCallback((dir: number) => {
    setDirection(dir);
    setIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return testimonials.length - 1;
      if (next >= testimonials.length) return 0;
      return next;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 7000);
    return () => clearInterval(timer);
  }, [paginate]);

  const current = testimonials[index];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <Section>
      <Container>
        <SectionHeader
          eyebrow="Testimonials"
          title="Trusted by brand teams worldwide"
          description="Real feedback from marketing leaders who print at scale with Pressora."
        />

        <div className="relative mx-auto max-w-4xl">
          <Card className="overflow-hidden p-8 md:p-12">
            <Quote
              className="absolute right-8 top-8 h-10 w-10 text-primary/15"
              aria-hidden
            />

            <div className="relative min-h-[220px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.blockquote
                  key={current.id}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <StarRating rating={current.rating} size="md" />
                  <p className="text-lg font-medium leading-relaxed text-text-primary md:text-xl">
                    &ldquo;{current.quote}&rdquo;
                  </p>
                  <footer className="flex items-center gap-4">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white"
                      aria-hidden
                    >
                      {current.avatar}
                    </span>
                    <div>
                      <cite className="not-italic">
                        <p className="text-sm font-bold text-text-primary">
                          {current.name}
                        </p>
                        <p className="text-sm font-medium text-text-secondary">
                          {current.role} · {current.company}
                        </p>
                      </cite>
                    </div>
                    <span className="ml-auto hidden rounded-xl bg-secondary/5 px-3 py-1.5 text-xs font-bold text-text-secondary sm:inline">
                      {current.logo}
                    </span>
                  </footer>
                </motion.blockquote>
              </AnimatePresence>
            </div>
          </Card>

          <div className="mt-6 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => paginate(-1)}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex gap-2" role="tablist" aria-label="Testimonials">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Testimonial from ${t.name}`}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className={cn(
                    "h-2 rounded-full transition-all focus-ring",
                    i === index
                      ? "w-8 bg-primary"
                      : "w-2 bg-border hover:bg-primary/40",
                  )}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => paginate(1)}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
