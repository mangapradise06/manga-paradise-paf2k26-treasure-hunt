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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
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
            className="absolute inset-0 bg-mp-ink/60 backdrop-blur-sm"
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
              "mp-card relative z-10 w-full max-w-lg overflow-hidden p-0 outline-none",
              className
            )}
          >
            {(title || subtitle) && (
              <div className="relative bg-gradient-to-r from-mp-coral via-mp-orange to-mp-orange px-6 py-5 text-white sm:px-8 sm:py-6">
                <button
                  aria-label={closeLabel}
                  onClick={onClose}
                  className="absolute right-3 top-3 rounded-full p-1.5 text-white/90 hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>
                {title && (
                  <h2 className="pr-8 font-display italic text-xl text-white sm:text-2xl drop-shadow-[0_2px_0_rgba(179,23,57,0.35)]">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="mt-1 text-sm text-white/90">{subtitle}</p>
                )}
              </div>
            )}
            {!title && !subtitle && (
              <button
                aria-label={closeLabel}
                onClick={onClose}
                className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-mp-ink-soft hover:bg-mp-ink/10 hover:text-mp-ink"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <div className="p-6 sm:p-8">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
