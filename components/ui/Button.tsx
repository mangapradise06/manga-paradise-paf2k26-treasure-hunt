"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "ghost" | "gold" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: "btn-primary",
  ghost: "btn-ghost",
  gold: "btn-gold",
  danger:
    "btn bg-treasure-red text-parchment-light shadow-treasure hover:bg-[#a8301f]",
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
