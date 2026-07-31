"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CreditCard,
  Download,
  FileText,
  Heart,
  LifeBuoy,
  Lock,
  MapPin,
  Palette,
  Receipt,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCartOptional } from "@/lib/cart-store";
import { ProductMedia } from "@/components/shared/ProductMedia";
import {
  createCustomerDesign,
  createCustomerTicket,
  deleteCustomerDesign,
  fetchCustomerDesigns,
  fetchCustomerDownloads,
  fetchCustomerInvoices,
  fetchCustomerNotifications,
  fetchCustomerQuotes,
  fetchCustomerTickets,
  fetchCustomerWishlist,
  removeCustomerWishlist,
} from "@/lib/customer-api";
import { updateProfileRequest } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/Toast";
import { ProfileSettings } from "@/components/dashboard/ProfileSettings";
import { AccountSecurity } from "@/components/dashboard/AccountSecurity";
import { OrdersPage } from "@/components/dashboard/OrdersPage";

const SECTION_META: Record<
  string,
  { title: string; description: string; icon: React.ReactNode }
> = {
  orders: {
    title: "Orders",
    description: "Track production, shipping, and delivery for all print jobs.",
    icon: <ShoppingBag className="h-6 w-6" />,
  },
  quotations: {
    title: "Quotations",
    description: "Review custom quotes for bulk or specialty runs.",
    icon: <FileText className="h-6 w-6" />,
  },
  "saved-designs": {
    title: "Saved Designs",
    description: "Designs you've created or uploaded in Design Studio.",
    icon: <Palette className="h-6 w-6" />,
  },
  downloads: {
    title: "Downloads",
    description: "Proofs, print-ready files, and production assets.",
    icon: <Download className="h-6 w-6" />,
  },
  invoices: {
    title: "Invoices",
    description: "Billing history generated from your orders.",
    icon: <Receipt className="h-6 w-6" />,
  },
  wishlist: {
    title: "Wishlist",
    description: "Products you've saved for later.",
    icon: <Heart className="h-6 w-6" />,
  },
  addresses: {
    title: "Addresses",
    description: "Shipping and billing address on your profile.",
    icon: <MapPin className="h-6 w-6" />,
  },
  "payment-methods": {
    title: "Payment Methods",
    description: "Pay securely at checkout for each order.",
    icon: <CreditCard className="h-6 w-6" />,
  },
  notifications: {
    title: "Notifications",
    description: "Order, quote, and support updates.",
    icon: <Bell className="h-6 w-6" />,
  },
  "support-tickets": {
    title: "Support Tickets",
    description: "Get help from our print specialists.",
    icon: <LifeBuoy className="h-6 w-6" />,
  },
  "profile-settings": {
    title: "Profile Settings",
    description: "Manage your personal and company information.",
    icon: <Settings className="h-6 w-6" />,
  },
  "team-management": {
    title: "Team Management",
    description: "Your account owner and company profile.",
    icon: <Users className="h-6 w-6" />,
  },
  "account-security": {
    title: "Account Security",
    description: "Password, two-factor authentication, and sessions.",
    icon: <Lock className="h-6 w-6" />,
  },
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
}

