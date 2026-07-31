"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  Layers,
  LayoutTemplate,
  Maximize2,
  PackageOpen,
  Palette,
  Printer,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { services, SITE } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Container, Section, SectionHeader } from "@/components/ui/Section";

const ICONS: Record<string, React.ReactNode> = {
  Palette: <Palette className="h-6 w-6" />,
  Sparkles: <Sparkles className="h-6 w-6" />,
  Layers: <Layers className="h-6 w-6" />,
  PackageOpen: <PackageOpen className="h-6 w-6" />,
  LayoutTemplate: <LayoutTemplate className="h-6 w-6" />,
  Printer: <Printer className="h-6 w-6" />,
  Maximize2: <Maximize2 className="h-6 w-6" />,
  Briefcase: <Briefcase className="h-6 w-6" />,
};

export function ServicesPage() {
  return (
    <>
      <Section className="gradient-hero pb-16 pt-16 md:pb-24 md:pt-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Creative services
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
              Design & production, unified
            </h1>
            <p className="mt-5 text-lg font-medium leading-relaxed text-text-secondary">
              {SITE.name} pairs award-winning creative with color-managed print production — so
              your brand looks flawless from screen to substrate.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/custom-printing">
                <Button size="lg" className="gap-2">
                  Custom Product Builder
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/quote">
                <Button size="lg" variant="outline">
                  Request a quote
                </Button>
              </Link>
              <Link href="/editor">
                <Button size="lg" variant="outline">
                  Open Design Studio
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <SectionHeader
            eyebrow="What we offer"
            title="End-to-end creative services"
            description="From identity systems to large-format displays — engineered for flawless reproduction."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card hover className="h-full">
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                      {ICONS[service.icon] ?? <Palette className="h-6 w-6" />}
                    </div>
                    <h3 className="text-lg font-bold text-text-primary">{service.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="pb-24">
        <Container>
          <Card className="gradient-cta overflow-hidden border-0 text-white">
            <CardContent className="flex flex-col items-center gap-6 p-10 text-center md:p-14">
              <h2 className="text-2xl font-bold md:text-3xl">
                Ready to elevate your print program?
              </h2>
              <p className="max-w-xl text-sm font-medium text-white/85 md:text-base">
                Talk to a specialist about multi-location rollouts, packaging, or campaign kits.
              </p>
              <Link href="/quote">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90"
                >
                  Get started
                </Button>
              </Link>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </>
  );
}
