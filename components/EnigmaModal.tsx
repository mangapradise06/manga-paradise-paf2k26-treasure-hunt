"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "./ui/Dialog";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useToast } from "./Toast";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Sparkles,
} from "lucide-react";

export interface EnigmaData {
  id: number;
  order_index: number;
  name: string;
  hint_1: string;
  hint_2: string;
  already?: boolean;
  /** Mode review : nom du personnage révélé (uniquement si already === true). */
  character_name?: string | null;
  /** Mode review : anime associé (uniquement si already === true). */
  anime_name?: string | null;
  /** Logo du partenaire / stand — dispo en tous modes. */
  logo_url?: string | null;
}

type ModalMode = "active" | "review";

interface Props {
  open: boolean;
  onClose: () => void;
  stand: EnigmaData | null;
  loading?: boolean;
  /** Par défaut, on infère depuis `stand.already`. Peut être forcé via ce prop. */
  mode?: ModalMode;
  onValidated: (result: { complete: boolean; nextStandId: number | null }) => void;
}

interface ValidateResponse {
  ok?: boolean;
  success?: boolean;
  complete?: boolean;
  nextStandId?: number | null;
  next_stand_id?: number | null;
  stand_name?: string;
  logo_url?: string | null;
  hint_full_name?: boolean;
  error?: string;
}

export function EnigmaModal({
  open,
  onClose,
  stand,
  loading,
  mode,
  onValidated,
}: Props) {
  const [revealed, setRevealed] = useState<1 | 2>(1);
  /** Si l'utilisateur a déjà raté une fois, l'indice 2 devient dispo. */
  const [hint2Unlocked, setHint2Unlocked] = useState(false);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullNameHint, setFullNameHint] = useState(false);
  const [success, setSuccess] = useState(false);
  const [revealStandName, setRevealStandName] = useState<string | null>(null);
  const [revealLogo, setRevealLogo] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<{
    complete: boolean;
    nextStandId: number | null;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Mode effectif : explicite > inféré depuis stand.already
  const effectiveMode: ModalMode =
    mode ?? (stand?.already ? "review" : "active");
  const isReview = effectiveMode === "review";

  useEffect(() => {
    if (!open) return;
    setRevealed(1);
    // En review mode, les deux indices sont toujours accessibles.
    setHint2Unlocked(isReview);
    setAnswer("");
    setError(null);
    setFullNameHint(false);
    setSuccess(false);
    setSubmitting(false);
    setRevealStandName(null);
    setRevealLogo(null);
    setPendingResult(null);
    if (!isReview) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [open, stand?.id, isReview]);

  // Header : en review on affiche le nom du stand ; sinon on le masque.
  const header = useMemo(() => {
    if (!stand) return "";
    if (isReview) return `Étape ${stand.order_index} / 10 — ${stand.name}`;
    return `Étape ${stand.order_index} / 10`;
  }, [stand, isReview]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stand || submitting) return;
    if (!answer.trim()) {
      setError("Écris le nom du personnage trouvé.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setFullNameHint(false);
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
        setFullNameHint(Boolean(json.hint_full_name));
        // Première mauvaise réponse → on débloque l'indice 2.
        setHint2Unlocked(true);
        toast(msg, { variant: "error" });
        setSubmitting(false);
        return;
      }
      // victoire : on révèle le nom du stand avant de poursuivre
      const revealedName = json.stand_name ?? stand.name;
      setRevealStandName(revealedName);
      setRevealLogo(json.logo_url ?? stand.logo_url ?? null);
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
          : isReview
            ? "Étape déjà validée — tu peux relire l'énigme et les indices."
            : "Décrypte les indices pour recruter le prochain personnage."
      }
    >
      {/* Petit logo Manga Paradise en haut de la modale */}
      {!loading && stand && !success && (
        <div className="mb-3 flex items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-mp ring-1 ring-mp-sky/40">
            <Image
              src="/brand/logo-manga-paradise.webp"
              alt=""
              width={40}
              height={40}
              className="h-full w-full object-contain"
              aria-hidden
            />
          </div>
        </div>
      )}

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
          <div className="flex flex-col items-center">
            <h3 className="font-display italic text-3xl text-mp-red sm:text-4xl">
              Bravo !
            </h3>
            {revealLogo && (
              <div className="mt-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-mp ring-2 ring-mp-red/20 sm:h-28 sm:w-28">
                <Image src={revealLogo} alt={`Logo ${revealStandName}`} width={112} height={112} className="h-full w-full object-contain" />
              </div>
            )}
            <p className="mt-3 text-sm text-mp-ink sm:text-base">
              Ce personnage se trouvait au stand :
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
      ) : isReview ? (
        // ---------- Mode review (étape déjà validée) ----------
        <ReviewContent
          stand={stand}
          revealed={revealed}
          setRevealed={setRevealed}
          onClose={onClose}
        />
      ) : (
        // ---------- Mode actif (étape en cours) ----------
        <div className="space-y-5">
          <HintTabs
            revealed={revealed}
            setRevealed={setRevealed}
            hint2Unlocked={hint2Unlocked}
          />

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
              {revealed === 2 && !hint2Unlocked && (
                <p className="mt-2 text-xs italic text-mp-ink-soft">
                  (Cet indice n&apos;est normalement disponible qu&apos;après
                  un premier essai.)
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          <form onSubmit={submit} className="space-y-3">
            <Input
              ref={inputRef}
              label="Nom du personnage (prénom + nom complet)"
              placeholder="Ex. Monkey D. Luffy"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              error={error ?? undefined}
              autoComplete="off"
              spellCheck={false}
              disabled={submitting}
            />
            {fullNameHint && (
              <div
                role="alert"
                className="rounded-xl border border-mp-orange/50 bg-mp-orange/10 p-3 text-sm text-mp-ink"
              >
                Attention, il faut saisir le{" "}
                <strong>prénom + nom complet</strong> du personnage,
                exactement comme l&apos;exposant te l&apos;a donné.
                Vérifie que tu n&apos;as pas oublié le nom de famille ou
                fait une faute de frappe.
              </div>
            )}
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
        </div>
      )}
    </Dialog>
  );
}

