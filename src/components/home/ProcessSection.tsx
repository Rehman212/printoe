"use client";

import { motion } from "framer-motion";
import { processSteps } from "@/lib/data";
import { DynamicIcon } from "@/lib/icons";
import {
  Container,
  Section,
  SectionHeader,
} from "@/components/ui/Section";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function ProcessSection() {
  return (
    <Section className="bg-background">
      <Container>
        <SectionHeader
          eyebrow="How it works"
          title="From idea to doorstep in six steps"
          description="A streamlined workflow designed for speed without sacrificing print quality."
        />

        <motion.ol
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        >
          <div
            className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent xl:block"
            aria-hidden
          />
          {processSteps.map((step, index) => (
            <motion.li
              key={step.title}
              variants={item}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card shadow-soft">
                <DynamicIcon name={step.icon} className="h-7 w-7 text-primary" />
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-sm font-bold text-text-primary">{step.title}</h3>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-text-secondary">
                {step.description}
              </p>
            </motion.li>
          ))}
        </motion.ol>
      </Container>
    </Section>
  );
}
