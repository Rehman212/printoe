"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  cartApi,
  mapApiCartItem,
  type AddCartPayload,
} from "@/lib/cart-api";
import type { CartItem } from "@/types";

const GUEST_KEY = "printoe_guest_cart";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  loading: boolean;
  addItem: (payload: AddCartPayload) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadGuest(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGuest(items: CartItem[]) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items));
}

function guestId() {
  return `guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const res = await cartApi.get();
        setItems(res.data.items.map(mapApiCartItem));
      } else {
        setItems(loadGuest());
      }
    } catch {
      if (!isAuthenticated) setItems(loadGuest());
      else setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

  // On login: push guest cart items to API then clear guest
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    const guest = loadGuest();
    if (!guest.length) return;

    void (async () => {
      try {
        for (const g of guest) {
          await cartApi.add({
            productId: g.productId,
            name: g.name,
            image: g.image,
            quantity: g.quantity,
            unitPrice: g.unitPrice,
            size: g.size,
            material: g.material,
            finishing: g.finishing,
          });
        }
        localStorage.removeItem(GUEST_KEY);
        await refresh();
      } catch {
        /* keep guest until next login */
      }
    })();
  }, [authLoading, isAuthenticated, refresh]);

  const addItem = useCallback(
    async (payload: AddCartPayload) => {
      if (isAuthenticated) {
        const res = await cartApi.add(payload);
        setItems(res.data.items.map(mapApiCartItem));
        return;
      }

      setItems((prev) => {
        const match = prev.find(
          (i) =>
            i.name === payload.name &&
            (i.size || "") === (payload.size || "") &&
            (i.material || "") === (payload.material || "") &&
            (i.finishing || "") === (payload.finishing || "") &&
            i.unitPrice === payload.unitPrice,
        );
        let next: CartItem[];
        if (match) {
          next = prev.map((i) =>
            i.id === match.id
              ? { ...i, quantity: i.quantity + payload.quantity }
              : i,
          );
        } else {
          next = [
            {
              id: guestId(),
              productId: payload.productId ?? payload.productSlug ?? guestId(),
              name: payload.name,
              image: payload.image ?? "default",
              quantity: payload.quantity,
              unitPrice: payload.unitPrice,
              size: payload.size ?? "—",
              material: payload.material ?? "—",
              finishing: payload.finishing ?? "—",
            },
            ...prev,
          ];
        }
        saveGuest(next);
        return next;
      });
    },
    [isAuthenticated],
  );

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      const qty = Math.max(1, quantity);
      if (isAuthenticated) {
        const res = await cartApi.updateQty(id, qty);
        setItems(res.data.items.map(mapApiCartItem));
        return;
      }
      setItems((prev) => {
        const next = prev.map((i) =>
          i.id === id ? { ...i, quantity: qty } : i,
        );
        saveGuest(next);
        return next;
      });
    },
    [isAuthenticated],
  );

  const removeItem = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
        const res = await cartApi.remove(id);
        setItems(res.data.items.map(mapApiCartItem));
        return;
      }
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== id);
        saveGuest(next);
        return next;
      });
    },
    [isAuthenticated],
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      const res = await cartApi.clear();
      setItems(res.data.items.map(mapApiCartItem));
      return;
    }
    saveGuest([]);
    setItems([]);
  }, [isAuthenticated]);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      loading,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      refresh,
    }),
    [
      items,
      itemCount,
      subtotal,
      loading,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      refresh,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function useCartOptional() {
  return useContext(CartContext);
}
