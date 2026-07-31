import Link from "next/link";
import { Container } from "@/components/ui/Section";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-secondary">
      {/* CMY brand atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 18% 30%, rgba(230,0,122,0.35), transparent 42%), radial-gradient(ellipse at 72% 25%, rgba(255,212,0,0.22), transparent 40%), radial-gradient(ellipse at 78% 70%, rgba(0,174,239,0.35), transparent 45%), linear-gradient(120deg, #1a1a1a 0%, #2a1520 45%, #102028 100%)",
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 70% 35%, rgba(255,255,255,0.2), transparent 35%)",
        }}
        aria-hidden
      />

      {/* Product mockups with logo CMY accents */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] lg:block" aria-hidden>
        <div className="absolute bottom-[12%] left-[8%] h-[42%] w-[22%] rotate-[-6deg] rounded-sm bg-gradient-to-br from-white to-slate-100 shadow-2xl">
          <div className="absolute inset-x-3 top-3 h-2 rounded-sm bg-primary" />
          <div className="absolute inset-x-3 top-8 space-y-1.5">
            <div className="h-1.5 w-4/5 rounded bg-slate-300" />
            <div className="h-1.5 w-3/5 rounded bg-slate-300" />
            <div className="h-1.5 w-2/3 rounded bg-slate-300" />
          </div>
        </div>
        <div className="absolute bottom-[10%] left-[28%] h-28 w-16 rounded-full bg-gradient-to-b from-accent to-[#0088bc] shadow-xl" />
        <div className="absolute bottom-[22%] left-[40%] h-14 w-14 rounded-full bg-brand-yellow shadow-lg" />
        <div className="absolute bottom-[18%] left-[48%] h-20 w-28 -rotate-6 rounded-md bg-gradient-to-br from-secondary to-black shadow-xl">
          <div className="absolute inset-x-3 top-4 h-6 rounded-sm bg-white/10" />
        </div>
        <div className="absolute bottom-[8%] right-[18%] h-[48%] w-[28%] rotate-3 rounded-sm bg-white shadow-2xl">
          <div className="absolute inset-3 rounded-sm bg-gradient-to-br from-[#fff0f7] to-[#eef9ff]">
            <div className="absolute inset-x-3 top-4 h-3 rounded bg-primary/80" />
            <div className="absolute inset-x-3 top-10 space-y-2">
              <div className="h-1.5 w-full rounded bg-slate-300" />
              <div className="h-1.5 w-5/6 rounded bg-slate-300" />
              <div className="h-1.5 w-4/6 rounded bg-slate-300" />
              <div className="mt-4 h-16 rounded bg-accent/20" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-[5%] right-[8%] h-[10%] rounded-t-[40%] bg-gradient-to-t from-[#8b6914]/90 to-[#c4a574]/70" />
      </div>

      <Container size="wide" className="relative">
        <div className="flex min-h-[340px] max-w-xl flex-col justify-center py-14 md:min-h-[400px] md:py-16 lg:min-h-[440px]">
          <div className="mb-5 h-1.5 w-24 rounded-full brand-cmy-bar" aria-hidden />
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            Print that looks Test
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
