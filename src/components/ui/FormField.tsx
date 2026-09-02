import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ label, error, id, ...props }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted"
      >
        {label}
      </label>
      <input
        id={id}
        className="border border-sand bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-all duration-200 focus:border-ink focus:shadow-[0_0_0_3px_rgba(75,21,48,0.08)] disabled:bg-cream-soft disabled:text-ink-muted"
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="text-xs text-velvet">{error}</p>}
    </div>
  );
}
