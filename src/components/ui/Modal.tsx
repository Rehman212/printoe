"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  size = "md",
  bodyClassName,
  variant = "default",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  /** Sticky actions bar below the scrollable body */
  footer?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  bodyClassName?: string;
  /** Dark chrome for dense editors (e.g. product upload). */
  variant?: "default" | "dark";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-none w-[100vw] h-[100dvh] max-h-[100dvh] rounded-none sm:rounded-none",
  };

  const dark = variant === "dark";

  return (
    <AnimatePresence>
      {open ? (
        <div
          className={cn(
            "fixed inset-0 z-[80] flex justify-center",
            size === "full"
              ? "items-stretch p-0"
              : "items-end p-2 sm:items-center sm:p-3 lg:p-4",
          )}
        >
          <motion.button
            type="button"
            aria-label="Close dialog"
            className={cn(
              "absolute inset-0 backdrop-blur-sm",
              dark ? "bg-black/70" : "bg-secondary/40",
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            className={cn(
              "relative z-10 flex w-full flex-col overflow-hidden border shadow-card",
              dark
                ? "admin-product-shell border-zinc-800"
                : "border-border bg-card",
              size === "full" ? "max-h-[100dvh]" : "max-h-[96vh] rounded-2xl",
              sizes[size],
              className,
            )}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <div
              className={cn(
                "flex shrink-0 items-start justify-between gap-4 border-b px-5 py-4 sm:px-6 sm:py-5",
                dark ? "border-zinc-800 bg-[#12151c]" : "border-border",
              )}
            >
              <div>
                {title ? (
                  <h3
                    id="modal-title"
                    className={cn(
                      "text-lg font-bold sm:text-xl",
                      dark ? "text-zinc-100" : "text-text-primary",
                    )}
                  >
                    {title}
                  </h3>
                ) : null}
                {description ? (
                  <p
                    className={cn(
                      "mt-1 text-sm",
                      dark ? "text-zinc-400" : "text-text-secondary",
                    )}
                  >
                    {description}
                  </p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 shrink-0",
                  dark && "text-zinc-300 hover:bg-zinc-800 hover:text-white",
                )}
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto p-5 scrollbar-thin sm:p-6",
                dark && "bg-[#0f1117]",
                bodyClassName,
              )}
            >
              {children}
            </div>
            {footer ? (
              <div
                className={cn(
                  "shrink-0 border-t px-4 py-3 sm:px-6 sm:py-4",
                  dark
                    ? "border-zinc-800 bg-[#12151c]"
                    : "border-border bg-card",
                )}
              >
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
