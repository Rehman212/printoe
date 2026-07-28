"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "info" | "warning" | "danger";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
};

type ToastContextValue = {
  toast: (item: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  danger: XCircle,
};

const tones: Record<ToastTone, string> = {
  success: "border-success/40 bg-white text-success",
  info: "border-primary/40 bg-white text-primary",
  warning: "border-warning/40 bg-white text-warning",
  danger: "border-danger/40 bg-white text-danger",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((item: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setItems((prev) => {
      // Keep only the latest toast so repeated clicks don't stack
      return [{ ...item, id }];
    });
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:top-6 sm:right-6">
        <AnimatePresence>
          {items.map((item) => {
            const Icon = icons[item.tone || "info"];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -16, x: 12 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: -8, x: 12 }}
                className={cn(
                  "pointer-events-auto flex gap-3 rounded-2xl border-2 bg-white p-4 shadow-lg ring-1 ring-black/5",
                  tones[item.tone || "info"],
                )}
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-primary">{item.title}</p>
                  {item.description ? (
                    <p className="mt-0.5 text-xs font-medium text-text-secondary">
                      {item.description}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="text-text-secondary hover:text-text-primary"
                  onClick={() =>
                    setItems((prev) => prev.filter((t) => t.id !== item.id))
                  }
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
