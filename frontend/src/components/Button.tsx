import type { ComponentProps } from "react";
import { Link } from "react-router-dom";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

// ComponentProps incluye ref, para poder devolverle el foco al botón
interface ButtonProps extends ComponentProps<"button"> {
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

function buttonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  className: string,
) {
  return `inline-flex items-center justify-center gap-1.5 rounded border-2 border-dex-frame-dark transition focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-dex-accent focus-visible:ring-2 focus-visible:ring-white active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;
}

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
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}

interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: LinkButtonProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props} />
  );
}
