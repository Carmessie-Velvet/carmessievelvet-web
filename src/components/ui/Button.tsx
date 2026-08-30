import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "solid" | "outline" | "outline-light";

const base =
  "inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-velvet";

const variants: Record<ButtonVariant, string> = {
  solid: "bg-ink text-cream-soft hover:bg-velvet",
  outline: "border border-ink text-ink hover:bg-ink hover:text-cream-soft",
  "outline-light":
    "border border-paper/80 text-paper hover:bg-paper hover:text-ink",
};

export function buttonClasses(variant: ButtonVariant = "solid", className = "") {
  return `${base} ${variants[variant]} ${className}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = "solid", className = "", ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, className)} {...props} />;
}
