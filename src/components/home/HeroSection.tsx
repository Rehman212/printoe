import Link from "next/link";
import { Container } from "@/components/ui/Section";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-secondary">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assests/images/newbghero.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        aria-hidden
      />

      {/* Left scrim so headline stays readable over the photo */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15"
        aria-hidden
      />

      <Container size="wide" className="relative">
        <div className="flex min-h-[340px] max-w-xl flex-col justify-center py-14 md:min-h-[400px] md:py-16 lg:min-h-[440px]">
          <div className="mb-5 h-1.5 w-24 rounded-full brand-cmy-bar" aria-hidden />
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            Print that looks (Demo Testing Build)
            <br />
            as good as it sells.
          </h1>
          <p className="mt-4 max-w-md text-base font-medium text-white/90 md:text-lg">
            Custom business cards, packaging, banners, and marketing materials —
            produced with precision and delivered on time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center bg-primary px-8 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-primary-hover focus-ring"
            >
              Shop Now
            </Link>
            <Link
              href="/quote"
              className="inline-flex h-12 items-center justify-center border-2 border-white px-8 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-white hover:text-secondary focus-ring"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
