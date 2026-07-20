import Link from "next/link";
import { Container } from "@/components/ui/Section";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#1e3a5f]">
      {/* Lifestyle / product stage background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(15,23,42,0.72) 0%, rgba(15,23,42,0.35) 42%, rgba(15,23,42,0.15) 100%), radial-gradient(ellipse at 70% 60%, #94a3b8 0%, #64748b 35%, #334155 70%, #1e293b 100%)",
        }}
        aria-hidden
      />

      {/* Soft “outdoor patio” light wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 75% 30%, rgba(255,255,255,0.35), transparent 40%), radial-gradient(circle at 60% 80%, rgba(148,163,184,0.5), transparent 45%)",
        }}
        aria-hidden
      />

      {/* Product mockups staged on “table” */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] lg:block" aria-hidden>
        <div className="absolute bottom-[12%] left-[8%] h-[42%] w-[22%] rotate-[-6deg] rounded-sm bg-gradient-to-br from-white to-slate-100 shadow-2xl">
          <div className="absolute inset-x-3 top-3 h-2 rounded-sm bg-primary/80" />
          <div className="absolute inset-x-3 top-8 space-y-1.5">
            <div className="h-1.5 w-4/5 rounded bg-slate-300" />
            <div className="h-1.5 w-3/5 rounded bg-slate-300" />
            <div className="h-1.5 w-2/3 rounded bg-slate-300" />
          </div>
        </div>
        <div className="absolute bottom-[10%] left-[28%] h-28 w-16 rounded-full bg-gradient-to-b from-sky-400 to-sky-600 shadow-xl" />
        <div className="absolute bottom-[18%] left-[42%] h-20 w-28 -rotate-6 rounded-md bg-gradient-to-br from-slate-800 to-slate-950 shadow-xl">
          <div className="absolute inset-x-3 top-4 h-6 rounded-sm bg-white/10" />
        </div>
        <div className="absolute bottom-[8%] right-[18%] h-[48%] w-[28%] rotate-3 rounded-sm bg-white shadow-2xl">
          <div className="absolute inset-3 rounded-sm bg-gradient-to-br from-blue-50 to-slate-100">
            <div className="absolute inset-x-3 top-4 h-3 rounded bg-primary/70" />
            <div className="absolute inset-x-3 top-10 space-y-2">
              <div className="h-1.5 w-full rounded bg-slate-300" />
              <div className="h-1.5 w-5/6 rounded bg-slate-300" />
              <div className="h-1.5 w-4/6 rounded bg-slate-300" />
              <div className="mt-4 h-16 rounded bg-primary/20" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-[5%] right-[8%] h-[10%] rounded-t-[40%] bg-gradient-to-t from-[#8b6914]/90 to-[#c4a574]/70" />
      </div>

      <Container size="wide" className="relative">
        <div className="flex min-h-[340px] max-w-xl flex-col justify-center py-14 md:min-h-[400px] md:py-16 lg:min-h-[440px]">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            Print that looks
            <br />
            as good as it sells.
          </h1>
          <p className="mt-4 max-w-md text-base font-medium text-white/90 md:text-lg">
            Custom business cards, packaging, banners, and marketing materials —
            produced with precision and delivered on time.
          </p>
          <div className="mt-8">
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center border-2 border-white px-8 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-white hover:text-secondary focus-ring"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
