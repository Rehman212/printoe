import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services } from "@/lib/data";
import { DynamicIcon } from "@/lib/icons";
import { Button } from "@/components/ui/Button";
import {
  Container,
  Section,
  SectionHeader,
} from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

export function ServicesSection() {
  return (
    <Section className="bg-background">
      <Container>
        <SectionHeader
          eyebrow="Creative services"
          title="Design & production under one roof"
          description="From brand identity to large-format installs—our studio team partners with your marketing org."
          align="left"
          action={
            <Link href="/services">
              <Button variant="outline" className="gap-2">
                Explore services
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Link
              key={service.id}
              href="/services"
              className="group focus-ring rounded-2xl"
            >
              <Card
                hover
                className="h-full p-6 transition-all duration-300 group-hover:border-accent/30"
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-110">
                  <DynamicIcon name={service.icon} className="h-5 w-5" />
                </span>
                <h3 className="text-base font-bold text-text-primary transition-colors group-hover:text-accent">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-text-secondary">
                  {service.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
