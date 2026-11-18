import { useId, type InputHTMLAttributes } from "react";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  optional?: boolean;
  error?: string | null;
};

export function Input({
  label,
  optional = false,
  error,
  className = "",
  "aria-describedby": describedBy,
  ...props
}: InputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const describedByIds = [describedBy, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-label font-bold text-ink">
        {label}
        {optional ? <span className="font-normal text-ink-muted"> (optional)</span> : null}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedByIds}
        className={`h-input w-full rounded-input border bg-surface-card px-4 text-body text-ink placeholder:text-ink-muted disabled:opacity-60 read-only:text-ink-muted ${error ? "border-danger" : "border-border-input"}`}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-caption text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
