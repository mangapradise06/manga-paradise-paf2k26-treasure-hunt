"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (
    message: string,
    opts?: { title?: string; variant?: ToastVariant; duration?: number }
  ) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue["toast"]>((message, opts) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const t: Toast = {
      id,
      message,
      title: opts?.title,
      variant: opts?.variant ?? "info",
      duration: opts?.duration ?? 3500,
    };
    setItems((prev) => [...prev, t]);
    setTimeout(() => dismiss(id), t.duration);
  }, [dismiss]);

  const value = useMemo<ToastContextValue>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 top-4 z-[60] mx-auto flex max-w-sm flex-col gap-2 px-4"
      >
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3 text-sm shadow-lg backdrop-blur ${
                t.variant === "success"
                  ? "border-treasure-green/30 bg-white/95 text-treasure-green"
                  : t.variant === "error"
                  ? "border-treasure-red/30 bg-white/95 text-treasure-red"
                  : "border-parchment-ink/20 bg-white/95 text-parchment-ink"
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {t.variant === "success" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : t.variant === "error" ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <Info className="h-5 w-5" />
                )}
              </span>
              <div className="flex-1">
                {t.title && <div className="font-semibold">{t.title}</div>}
                <div className="text-parchment-ink/80">{t.message}</div>
              </div>
              <button
                aria-label="Fermer"
                onClick={() => dismiss(t.id)}
                className="rounded p-1 text-parchment-ink/50 hover:text-parchment-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback safe : log console + no-op visuel
    return {
      toast: (msg) => {
        if (typeof window !== "undefined") console.warn("[toast]", msg);
      },
    };
  }
  return ctx;
}

