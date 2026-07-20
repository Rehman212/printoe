import { cn } from "@/lib/utils";

const palettes: Record<string, [string, string, string]> = {
  "business-cards": ["#2563EB", "#93C5FD", "#DBEAFE"],
  brochures: ["#0F172A", "#64748B", "#E2E8F0"],
  banners: ["#06B6D4", "#67E8F9", "#CFFAFE"],
  stickers: ["#F59E0B", "#FCD34D", "#FEF3C7"],
  boxes: ["#7C3AED", "#C4B5FD", "#EDE9FE"],
  posters: ["#EF4444", "#FCA5A5", "#FEE2E2"],
  labels: ["#22C55E", "#86EFAC", "#DCFCE7"],
  promo: ["#2563EB", "#06B6D4", "#E0F2FE"],
  menus: ["#0F172A", "#94A3B8", "#F1F5F9"],
  "blog-1": ["#2563EB", "#1D4ED8", "#DBEAFE"],
  "blog-2": ["#0F172A", "#334155", "#F1F5F9"],
  "blog-3": ["#22C55E", "#06B6D4", "#ECFDF5"],
  "blog-4": ["#F59E0B", "#2563EB", "#FFFBEB"],
  default: ["#2563EB", "#06B6D4", "#E0F2FE"],
};

function CatalogMock({
  a,
  b,
  variant,
}: {
  a: string;
  b: string;
  variant: string;
}) {
  if (variant.includes("banner") || variant.includes("poster")) {
    return (
      <div
        className="h-[72%] w-[78%] rounded-sm shadow-md"
        style={{
          background: `linear-gradient(160deg, white, ${b}44)`,
          boxShadow: "0 8px 24px -8px rgb(15 23 42 / 0.25)",
        }}
      >
        <div className="h-full p-3">
          <div className="h-full rounded-sm" style={{ background: `${a}18` }}>
            <div
              className="mx-auto mt-[18%] h-2 w-1/2 rounded-full"
              style={{ background: a }}
            />
            <div className="mx-auto mt-3 h-1.5 w-2/3 rounded-full bg-slate-300" />
            <div className="mx-auto mt-2 h-1.5 w-1/2 rounded-full bg-slate-300" />
          </div>
        </div>
      </div>
    );
  }

  if (variant.includes("sticker") || variant.includes("label")) {
    return (
      <div className="relative flex h-full w-full items-center justify-center">
        <div
          className="h-24 w-24 rounded-full shadow-md"
          style={{
            background: `conic-gradient(from 200deg, ${a}, ${b}, white, ${a})`,
            boxShadow: "0 10px 20px -8px rgb(15 23 42 / 0.3)",
          }}
        />
        <div className="absolute h-16 w-16 rounded-full bg-white shadow-inner" />
        <div
          className="absolute h-8 w-8 rounded-full"
          style={{ background: a }}
        />
      </div>
    );
  }

  if (variant.includes("box") || variant.includes("packag")) {
    return (
      <div
        className="h-[55%] w-[62%] shadow-lg"
        style={{
          background: `linear-gradient(145deg, ${b}, white 40%, ${a}33)`,
          clipPath: "polygon(12% 0, 100% 0, 88% 100%, 0 100%)",
          boxShadow: "0 12px 28px -10px rgb(15 23 42 / 0.3)",
        }}
      />
    );
  }

  // Default: card / brochure style product photo
  return (
    <div
      className="h-[62%] w-[70%] rounded-sm bg-white shadow-md"
      style={{ boxShadow: "0 10px 28px -10px rgb(15 23 42 / 0.28)" }}
    >
      <div className="flex h-full flex-col p-3">
        <div
          className="mb-2 h-8 w-full rounded-sm"
          style={{ background: `linear-gradient(90deg, ${a}, ${b})` }}
        />
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-slate-200" />
          <div className="h-1.5 w-4/5 rounded-full bg-slate-200" />
          <div className="h-1.5 w-3/5 rounded-full bg-slate-200" />
        </div>
        <div
          className="mt-auto h-10 w-full rounded-sm"
          style={{ background: `${a}14` }}
        />
      </div>
    </div>
  );
}

export function ProductVisual({
  variant = "default",
  className,
  label,
  style = "default",
}: {
  variant?: string;
  className?: string;
  label?: string;
  style?: "default" | "catalog";
}) {
  const key =
    Object.keys(palettes).find((k) => variant.includes(k)) || "default";
  const [a, b, c] = palettes[key];

  if (style === "catalog") {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-[#f3f4f6]",
          className,
        )}
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
      >
        <CatalogMock a={a} b={b} variant={variant} />
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl", className)}
      style={{
        background: `linear-gradient(145deg, ${c} 0%, ${b}55 45%, ${a}22 100%)`,
      }}
      aria-hidden={!label}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <CatalogMock a={a} b={b} variant={variant} />
      </div>
    </div>
  );
}
