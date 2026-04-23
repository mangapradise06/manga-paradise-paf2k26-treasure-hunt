"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, X } from "lucide-react";

/**
 * Bouton joker "Tu ne sais pas ?" — bulle flottante (?) qui ouvre une aide
 * invitant à revenir sur le stand Manga Paradise pour un coup de pouce.
 *
 * Deux variantes :
 * - `floating` : bouton fixed en bas à gauche de l'écran (pour /final et autres pages).
 * - `inline`   : bouton en flux, à placer dans une modale ou une section.
 */
export function StuckHint({
  variant = "floating",
  align = "left",
}: {
  variant?: "floating" | "inline";
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);

  // Fermer avec la touche Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const btnBase =
    "group flex items-center gap-2 rounded-full bg-mp-red px-4 py-2.5 font-display text-sm font-bold italic text-white shadow-mp-strong transition hover:scale-105 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mp-red/30";

  const button = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Tu ne sais pas ? Demander de l'aide"
      className={btnBase}
    >
      <span
        aria-hidden
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white font-display text-base italic font-bold text-mp-red"
      >
        ?
      </span>
      <span>Tu ne sais pas&nbsp;?</span>
    </button>
  );

  return (
    <>
      {variant === "floating" ? (
        <div
          className={`fixed bottom-4 z-40 ${align === "left" ? "left-4" : "right-4"}`}
          style={{ paddingBottom: `env(safe-area-inset-bottom)` }}
        >
          {button}
        </div>
      ) : (
        <div className="flex justify-center pt-2">{button}</div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            key="stuck-hint-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-mp-ink/60 p-0 sm:items-center sm:p-4"
            onClick={() => setOpen(false)}
            role="presentation"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Tu es bloqué ?"
              className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-mp-strong sm:rounded-3xl"
              style={{ paddingBottom: `calc(1.5rem + env(safe-area-inset-bottom))` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-mp-red text-white shadow-mp">
                    <HelpCircle className="h-6 w-6" strokeWidth={2.4} />
                  </div>
                  <h2 className="font-display italic text-2xl text-mp-red sm:text-3xl">
                    Tu es bloqué&nbsp;?
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  className="rounded-full p-2 text-mp-ink-soft hover:bg-mp-ink/5 hover:text-mp-ink"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mt-4 text-sm text-mp-ink sm:text-base">
                Pas de panique&nbsp;! Reviens sur le{" "}
                <strong className="text-mp-red">stand Manga Paradise</strong> et
                demande un coup de pouce aux bénévoles. On te donnera un{" "}
                <strong>tip supplémentaire</strong> pour t&apos;aider à trouver
                de quel stand on parle.
              </p>

              <div className="mt-4 rounded-2xl border border-mp-sky/40 bg-mp-sky-soft/60 p-3 text-xs text-mp-ink-soft sm:text-sm">
                Le stand Manga Paradise est identifié sur le plan du festival.
                Nos bénévoles sont là tout le week-end pour t&apos;accompagner.
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-5 w-full rounded-full bg-mp-red px-5 py-3 font-display text-base font-bold italic text-white shadow-mp transition hover:scale-[1.01] active:scale-[0.98]"
              >
                Compris, je continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
