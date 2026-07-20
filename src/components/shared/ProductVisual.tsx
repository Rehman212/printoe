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
  "blog-1": ["#2563EB", "#1D4ED8", "#DBEAFE"],
  "blog-2": ["#0F172A", "#334155", "#F1F5F9"],
  "blog-3": ["#22C55E", "#06B6D4", "#ECFDF5"],
  "blog-4": ["#F59E0B", "#2563EB", "#FFFBEB"],
  default: ["#2563EB", "#06B6D4", "#E0F2FE"],
};

export function ProductVisual({
  variant = "default",
  className,
  label,
}: {
  variant?: string;
  className?: string;
  label?: string;
}) {
  const key = Object.keys(palettes).find((k) => variant.includes(k)) || "default";
  const [a, b, c] = palettes[key];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        className,
      )}
      style={{
        background: `linear-gradient(145deg, ${c} 0%, ${b}55 45%, ${a}22 100%)`,
      }}
      aria-hidden={!label}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <div
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-60 blur-2xl"
        style={{ background: a }}
      />
      <div
        className="absolute -bottom-10 left-6 h-28 w-28 rounded-full opacity-40 blur-2xl"
        style={{ background: b }}
      />
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div
          className="relative h-[68%] w-[72%] rounded-xl shadow-card"
          style={{
            background: `linear-gradient(160deg, white 0%, ${c} 100%)`,
            boxShadow: `0 20px 40px -16px ${a}66`,
          }}
        >
          <div
            className="absolute inset-x-4 top-4 h-2 rounded-full opacity-80"
            style={{ background: a }}
          />
          <div className="absolute inset-x-4 top-10 space-y-2">
            <div className="h-1.5 w-4/5 rounded-full bg-slate-200" />
            <div className="h-1.5 w-3/5 rounded-full bg-slate-200" />
            <div className="h-1.5 w-2/3 rounded-full bg-slate-200" />
          </div>
          <div
            className="absolute bottom-4 right-4 h-10 w-10 rounded-lg opacity-90"
            style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
          />
        </div>
      </div>
      <div
        className="absolute bottom-3 left-3 right-3 h-px opacity-40"
        style={{ background: `linear-gradient(90deg, transparent, ${a}, transparent)` }}
      />
    </div>
  );
}
