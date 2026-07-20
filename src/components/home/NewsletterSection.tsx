"use client";

import { useState } from "react";
import { Mail, Sparkles } from "lucide-react";
import { SITE } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Container, Section } from "@/components/ui/Section";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <Section id="newsletter" className="pb-20 md:pb-28">
      <Container size="narrow">
        <div className="gradient-cta relative overflow-hidden rounded-2xl px-8 py-12 text-center shadow-card md:px-14 md:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            aria-hidden
          >
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-accent/40 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-lg space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              <Sparkles className="h-3.5 w-3.5" />
              Stay in the loop
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Get print tips from the {SITE.name} studio
            </h2>
            <p className="text-base font-medium leading-relaxed text-white/85">
              Monthly insights on paper stocks, campaign scaling, and production
              best practices—no spam, unsubscribe anytime.
            </p>

            {submitted ? (
              <p className="rounded-2xl bg-white/15 px-6 py-4 text-sm font-semibold text-white backdrop-blur-sm">
                Thanks for subscribing! Check your inbox for a welcome note.
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 sm:flex-row sm:items-start"
              >
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  className="flex-1 [&_input]:border-white/20 [&_input]:bg-white/95"
                  aria-label="Email address"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  className="shrink-0 bg-white text-primary hover:bg-white/90"
                >
                  Subscribe
                </Button>
              </form>
            )}

            <p className="text-xs font-medium text-white/60">
              Join 12,000+ brand marketers. Privacy-first—never sold.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
