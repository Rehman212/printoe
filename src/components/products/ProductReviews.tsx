"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  fetchProductReviews,
  submitProductReview,
  type ProductReviewItem,
} from "@/lib/reviews-api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

function StarsDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "h-4 w-4",
            n <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-border",
          )}
        />
      ))}
    </div>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="rounded p-0.5 focus-ring"
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            className={cn(
              "h-7 w-7 transition",
              n <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-border hover:text-amber-300",
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({
  slug,
  rating,
  reviewsCount,
  onStatsChange,
}: {
  slug: string;
  rating: number;
  reviewsCount: number;
  onStatsChange?: (stats: { rating: number; reviews: number }) => void;
}) {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState<ProductReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchProductReviews(slug);
      setItems(res.data.items);
      onStatsChange?.({
        rating: res.data.product.rating,
        reviews: res.data.product.reviews,
      });
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [slug, onStatsChange]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Sign in to leave a review.",
        tone: "warning",
      });
      return;
    }
    if (body.trim().length < 3) {
      toast({
        title: "Review too short",
        description: "Please write at least a few words.",
        tone: "warning",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await submitProductReview(slug, {
        rating: formRating,
        title: title.trim() || undefined,
        body: body.trim(),
        authorName: user?.name,
      });
      setItems((prev) => [res.data.review, ...prev]);
      onStatsChange?.({
        rating: res.data.product.rating,
        reviews: res.data.product.reviews,
      });
      setTitle("");
      setBody("");
      setFormRating(5);
      toast({
        title: "Thanks for your review!",
        description: "Rating and review count updated.",
        tone: "success",
      });
    } catch (err) {
      toast({
        title: "Could not submit review",
        description:
          err instanceof Error ? err.message : "Please try again.",
        tone: "danger",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-12 border-t border-border pt-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-secondary">Customer reviews</h2>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <StarsDisplay rating={Math.round(rating)} />
            <p className="text-sm font-semibold text-secondary">
              {rating.toFixed(1)} out of 5
            </p>
            <p className="text-sm text-text-secondary">
              {reviewsCount} review{reviewsCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-border/40"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-[#fafafa] px-4 py-8 text-center text-sm text-text-secondary">
              No reviews yet. Be the first to review this product.
            </p>
          ) : (
            items.map((r) => (
              <article
                key={r.id}
                className="rounded-xl border border-border bg-white p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <StarsDisplay rating={r.rating} />
                    <p className="text-sm font-bold text-secondary">
                      {r.authorName}
                    </p>
                  </div>
                  <time className="text-xs text-text-secondary">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </time>
                </div>
                {r.title ? (
                  <h3 className="mt-2 text-sm font-semibold text-secondary">
                    {r.title}
                  </h3>
                ) : null}
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                  {r.body}
                </p>
              </article>
            ))
          )}
        </div>

        <div className="h-fit rounded-xl border border-border bg-[#fafafa] p-5 lg:sticky lg:top-24">
          <h3 className="text-base font-bold text-secondary">Write a review</h3>
          <p className="mt-1 text-xs text-text-secondary">
            Your rating updates the product score and total review count.
          </p>

          {!isAuthenticated ? (
            <div className="mt-4 space-y-3 text-sm text-text-secondary">
              <p>Sign in to leave a review.</p>
              <Link href="/login">
                <Button className="w-full">Sign in</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-4 space-y-4">
              <div>
                <p className="mb-1.5 text-sm font-semibold text-secondary">
                  Your rating
                </p>
                <StarPicker value={formRating} onChange={setFormRating} />
              </div>
              <Input
                label="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Great quality!"
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-text-primary">
                  Review
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  required
                  minLength={3}
                  placeholder="Share your experience with this product…"
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium focus-ring"
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Submitting…" : "Submit review"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
