import clsx from "clsx";
import type { HTMLAttributes } from "react";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("card", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={clsx(
        "mb-2 font-display text-2xl text-parchment-ink",
        className
      )}
      {...props}
    />
  );
}

export function CardSub({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={clsx("text-sm text-parchment-ink/70", className)}
      {...props}
    />
  );
}
