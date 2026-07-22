"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Cloud,
  CloudUpload,
  FileText,
  FolderOpen,
  HardDrive,
  Upload,
  X,
} from "lucide-react";
import { useProductsOptional } from "@/lib/product-store";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Accordion,
  Button,
  Container,
  Section,
  useToast,
} from "@/components/ui";
import { Breadcrumbs } from "@/components/ui/Misc";

const ACCEPTED =
  "application/pdf,image/jpeg,image/png,image/tiff,image/svg+xml,application/zip,.pdf,.jpg,.jpeg,.png,.tif,.tiff,.eps,.ai,.psd,.svg,.zip,.doc,.docx";

const formatList =
  "PDF, JPG, JPEG, PSD, PNG, TIF, TIFF, EPS, Illustrator, DOCX, DOC, SVG, ZIP";

type UploadedFile = {
  name: string;
  size: number;
  type: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPreviewableImage(file: File) {
  return (
    file.type.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name)
  );
}

export function FileUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const inputId = useId();

  const slug = searchParams.get("product") ?? "";
  const size = searchParams.get("size") ?? "";
  const qty = searchParams.get("qty") ?? "";
  const material = searchParams.get("material") ?? "";
  const total = searchParams.get("total") ?? "";

  const productList = useProductsOptional().products;
  const product = productList.find((p) => p.slug === slug) ?? productList[0];

  const [file, setFile] = useState<UploadedFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [wantProof, setWantProof] = useState(false);
  const [tab, setTab] = useState<"specs" | "proofing" | "learning">("specs");
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const productLabel = useMemo(() => {
    const parts = [size || product.sizes[0], product.name].filter(Boolean);
    return parts.join(" ");
  }, [product, size]);

  const clearPreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
  }, []);

  useEffect(() => {
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const removeFile = useCallback(() => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    setUploading(false);
    setProgress(0);
    setFile(null);
    clearPreview();
  }, [clearPreview]);

  const onFiles = useCallback(
    (list: FileList | null) => {
      const f = list?.[0];
      if (!f) return;
      if (f.size > 200 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum upload size is 200 MB.",
          tone: "warning",
        });
        return;
      }

      if (progressTimer.current) clearInterval(progressTimer.current);
      clearPreview();

      setFile({ name: f.name, size: f.size, type: f.type || "file" });
      setUploading(true);
      setProgress(0);

      let value = 0;
      progressTimer.current = setInterval(() => {
        value += Math.random() * 18 + 8;
        if (value >= 100) {
          value = 100;
          if (progressTimer.current) clearInterval(progressTimer.current);
          setProgress(100);
          setUploading(false);

          if (isPreviewableImage(f)) {
            const url = URL.createObjectURL(f);
            previewUrlRef.current = url;
            setPreviewUrl(url);
          }

          toast({
            title: "Upload complete",
            description: `${f.name} (${formatBytes(f.size)})`,
            tone: "success",
          });
        } else {
          setProgress(Math.floor(value));
        }
      }, 120);
    },
    [clearPreview, toast],
  );

  const canContinue = Boolean(file && !uploading);

  const continueCheckout = () => {
    if (!file || uploading) return;
    router.push(
      `/checkout?product=${product.slug}&file=${encodeURIComponent(file.name)}`,
    );
  };

  return (
    <Section className="bg-white py-8 md:py-10">
      <Container size="wide">
        <Breadcrumbs
          items={[
            { label: "Online Printing", href: "/" },
            {
              label: product.category
                .split("-")
                .map((w) => w[0].toUpperCase() + w.slice(1))
                .join(" "),
              href: `/products?category=${product.category}`,
            },
            { label: product.name, href: `/products/${product.slug}` },
            { label: "Upload" },
          ]}
        />

        <div className="mt-2 border border-border bg-white p-5 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-secondary md:text-3xl">
            File Upload{" "}
            <span className="font-semibold text-text-secondary">{productLabel}</span>
          </h1>

          {(qty || material || total) && (
            <p className="mt-2 text-sm text-text-secondary">
              {qty ? `${Number(qty).toLocaleString()} qty` : null}
              {material ? ` · ${material}` : null}
              {total ? ` · Est. ${formatCurrency(Number(total))}` : null}
            </p>
          )}

          {/* Hidden file input — opened via label htmlFor (most reliable) */}
          <input
            id={inputId}
            type="file"
            accept={ACCEPTED}
            className="pointer-events-none absolute h-px w-px opacity-0"
            tabIndex={-1}
            onChange={(e) => {
              onFiles(e.target.files);
              e.target.value = "";
            }}
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            {/* Left — artwork upload */}
            <div>
              <p className="mb-3 text-sm font-bold text-secondary">
                Front Side Artwork
              </p>

              <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                {/* Drop zone — also clickable */}
                <label
                  htmlFor={inputId}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    onFiles(e.dataTransfer.files);
                  }}
                  className={cn(
                    "relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed text-center transition",
                    dragging
                      ? "border-primary bg-primary/5"
                      : "border-[#c5c9d1] bg-[#f5f6f8] hover:border-primary/50 hover:bg-primary/[0.03]",
                    canContinue && "border-success bg-white hover:border-success",
                    uploading && "border-primary bg-primary/[0.03]",
                  )}
                >
                  {uploading && file ? (
                    <div className="w-full max-w-sm px-6 py-8">
                      <CloudUpload className="mx-auto h-10 w-10 animate-pulse text-primary" />
                      <p className="mt-3 truncate text-sm font-bold text-secondary">
                        Uploading {file.name}
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {progress}% · {formatBytes(file.size)}
                      </p>
                      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[#e4e7ec]">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : canContinue && file && previewUrl ? (
                    <div className="flex h-full w-full flex-col">
                      <div className="relative flex min-h-[180px] flex-1 items-center justify-center bg-[#eceef2] p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrl}
                          alt={`Preview of ${file.name}`}
                          className="max-h-[220px] max-w-full object-contain"
                        />
                        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-success px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          <CheckCircle2 className="h-3 w-3" />
                          Ready
                        </span>
                      </div>
                      <div className="border-t border-border bg-white px-3 py-2.5">
                        <p className="truncate text-sm font-bold text-secondary">
                          {file.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {formatBytes(file.size)} · Click to replace
                        </p>
                      </div>
                    </div>
                  ) : canContinue && file ? (
                    <div className="px-4 py-10">
                      <FileText className="mx-auto h-12 w-12 text-primary" />
                      <p className="mt-3 max-w-[90%] truncate text-sm font-bold text-secondary">
                        {file.name}
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {formatBytes(file.size)} · Click to replace
                      </p>
                      <p className="mt-2 text-[11px] font-medium text-success">
                        Upload complete
                      </p>
                    </div>
                  ) : (
                    <div className="px-4 py-10">
                      <CloudUpload
                        className="mx-auto h-14 w-14 text-[#9aa0a8]"
                        strokeWidth={1.25}
                      />
                      <p className="mt-3 text-sm font-medium text-text-secondary">
                        Click or drag a file here
                      </p>
                      <p className="mt-1 text-xs text-text-secondary/80">
                        PDF, PNG, JPG, AI, PSD up to 200 MB
                      </p>
                    </div>
                  )}
                </label>

                {/* Action buttons */}
                <div className="flex flex-col gap-3">
                  <label
                    htmlFor={inputId}
                    className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold uppercase tracking-wide text-white shadow-soft transition hover:bg-primary-hover active:scale-[0.98]"
                  >
                    <Upload className="h-4 w-4" />
                    Upload from Computer
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      toast({
                        title: "No recent files",
                        description: "Upload a file from your computer first.",
                        tone: "info",
                      })
                    }
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-primary bg-white px-4 text-sm font-bold uppercase tracking-wide text-primary transition hover:bg-primary/5 active:scale-[0.98]"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Recent Files
                  </button>

                  {file ? (
                    <button
                      type="button"
                      onClick={removeFile}
                      className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-border text-sm font-semibold text-danger transition hover:bg-danger/5"
                    >
                      <X className="h-4 w-4" /> Remove file
                    </button>
                  ) : null}

                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Or import from
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { name: "Dropbox", icon: Cloud, color: "text-[#0061FF]" },
                      { name: "Google Drive", icon: HardDrive, color: "text-[#34A853]" },
                      { name: "OneDrive", icon: Cloud, color: "text-[#0078D4]" },
                    ].map(({ name, icon: Icon, color }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() =>
                          toast({
                            title: name,
                            description: `${name} connection is demo-only for now.`,
                            tone: "info",
                          })
                        }
                        className="flex h-10 items-center gap-2.5 rounded-lg border border-border bg-white px-3 text-left text-sm font-semibold text-secondary transition hover:border-primary/35 hover:bg-[#fafafa]"
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", color)} />
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right — proofing */}
            <div className="rounded-lg border border-border bg-[#fafafa] p-5 sm:p-6">
              <h2 className="text-lg font-bold text-secondary">
                Select a Proofing Option
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Your files get a free 33-point review for technical print quality
                before we start production.
              </p>

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-white p-4">
                <input
                  type="checkbox"
                  checked={wantProof}
                  onChange={(e) => setWantProof(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[var(--primary)]"
                />
                <span className="text-sm font-medium text-secondary">
                  Please send me a PDF proof for approval before printing.{" "}
                  <span className="text-text-secondary">(May cause delays)</span>
                </span>
              </label>

              <Button
                size="lg"
                className="mt-6 h-12 w-full rounded-xl uppercase tracking-wide"
                disabled={!canContinue}
                onClick={continueCheckout}
              >
                Continue
              </Button>

              {uploading ? (
                <p className="mt-3 text-center text-xs text-text-secondary">
                  Uploading… {progress}%
                </p>
              ) : !canContinue ? (
                <p className="mt-3 text-center text-xs text-text-secondary">
                  Upload artwork to enable Continue
                </p>
              ) : (
                <p className="mt-3 text-center text-xs font-semibold text-success">
                  Artwork ready — click Continue
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Specs tabs */}
        <div className="mt-10">
          <div className="flex gap-6 border-b border-border">
            {(
              [
                ["specs", "File Specifications"],
                ["proofing", "Proofing"],
                ["learning", "Learning Center"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "border-b-2 pb-3 text-sm font-semibold transition",
                  tab === id
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-secondary",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="py-6">
            {tab === "specs" && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <h3 className="text-base font-bold text-secondary">
                    What are the recommended file formats?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {formatList}.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-bold text-secondary">
                    What is the maximum allowed file size to upload?
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    Up to 200 MB per file. For larger packages, ZIP your assets.
                  </p>
                </div>
                <Accordion
                  items={[
                    {
                      id: "bleed",
                      title: "Do I need bleed on my artwork?",
                      content:
                        "Yes — add 0.125\" (3mm) bleed on all sides and keep critical text 0.125\" inside the trim line.",
                    },
                    {
                      id: "color",
                      title: "What color mode should I use?",
                      content:
                        "CMYK is preferred for print. RGB files are accepted and converted during preflight.",
                    },
                  ]}
                />
              </div>
            )}

            {tab === "proofing" && (
              <div className="max-w-2xl space-y-3 text-sm text-text-secondary">
                <p>
                  Every order includes a complimentary technical review. Optional
                  PDF proofs let you approve color and layout before we print.
                </p>
                <p>
                  Selecting a PDF proof may add 1 business day to your schedule.
                </p>
              </div>
            )}

            {tab === "learning" && (
              <div className="max-w-2xl space-y-3 text-sm text-text-secondary">
                <p className="inline-flex items-center gap-2 font-semibold text-secondary">
                  <FileText className="h-4 w-4 text-primary" /> Quick tips
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Export fonts as outlines when possible</li>
                  <li>Use 300 DPI images at final size</li>
                  <li>Flatten transparency in PDF/X-1a when available</li>
                </ul>
                <Link
                  href="/blog"
                  className="inline-block font-semibold text-primary hover:underline"
                >
                  Browse print tips on our blog →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Link
            href={`/products/${product.slug}`}
            className="text-sm font-semibold text-primary hover:underline"
          >
            ← Back to product options
          </Link>
        </div>
      </Container>
    </Section>
  );
}
