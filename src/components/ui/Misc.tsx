import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-2xl", className)} />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      {icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-bold text-text-primary">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm font-medium text-text-secondary">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm font-medium text-text-secondary">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {item.href ? (
              <a
                href={item.href}
                className="hover:text-primary focus-ring rounded-md"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-text-primary">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Tooltip({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-secondary px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-card transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {content}
      </span>
    </span>
  );
}

export function Select({
  label,
  options,
  value,
  onChange,
  className,
  placeholder = "Select…",
}: {
  label?: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      {label ? (
        <span className="text-sm font-semibold text-text-primary">{label}</span>
      ) : null}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium shadow-soft focus-ring",
          value ? "text-text-primary" : "text-text-secondary",
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ProgressSteps({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="flex w-full items-center gap-2">
      {steps.map((step, i) => {
        const active = i <= current;
        const currentStep = i === current;
        return (
          <li key={step} className="flex flex-1 flex-col gap-2">
            <div
              className={cn(
                "h-1.5 rounded-full transition-colors",
                active ? "bg-primary" : "bg-border",
              )}
            />
            <span
              className={cn(
                "hidden text-xs font-semibold sm:block",
                currentStep ? "text-primary" : "text-text-secondary",
              )}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function StarRating({
  rating,
  reviews,
  size = "sm",
}: {
  rating: number;
  reviews?: number;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="flex items-center gap-0.5"
        aria-label={`${rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.round(rating);
          return (
            <svg
              key={i}
              viewBox="0 0 20 20"
              className={cn(
                size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
                filled
                  ? "fill-warning text-warning"
                  : "fill-none stroke-warning text-warning",
              )}
              strokeWidth={filled ? 0 : 1.5}
              aria-hidden
            >
              <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z" />
            </svg>
          );
        })}
      </div>
      {typeof reviews === "number" ? (
        <span
          className={cn(
            "font-medium text-text-secondary",
            size === "md" ? "text-sm" : "text-xs",
          )}
        >
          <span className="font-semibold text-secondary">
            {rating.toFixed(1)}
          </span>{" "}
          ({reviews.toLocaleString()} {reviews === 1 ? "Review" : "Reviews"})
        </span>
      ) : (
        <span className="text-xs font-semibold text-text-primary">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
