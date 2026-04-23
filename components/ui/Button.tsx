"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant =
  | "primary"
  | "gradient"
  | "ghost"
  | "secondary"
  | "danger"
  | "gold"; // alias legacy → gradient

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: "btn-primary",
  gradient: "btn-gradient",
  ghost: "btn-ghost",
  secondary: "btn-secondary",
  danger: "btn-danger",
  gold: "btn-gradient", // legacy
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, className, disabled, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={clsx(VARIANTS[variant], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="dot-spin" aria-hidden />}
      <span>{children}</span>
    </button>
  )
);
Button.displayName = "Button";