// ---------- Sous-composants ----------

function HintTabs({
  revealed,
  setRevealed,
  hint2Unlocked,
}: {
  revealed: 1 | 2;
  setRevealed: (n: 1 | 2) => void;
  hint2Unlocked: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-2"
      role="tablist"
      aria-label="Navigation entre les indices"
    >
      <button
        type="button"
        role="tab"
        aria-selected={revealed === 1}
        onClick={() => setRevealed(1)}
        className={
          "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition " +
          (revealed === 1
            ? "bg-mp-red text-white shadow-mp"
            : "bg-white text-mp-red ring-1 ring-mp-red/30 hover:bg-mp-red/5")
        }
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Indice 1
      </button>

      <div className="flex items-center gap-1.5" aria-hidden>
        <span
          className={
            "h-1.5 w-1.5 rounded-full " +
            (revealed === 1 ? "bg-mp-red" : "bg-mp-ink-soft/30")
          }
        />
        <span
          className={
            "h-1.5 w-1.5 rounded-full " +
            (revealed === 2 ? "bg-mp-red" : "bg-mp-ink-soft/30")
          }
        />
      </div>

      <button
        type="button"
        role="tab"
        aria-selected={revealed === 2}
        onClick={() => hint2Unlocked && setRevealed(2)}
        disabled={!hint2Unlocked}
        aria-disabled={!hint2Unlocked}
        title={
          hint2Unlocked
            ? "Afficher l'indice 2"
            : "L'indice 2 se débloque après un premier essai"
        }
        className={
          "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition " +
          (!hint2Unlocked
            ? "cursor-not-allowed bg-mp-sky/30 text-mp-ink-soft/70"
            : revealed === 2
              ? "bg-mp-red text-white shadow-mp"
              : "bg-white text-mp-red ring-1 ring-mp-red/30 hover:bg-mp-red/5")
        }
      >
        Indice 2
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function ReviewContent({
  stand,
  revealed,
  setRevealed,
  onClose,
}: {
  stand: EnigmaData;
  revealed: 1 | 2;
  setRevealed: (n: 1 | 2) => void;
  onClose: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full bg-[#437A22]/10 px-3 py-1 text-xs font-semibold text-[#437A22]">
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        Déjà trouvé
      </div>

      {stand.character_name && (
        <div className="rounded-2xl border border-mp-sky/40 bg-white p-4">
          {stand.logo_url && (
            <div className="mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-mp ring-2 ring-mp-red/20">
              <Image src={stand.logo_url} alt={`Logo ${stand.name}`} width={96} height={96} className="h-full w-full object-contain" />
            </div>
          )}
          <p className="text-[11px] font-semibold uppercase tracking-widest text-mp-ink-soft">
            Personnage
          </p>
          <p className="font-display text-2xl italic text-mp-red sm:text-3xl">
            {stand.character_name}
          </p>
          {stand.anime_name && (
            <p className="mt-1 text-sm text-mp-ink">
              <span className="text-mp-ink-soft">Anime : </span>
              <strong>{stand.anime_name}</strong>
            </p>
          )}
          <p className="mt-2 text-sm text-mp-ink">
            <span className="text-mp-ink-soft">Stand : </span>
            <strong>{stand.name}</strong>
          </p>
        </div>
      )}

      <HintTabs
        revealed={revealed}
        setRevealed={setRevealed}
        hint2Unlocked={true}
      />

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

      <div className="flex justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Retour à la carte
        </Button>
      </div>
    </div>
  );
}
