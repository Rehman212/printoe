import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full space-y-1.5">
        {label ? (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-text-primary"
          >
            {label}
          </label>
        ) : null}
        <div className="relative">
          {leftIcon ? (
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-text-secondary">
              {leftIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium text-text-primary placeholder:text-text-secondary/70 shadow-soft transition-all focus-ring focus:border-primary/50",
              leftIcon && "pl-11",
              rightIcon && "pr-11",
              error && "border-danger focus:border-danger",
              className,
            )}
            {...props}
          />
          {rightIcon ? (
            <span className="absolute inset-y-0 right-3.5 flex items-center text-text-secondary">
              {rightIcon}
            </span>
          ) : null}
        </div>
        {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
        {!error && hint ? (
          <p className="text-xs text-text-secondary">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
