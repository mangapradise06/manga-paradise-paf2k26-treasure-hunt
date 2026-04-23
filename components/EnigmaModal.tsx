"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "./ui/Dialog";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useToast } from "./Toast";
import { CheckCircle2, Compass, Lightbulb, Sparkles } from "lucide-react";

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

interface ValidateResponse {
  ok?: boolean;
  success?: boolean;
  complete?: boolean;
  nextStandId?: number | null;
  next_stand_id?: number | null;
  stand_name?: string;
  error?: string;
}

export function EnigmaModal({ open, onClose, stand, loading, onValidated }: Props) {
  const [revealed, setRevealed] = useState<1 | 2>(1);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [revealStandName, setRevealStandName] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<{
    complete: boolean;
    nextStandId: number | null;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setRevealed(1);
    setAnswer("");
    setError(null);
    setSuccess(false);
    setSubmitting(false);
    setRevealStandName(null);
    setPendingResult(null);
    // focus après anim
    setTimeout(() => inputRef.current?.focus(), 250);
  }, [open, stand?.id]);

  const alreadyDone = stand?.already === true;

  // Avant validation, on masque le nom du stand (anti-triche : l'indice
  // doit suffire à le trouver). On l'affiche uniquement pour une étape déjà
  // validée ou dans l'écran de succès.
  const header = useMemo(() => {
    if (!stand) return "";
    if (alreadyDone) return `Étape ${stand.order_index} / 10 — ${stand.name}`;
    return `Étape ${stand.order_index} / 10`;
  }, [stand, alreadyDone]);

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
      const json = (await res.json()) as ValidateResponse;
      const ok = res.ok && (json.ok === true || json.success === true);
      if (!ok) {
        const msg = json.error ?? "Réponse incorrecte.";
        setError(msg);
        toast(msg, { variant: "error" });
        setSubmitting(false);
        return;
      }
      // victoire : on révèle le nom du stand avant de poursuivre
      const revealedName = json.stand_name ?? stand.name;
      setRevealStandName(revealedName);
      setSuccess(true);
      setPendingResult({
        complete: Boolean(json.complete),
        nextStandId: json.nextStandId ?? json.next_stand_id ?? null,
      });
      toast("Bravo ! Personnage recruté.", { variant: "success" });
    } catch {
      const msg = "Erreur réseau. Réessaie.";
      setError(msg);
      toast(msg, { variant: "error" });
      setSubmitting(false);
    }
  }

  function continueFromReveal() {
    if (!pendingResult) return;
    onValidated(pendingResult);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={header}
      subtitle={
        success
          ? undefined
          : alreadyDone
            ? "Tu as déjà validé cette étape. Bravo !"
            : "Décrypte les indices pour recruter le prochain personnage."
      }
    >
      {loading || !stand ? (
        <div className="flex items-center gap-3 py-10 text-mp-ink-soft">
          <span className="dot-spin" aria-hidden /> Chargement de l&apos;énigme…
        </div>
      ) : success && revealStandName ? (
        // ---------- Écran de révélation après bonne réponse ----------
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col items-center gap-4 py-4 text-center"
          role="status"
          aria-live="polite"
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 14 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-[#437A22] text-white shadow-mp"
            aria-hidden
          >
            <CheckCircle2 className="h-12 w-12" strokeWidth={2.4} />
          </motion.div>
          <div>
            <h3 className="font-display italic text-3xl text-mp-red sm:text-4xl">
              Bravo !
            </h3>
            <p className="mt-3 text-sm text-mp-ink sm:text-base">
              Ce personnage se trouvait au stand :
            </p>
            <p className="mt-1 font-display italic text-2xl font-bold text-mp-red sm:text-3xl">
              {revealStandName}
            </p>
          </div>
          <div className="w-full rounded-2xl border border-mp-sky/40 bg-white p-3 text-sm text-mp-ink-soft">
            Tu peux maintenant passer à l&apos;étape suivante.
          </div>
          <Button
            type="button"
            variant="gradient"
            onClick={continueFromReveal}
            className="mt-2 w-full px-6 py-3 text-base sm:w-auto"
          >
            <Sparkles className="h-4 w-4" />
            {pendingResult?.complete ? "Voir l'épreuve finale" : "Étape suivante"}
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={revealed}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl border border-mp-sky/30 bg-mp-sky-soft/60 p-4"
            >
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-mp-ink-soft">
                <Lightbulb className="h-4 w-4 text-mp-orange" />
                Indice {revealed} / 2
              </div>
              <p className="text-mp-ink">
                {revealed === 1 ? stand.hint_1 : stand.hint_2}
              </p>
            </motion.div>
          </AnimatePresence>

          {revealed === 1 && (
            <button
              type="button"
              onClick={() => setRevealed(2)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-mp-red hover:underline"
            >
              <Compass className="h-4 w-4" />
              Indice suivant →
            </button>
          )}

          {alreadyDone ? (
            <div className="rounded-xl border border-mp-red/30 bg-mp-red/10 p-4 text-sm text-mp-red">
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
                disabled={submitting}
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
                <Button type="submit" variant="primary" loading={submitting}>
                  <Sparkles className="h-4 w-4" />
                  Valider
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </Dialog>
  );
}
