import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import { Container, Section } from "@/components/ui/Section";
import { Breadcrumbs, Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Direct Mail",
  description:
    "Postcards, EDDM, and direct mail printing to reach customers where they live.",
};

const LINKS = [
  {
    title: "Postcards",
    description: "Standard and oversized postcards for campaigns and mailers.",
    href: "/products?category=postcards",
  },
  {
    title: "Every Door Direct Mail",
    description: "Reach every address on a route without buying a mailing list.",
    href: "/products?category=postcards",
  },
  {
    title: "Custom Quote",
    description: "Need a large mail drop or special finishing? Get a custom quote.",
    href: "/quote",
  },
];

export default function DirectMailPage() {
  return (
    <Section className="bg-white py-8 md:py-12">
      <Container size="wide">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Direct Mail" },
          ]}
        />

        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-secondary md:text-4xl">
            Direct Mail
          </h1>
          <p className="mt-3 text-base font-medium text-text-secondary md:text-lg">
            Put your offer in every mailbox. Print postcards and EDDM pieces with
            professional color and reliable turnaround.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
          {LINKS.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group border border-border bg-white p-5 transition hover:border-primary/40 hover:shadow-soft focus-ring"
            >
              <h2 className="text-base font-bold text-secondary group-hover:text-primary">
                {item.title}
              </h2>
              <p className="mt-2 text-sm font-medium text-text-secondary">
                {item.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Shop now
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/products?category=postcards">
            <Button size="lg" className="gap-2">
              Browse postcards
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/quote">
            <Button size="lg" variant="outline">
              Request a quote
            </Button>
          </Link>
        </div>
      </Container>
    </Section>
  );
}