export function DashboardSection({ section }: { section: string }) {
  const meta = SECTION_META[section];
  const { user, refresh, setUserProfile } = useAuth();
  const cart = useCartOptional();
  const { toast } = useToast();

  const [quotes, setQuotes] = useState<
    Array<{
      id: string;
      product: string;
      qty: number;
      total: number;
      status: string;
      date: string;
    }>
  >([]);
  const [downloads, setDownloads] = useState<
    Array<{
      id: string;
      orderId: string;
      fileName: string;
      proofStatus: string;
      date: string;
    }>
  >([]);
  const [invoices, setInvoices] = useState<
    Array<{
      id: string;
      orderId: string;
      date: string;
      amount: number;
      status: string;
    }>
  >([]);
  const [wishlist, setWishlist] = useState<
    Array<{
      id: string;
      productId?: string | null;
      productSlug: string;
      name: string;
      imageUrl?: string | null;
      basePrice?: number | null;
    }>
  >([]);
  const [notifications, setNotifications] = useState<
    Array<{ id: string; title: string; read: boolean; createdAt: string }>
  >([]);
  const [tickets, setTickets] = useState<
    Array<{
      id: string;
      ticketNumber: string;
      subject: string;
      message: string;
      status: string;
      createdAt: string;
    }>
  >([]);
  const [designs, setDesigns] = useState<
    Array<{
      id: string;
      name: string;
      productName?: string | null;
      productSlug?: string | null;
      updatedAt: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [designName, setDesignName] = useState("");
  const [savingDesign, setSavingDesign] = useState(false);
  const [addressForm, setAddressForm] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const loadSection = useCallback(async () => {
    if (section === "orders") {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (section === "quotations") {
        const res = await fetchCustomerQuotes();
        setQuotes(res.data);
      } else if (section === "downloads") {
        const res = await fetchCustomerDownloads();
        setDownloads(res.data);
      } else if (section === "invoices") {
        const res = await fetchCustomerInvoices();
        setInvoices(res.data);
      } else if (section === "wishlist") {
        const res = await fetchCustomerWishlist();
        setWishlist(res.data);
      } else if (section === "notifications") {
        const res = await fetchCustomerNotifications();
        setNotifications(res.data);
      } else if (section === "support-tickets") {
        const res = await fetchCustomerTickets();
        setTickets(res.data);
      } else if (section === "saved-designs") {
        const res = await fetchCustomerDesigns();
        setDesigns(res.data);
      } else if (section === "addresses" && user) {
        setAddressForm({
          address: user.address || "",
          city: user.city || "",
          state: user.state || "",
          zip: user.zip || "",
          country: user.country || "",
        });
      }
    } catch (err) {
      toast({
        title: "Could not load data",
        description: err instanceof Error ? err.message : "Try again.",
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  }, [section, toast, user]);

  useEffect(() => {
    void loadSection();
  }, [loadSection]);

  async function saveAddress(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await updateProfileRequest(addressForm);
      if (res.data) setUserProfile(res.data);
      else await refresh();
      toast({ title: "Address saved", tone: "success" });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Try again.",
        tone: "danger",
      });
    }
  }

  async function openTicket(e: FormEvent) {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    try {
      await createCustomerTicket({
        subject: ticketSubject.trim(),
        message: ticketMessage.trim(),
      });
      setTicketSubject("");
      setTicketMessage("");
      toast({ title: "Ticket opened", tone: "success" });
      const res = await fetchCustomerTickets();
      setTickets(res.data);
    } catch (err) {
      toast({
        title: "Could not open ticket",
        description: err instanceof Error ? err.message : "Try again.",
        tone: "danger",
      });
    }
  }

  async function saveDesign(e: FormEvent) {
    e.preventDefault();
    if (!designName.trim() || savingDesign) return;
    setSavingDesign(true);
    try {
      const res = await createCustomerDesign({ name: designName.trim() });
      setDesignName("");
      setDesigns((prev) => [
        {
          id: res.data.id,
          name: res.data.name,
          productName: res.data.productName,
          updatedAt: res.data.updatedAt,
        },
        ...prev.filter((d) => d.id !== res.data.id),
      ]);
      toast({ title: "Design saved", tone: "success" });
    } catch (err) {
      toast({
        title: "Could not save design",
        description: err instanceof Error ? err.message : "Try again.",
        tone: "danger",
      });
    } finally {
      setSavingDesign(false);
    }
  }

  async function removeDesign(id: string) {
    try {
      await deleteCustomerDesign(id);
      setDesigns((prev) => prev.filter((d) => d.id !== id));
      toast({ title: "Design removed", tone: "success" });
    } catch (err) {
      toast({
        title: "Could not remove design",
        description: err instanceof Error ? err.message : "Try again.",
        tone: "danger",
      });
    }
  }

  if (!meta) {
    return (
      <EmptyState
        title="Section not found"
        description="This dashboard page doesn't exist yet."
        action={
          <Link href="/dashboard">
            <Button>Back to overview</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {section !== "profile-settings" && section !== "account-security" ? (
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
            {meta.title}
          </h1>
          <p className="mt-1 text-sm font-medium text-text-secondary">
            {meta.description}
          </p>
        </div>
      ) : null}

      {section === "orders" ? <OrdersPage /> : null}

      {loading && section !== "orders" ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-border/50" />
          ))}
        </div>
      ) : null}

      {!loading && section === "quotations" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm text-text-secondary">
              Quotes linked to your account
            </p>
            <Link href="/quote">
              <Button size="sm">Request quote</Button>
            </Link>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            {quotes.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-text-secondary">
                No quotes yet. Request one from the quote calculator.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/[0.02] text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    <th className="px-6 py-3">Quote</th>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Quantity</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q) => (
                    <tr
                      key={q.id}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="px-6 py-4 font-semibold">{q.id}</td>
                      <td className="px-6 py-4 text-text-secondary">
                        {q.product}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {q.qty.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            q.status === "approved"
                              ? "success"
                              : q.status === "pending"
                                ? "warning"
                                : "default"
                          }
                          className="capitalize"
                        >
                          {q.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {formatCurrency(q.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && section === "saved-designs" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-wrap items-end gap-3 p-5">
              <form onSubmit={saveDesign} className="flex flex-1 flex-wrap gap-3">
                <Input
                  label="Design name"
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  placeholder="Summer flyer v1"
                  className="min-w-[220px] flex-1"
                />
                <Button type="submit" className="mt-6" disabled={savingDesign}>
                  {savingDesign ? "Saving…" : "Save design"}
                </Button>
              </form>
              <Link href="/editor">
                <Button variant="outline" className="mt-6">
                  Open editor
                </Button>
              </Link>
            </CardContent>
          </Card>
          {designs.length === 0 ? (
            <EmptyState
              icon={meta.icon}
              title="No saved designs"
              description="Save a design name here or create one in Design Studio."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {designs.map((d) => (
                <Card key={d.id} hover>
                  <CardContent className="p-5">
                    <div className="mb-4 aspect-[1.75/1] rounded-xl bg-gradient-to-br from-primary/10 to-accent/10" />
                    <p className="font-bold text-text-primary">{d.name}</p>
                    <p className="text-xs text-text-secondary">
                      {d.productName || "Custom"} · Updated{" "}
                      {new Date(d.updatedAt).toLocaleDateString()}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={
                          d.productSlug
                            ? `/products/${d.productSlug}`
                            : "/editor"
                        }
                      >
                        <Button size="sm">Edit</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void removeDesign(d.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && section === "downloads" && (
        downloads.length === 0 ? (
          <EmptyState
            icon={meta.icon}
            title="No downloads yet"
            description="Artwork and proofs appear here after you upload files with an order."
          />
        ) : (
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {downloads.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                >
                  <div>
                    <p className="font-semibold text-text-primary">{d.fileName}</p>
                    <p className="text-xs text-text-secondary">
                      {d.orderId} · Proof {d.proofStatus} · {d.date}
                    </p>
                  </div>
                  <Badge className="capitalize">{d.proofStatus}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      )}

      {!loading && section === "invoices" && (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            {invoices.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-text-secondary">
                Invoices appear when you place orders.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/[0.02] text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    <th className="px-6 py-3">Invoice</th>
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="px-6 py-4 font-semibold">{inv.id}</td>
                      <td className="px-6 py-4 text-text-secondary">
                        {inv.orderId}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {inv.date}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            inv.status === "paid" ? "success" : "warning"
                          }
                          className="capitalize"
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {formatCurrency(inv.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && section === "wishlist" && (
        wishlist.length === 0 ? (
          <EmptyState
            icon={meta.icon}
            title="Your wishlist is empty"
            description="Save products from the catalog to compare options later."
            action={
              <Link href="/products">
                <Button>Browse products</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.map((w) => (
              <Card key={w.id} hover className="overflow-hidden">
                <CardContent className="flex h-full flex-col p-0">
                  <Link
                    href={`/products/${w.productSlug}`}
                    className="relative aspect-[5/4] w-full overflow-hidden border-b border-border bg-background"
                  >
                    <ProductMedia
                      imageUrl={w.imageUrl ?? undefined}
                      fallbackVariant={w.productSlug}
                      label={w.name}
                      className="h-full w-full"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-3">
                    <Link
                      href={`/products/${w.productSlug}`}
                      className="line-clamp-2 text-sm font-bold text-text-primary hover:text-primary"
                    >
                      {w.name}
                    </Link>
                    {w.basePrice != null ? (
                      <p className="mt-1 text-xs text-text-secondary">
                        from {formatCurrency(w.basePrice)}
                      </p>
                    ) : null}
                    <div className="mt-auto flex flex-col gap-1.5 pt-3">
                      <Button
                        size="sm"
                        className="w-full gap-1.5 text-xs"
                        onClick={() => {
                          if (!cart) {
                            toast({
                              title: "Cart unavailable",
                              tone: "warning",
                            });
                            return;
                          }
                          void cart
                            .addItem({
                              productId: w.productId ?? undefined,
                              productSlug: w.productSlug,
                              name: w.name,
                              imageUrl: w.imageUrl ?? undefined,
                              image: w.productSlug,
                              quantity: 1,
                              unitPrice: w.basePrice ?? 0,
                            })
                            .then(() =>
                              toast({
                                title: "Added to cart",
                                description: w.name,
                                tone: "success",
                              }),
                            )
                            .catch((err) =>
                              toast({
                                title: "Could not add to cart",
                                description:
                                  err instanceof Error
                                    ? err.message
                                    : "Try again",
                                tone: "danger",
                              }),
                            );
                        }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to cart
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Link href={`/products/${w.productSlug}`} className="block">
                          <Button size="sm" variant="outline" className="w-full">
                            Order
                          </Button>
                        </Link>
                        <Link href="/checkout" className="block">
                          <Button size="sm" variant="outline" className="w-full">
                            Checkout
                          </Button>
                        </Link>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full"
                        onClick={() =>
                          void removeCustomerWishlist(w.id)
                            .then(async () => {
                              const res = await fetchCustomerWishlist();
                              setWishlist(res.data);
                              toast({
                                title: "Removed from wishlist",
                                tone: "success",
                              });
                            })
                            .catch((err) =>
                              toast({
                                title: "Remove failed",
                                description:
                                  err instanceof Error
                                    ? err.message
                                    : "Try again",
                                tone: "danger",
                              }),
                            )
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {!loading && section === "addresses" && (
        <Card>
          <CardHeader>
            <p className="text-sm font-bold">Shipping address</p>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={saveAddress} className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Street address"
                value={addressForm.address}
                onChange={(e) =>
                  setAddressForm((f) => ({ ...f, address: e.target.value }))
                }
                className="sm:col-span-2"
              />
              <Input
                label="City"
                value={addressForm.city}
                onChange={(e) =>
                  setAddressForm((f) => ({ ...f, city: e.target.value }))
                }
              />
              <Input
                label="State"
                value={addressForm.state}
                onChange={(e) =>
                  setAddressForm((f) => ({ ...f, state: e.target.value }))
                }
              />
              <Input
                label="ZIP"
                value={addressForm.zip}
                onChange={(e) =>
                  setAddressForm((f) => ({ ...f, zip: e.target.value }))
                }
              />
              <Input
                label="Country"
                value={addressForm.country}
                onChange={(e) =>
                  setAddressForm((f) => ({ ...f, country: e.target.value }))
                }
              />
              <div className="sm:col-span-2">
                <Button type="submit">Save address</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!loading && section === "payment-methods" && (
        <EmptyState
          icon={meta.icon}
          title="Pay at checkout"
          description="Card and invoice options are selected when you place an order. Stored cards coming soon."
          action={
            <Link href="/products">
              <Button>Shop products</Button>
            </Link>
          }
        />
      )}

      {!loading && section === "notifications" && (
        notifications.length === 0 ? (
          <EmptyState
            icon={meta.icon}
            title="No notifications"
            description="Order and quote updates will show up here."
          />
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => (
              <Card key={n.id}>
                <CardContent className="flex items-center gap-3 p-4">
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {n.title}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {relativeTime(n.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ul>
        )
      )}

      {!loading && section === "support-tickets" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <p className="text-sm font-bold">Open a ticket</p>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <form onSubmit={openTicket} className="space-y-3">
                <Input
                  label="Subject"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Need help with artwork"
                />
                <label className="block text-sm font-semibold text-text-primary">
                  Message
                  <textarea
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    rows={3}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium focus-ring"
                  />
                </label>
                <Button type="submit">Submit ticket</Button>
              </form>
            </CardContent>
          </Card>
          {tickets.length === 0 ? (
            <EmptyState
              icon={meta.icon}
              title="No open tickets"
              description="Our specialists typically respond within 2 business hours."
            />
          ) : (
            <Card>
              <CardContent className="divide-y divide-border p-0">
                {tickets.map((t) => (
                  <div key={t.id} className="px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-text-primary">
                        {t.ticketNumber} · {t.subject}
                      </p>
                      <Badge className="capitalize">{t.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      {t.message}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {section === "profile-settings" && <ProfileSettings />}

      {section === "account-security" && <AccountSecurity />}

      {!loading && section === "team-management" && (
        <Card>
          <CardHeader>
            <p className="text-sm font-bold">Account owner</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-text-primary">
                  {user?.name || "You"}
                </p>
                <p className="text-xs text-text-secondary">{user?.email}</p>
              </div>
              <Badge>Owner</Badge>
            </div>
            <p className="mt-4 text-sm text-text-secondary">
              Team invites are coming soon. For now this account is the sole
              owner
              {user?.company ? ` for ${user.company}` : ""}.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
