"use client";

import clsx from "clsx";
import { motion } from "framer-motion";

interface Props {
  value: number;
  total?: number;
  className?: string;
}

export function ProgressBar({ value, total = 10, className }: Props) {
  const pct = Math.min(100, Math.max(0, (value / total) * 100));
  return (
    <div className={clsx("w-full", className)}>
      <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-parchment-ink/70">
        <span>Progression</span>
        <span className="font-display text-base text-treasure-red">
          {value} / {total}
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full border border-parchment-ink/20 bg-parchment-light/70">
        <motion.div
          className="h-full bg-gradient-to-r from-treasure-gold via-[#ebc65c] to-treasure-gold"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
        />
      </div>
    </div>
  );
}
