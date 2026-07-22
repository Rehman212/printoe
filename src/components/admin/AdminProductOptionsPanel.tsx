"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Layers, RefreshCw } from "lucide-react";
import { fetchAdminProducts } from "@/lib/products-api";
import type { ProductDetailPayload } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

export function AdminProductOptionsPanel({
  refreshKey = 0,
}: {
  refreshKey?: number;
}) {
  const [items, setItems] = useState<ProductDetailPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminProducts();
      setItems(res.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load products from API. Sign in as admin first.",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [refreshKey]);

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-secondary">
            <Layers className="h-5 w-5 text-primary" />
            Flexible product options (API)
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Each product defines its own fields — Stickers ≠ Banners. Managed in
            Postgres via option groups.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={cnSpin(loading)} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-border/50" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-text-secondary">
            <p className="font-semibold text-secondary">API unavailable</p>
            <p className="mt-1">{error}</p>
            <p className="mt-2 text-xs">
              Ensure backend is running and you are logged in at{" "}
              <Link href="/admin/login" className="font-semibold text-primary hover:underline">
                /admin/login
              </Link>
              .
            </p>
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-text-secondary">No API products yet. Run the Prisma seed.</p>
        ) : (
          <div className="space-y-4">
            {items.map(({ product, options }) => (
              <div
                key={product.id}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-secondary">{product.name}</h3>
                      <Badge variant="outline">{product.category.name}</Badge>
                      <Badge variant="primary">{options.length} fields</Badge>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">
                      /products/{product.slug} · from{" "}
                      {formatCurrency(product.basePrice)}
                    </p>
                  </div>
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    View store page
                  </Link>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {options.map((g) => (
                    <div
                      key={g.id}
                      className="rounded-lg border border-border bg-card px-3 py-2"
                    >
                      <p className="text-xs font-bold text-secondary">
                        {g.label}{" "}
                        <span className="font-medium text-text-secondary">
                          ({g.uiType})
                        </span>
                      </p>
                      <p className="mt-0.5 max-w-xs truncate text-[11px] text-text-secondary">
                        {g.values.map((v) => v.label).join(" · ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function cnSpin(loading: boolean) {
  return loading ? "h-4 w-4 animate-spin" : "h-4 w-4";
}
