"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "./ui/Dialog";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useToast } from "./Toast";
import { Lightbulb, Compass, Sparkles } from "lucide-react";

export interface EnigmaData {
  id: number;
  order_index: number;
  name: string;
  hint_1: string;
  hint_2: string;
  already?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  stand: EnigmaData | null;
  loading?: boolean;
  onValidated: (result: { complete: boolean; nextStandId: number | null }) => void;
}

export function EnigmaModal({ open, onClose, stand, loading, onValidated }: Props) {
  const [revealed, setRevealed] = useState<1 | 2>(1);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setRevealed(1);
    setAnswer("");
    setError(null);
    setSuccess(false);
    setSubmitting(false);
    // focus après anim
    setTimeout(() => inputRef.current?.focus(), 250);
  }, [open, stand?.id]);

  const alreadyDone = stand?.already === true;

  const header = useMemo(() => {
    if (!stand) return "";
    return `Étape ${stand.order_index} / 10 — ${stand.name}`;
  }, [stand]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stand || submitting) return;
    if (!answer.trim()) {
      setError("Écris le nom du personnage trouvé.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ standId: stand.id, answer }),
      });
      const json = await res.json();
      if (!res.ok || json.ok === false) {
        const msg = json.error ?? "Réponse incorrecte.";
        setError(msg);
        toast(msg, { variant: "error" });
        setSubmitting(false);
        return;
      }
      // victoire ✨
      setSuccess(true);
      toast("Bravo ! Personnage recruté.", { variant: "success" });
      setTimeout(() => {
        onValidated({
          complete: Boolean(json.complete),
          nextStandId: json.nextStandId ?? null,
        });
      }, 900);
    } catch {
      const msg = "Erreur réseau. Réessaie.";
      setError(msg);
      toast(msg, { variant: "error" });
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={header}
      subtitle={
        alreadyDone
          ? "Tu as déjà validé cette étape. Bravo !"
          : "Décrypte les indices pour recruter le prochain personnage."
      }
    >
      {loading || !stand ? (
        <div className="flex items-center gap-3 py-10 text-parchment-ink/70">
          <span className="dot-spin" aria-hidden /> Chargement de l'énigme…
        </div>
      ) : (
        <div className="space-y-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={revealed}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl border border-parchment-ink/15 bg-parchment-light/70 p-4"
            >
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-parchment-ink/60">
                <Lightbulb className="h-4 w-4 text-treasure-gold" />
                Indice {revealed} / 2
              </div>
              <p className="text-parchment-ink">
                {revealed === 1 ? stand.hint_1 : stand.hint_2}
              </p>
            </motion.div>
          </AnimatePresence>

          {revealed === 1 && (
            <button
              type="button"
              onClick={() => setRevealed(2)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-treasure-red hover:underline"
            >
              <Compass className="h-4 w-4" />
              Indice suivant →
            </button>
          )}

          {alreadyDone ? (
            <div className="rounded-xl border border-treasure-green/30 bg-treasure-green/10 p-4 text-sm text-treasure-green">
              Cette étape est déjà validée. Retourne sur la carte pour continuer.
              <div className="mt-3">
                <Button variant="ghost" onClick={onClose}>
                  Retour à la carte
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <Input
                ref={inputRef}
                label="Nom du personnage"
                placeholder="Ex. Monkey D. Luffy"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                error={error ?? undefined}
                autoComplete="off"
                spellCheck={false}
                disabled={submitting || success}
              />
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  disabled={success}
                >
                  <Sparkles className="h-4 w-4" />
                  Valider
                </Button>
              </div>
            </form>
          )}

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <div className="rounded-2xl bg-treasure-green px-6 py-3 font-display text-xl text-parchment-light shadow-treasure">
                  ✓ Bravo !
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Dialog>
  );
}
