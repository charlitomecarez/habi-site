import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "plain";

const byVariant: Record<Variant, string> = {
  primary: "h-button rounded-card bg-accent px-5 text-on-accent enabled:hover:bg-accent-strong",
  secondary:
    "h-button rounded-card border border-border-input bg-surface-card px-5 text-ink enabled:hover:bg-surface-muted",
  plain: "h-touch rounded-md px-3 text-accent enabled:hover:bg-surface-muted",
};

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
  loading?: boolean;
};

export function Button({
  children,
  variant = "primary",
  icon,
  loading = false,
  disabled,
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-3 text-body font-bold motion-safe:transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${byVariant[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden
          className="size-5 shrink-0 rounded-pill border-2 border-current border-t-transparent motion-safe:animate-spin"
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
