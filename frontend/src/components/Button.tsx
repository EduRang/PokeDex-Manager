import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-dex-ink text-white pixel-shadow-ink shadow-[inset_0_-4px_0_0_var(--color-dex-ink-dark)] hover:bg-dex-select",
  secondary:
    "bg-white text-dex-text shadow-[inset_0_-4px_0_0_#c9cdd6] hover:bg-[#eef1f5]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 pt-1 pb-1.5",
  md: "px-4 pt-1.5 pb-2.5",
  lg: "px-6 pt-2.5 pb-3.5",
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded border-2 border-dex-frame-dark transition focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-dex-accent focus-visible:ring-2 focus-visible:ring-white active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  );
}
