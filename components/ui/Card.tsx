import clsx from "clsx";
import type { HTMLAttributes } from "react";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("mp-card", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={clsx(
        "mb-2 font-display italic text-2xl text-mp-ink",
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
      className={clsx("text-sm text-mp-ink-soft", className)}
      {...props}
    />
  );
}
