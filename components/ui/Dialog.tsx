"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  closeLabel?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  className,
  closeLabel = "Fermer",
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus trap minimaliste + ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // focus initial
    const t = setTimeout(() => {
      panelRef.current?.focus();
    }, 20);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-parchment-ink/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className={clsx(
              "parchment-panel relative z-10 w-full max-w-lg overflow-hidden p-6 outline-none sm:p-8",
              className
            )}
          >
            <button
              aria-label={closeLabel}
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full p-1.5 text-parchment-ink/60 hover:bg-parchment-ink/10 hover:text-parchment-ink"
            >
              <X className="h-5 w-5" />
            </button>
            {(title || subtitle) && (
              <div className="mb-4 pr-6">
                {title && (
                  <h2 className="font-display text-xl text-treasure-red sm:text-2xl">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="mt-1 text-sm text-parchment-ink/70">{subtitle}</p>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
