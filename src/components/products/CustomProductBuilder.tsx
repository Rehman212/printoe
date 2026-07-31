"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, HelpCircle, Pencil, Upload } from "lucide-react";
import {
  BUILDER_FEATURES,
  BUILDER_FIELDS,
  type BuilderMode,
  defaultBuilderSelections,
  estimateBuilderPrice,
} from "@/lib/custom-printing-options";
import { cn, formatCurrency } from "@/lib/utils";
import { Breadcrumbs, Container, Section, StarRating } from "@/components/ui";
import { Tooltip } from "@/components/ui/Misc";

/** Official Custom Product Builder gallery (provided CDN heroes). */
const GALLERY = [
  "https://staticecp.uprinting.com/291/700x700/Custom_Product_Builder_A.jpg",
  "https://staticecp.uprinting.com/292/700x700/Custom%20Product%20Page_1400x1400.jpg",
];

export function CustomProductBuilder() {
  const [mode, setMode] = useState<BuilderMode>("offset");
  const [selections, setSelections] = useState(() =>
    defaultBuilderSelections("offset"),
  );
  const [activeThumb, setActiveThumb] = useState(0);

  const fields = useMemo(
    () =>
      BUILDER_FIELDS.filter((f) => !f.modes || f.modes.includes(mode)).filter(
        (f) =>
          f.key !== "holeLocation" ||
          (selections.holeDrilling && selections.holeDrilling !== "None"),
      ),
    [mode, selections.holeDrilling],
  );

  const price = estimateBuilderPrice(mode, selections);
  const unitPrice =
    Math.round((price / (Number(selections.quantity) || 250)) * 100) / 100;

  const setModeAndDefaults = (next: BuilderMode) => {
    setMode(next);
    setSelections(defaultBuilderSelections(next));
  };

  const query = new URLSearchParams({
    product: "custom-printing",
    mode,
    ...selections,
  }).toString();

  const activeImage = GALLERY[activeThumb] ?? GALLERY[0]!;

  return (
    <Section className="bg-white py-6 md:py-10">
      <Container size="wide">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Custom Printing" },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(520px,46%)] xl:grid-cols-[1fr_minmax(580px,48%)] lg:gap-10">
          {/* Left: media + features */}
          <div>
            <div className="relative overflow-hidden border border-border bg-[#f3f4f6]">
              <div className="relative aspect-square w-full max-w-xl">
                <Image
                  src={activeImage}
                  alt="Custom Product Builder — sample prints"
                  fill
                  priority
                  className="object-contain bg-[#f7f7f7]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              {GALLERY.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveThumb(i)}
                  className={cn(
                    "relative h-16 w-16 shrink-0 overflow-hidden border-2 bg-[#f3f4f6] sm:h-20 sm:w-20",
                    activeThumb === i
                      ? "border-primary"
                      : "border-border opacity-80 hover:opacity-100",
                  )}
                  aria-label={`View image ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>

            <ul className="mt-6 space-y-2.5">
              {BUILDER_FEATURES.map((text) => (
                <li
                  key={text}
                  className="flex items-start gap-2.5 text-sm text-text-secondary"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1b5e20]" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: calculator */}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-secondary md:text-3xl">
              Custom Product Builder
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <StarRating rating={4.8} reviews={291} size="md" />
              <span className="text-sm font-semibold text-secondary">
                From $0.15 each
              </span>
            </div>

            <div className="mt-5 border border-border bg-white p-4 shadow-soft sm:p-5">
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { id: "offset", label: "Offset" },
                    { id: "signs", label: "Signs" },
                  ] as const
                ).map((tab) => {
                  const active = mode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setModeAndDefaults(tab.id)}
                      className={cn(
                        "relative flex h-12 items-center justify-center border-2 text-sm font-bold transition focus-ring",
                        active
                          ? "border-[#1b5e20] bg-[#1b5e20]/5 text-secondary"
                          : "border-border text-text-secondary hover:border-border",
                      )}
                    >
                      {active ? (
                        <span className="absolute left-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#1b5e20] text-white">
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                      ) : null}
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 space-y-3.5">
                {fields.map((field) => (
                  <label key={field.key} className="block space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary">
                      {field.label}
                      <Tooltip content={field.helpText}>
                        <button
                          type="button"
                          className="text-text-secondary/70 hover:text-text-secondary"
                          aria-label={`Help: ${field.label}`}
                        >
                          <HelpCircle className="h-3.5 w-3.5" />
                        </button>
                      </Tooltip>
                    </span>
                    <select
                      value={selections[field.key] ?? field.options[0]?.value}
                      onChange={(e) =>
                        setSelections((s) => ({
                          ...s,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="h-11 w-full border border-border bg-white px-3 text-sm font-medium text-secondary outline-none focus:border-primary focus-ring"
                    >
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Estimated printing cost
                </p>
                <p className="mt-1 text-2xl font-extrabold text-[#1b5e20]">
                  {formatCurrency(price)}
                </p>
                <p className="mt-0.5 text-xs font-medium text-text-secondary">
                  {formatCurrency(unitPrice)} each · qty{" "}
                  {Number(selections.quantity || 250).toLocaleString()}
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-2.5">
                <Link
                  href={`/upload?${query}`}
                  className="inline-flex h-12 items-center justify-center gap-2 bg-[#1b5e20] text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#164e1a] focus-ring"
                >
                  <Upload className="h-4 w-4" />
                  Add to Cart
                </Link>
                <Link
                  href={`/editor?${query}`}
                  className="inline-flex h-12 items-center justify-center gap-2 border-2 border-secondary text-sm font-bold uppercase tracking-wider text-secondary transition hover:bg-secondary hover:text-white focus-ring"
                >
                  <Pencil className="h-4 w-4" />
                  Create Your Design Online
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
