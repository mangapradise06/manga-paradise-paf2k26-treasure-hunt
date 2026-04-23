"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { ArrowLeft, RotateCcw, Sparkles, X, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { ToriiIcon } from "@/components/icons/ToriiIcon";
import { Sakura } from "@/components/icons/Sakura";

// ----- Types -----

interface NarrativeEntry {
  role: string;
  character: string;
  letter: string;
}

interface CharacterCard {
  character: string;
  anime: string;
}

interface FinalSetup {
  narrative_order: NarrativeEntry[];
  characters_to_place: CharacterCard[];
}

type Placed = CharacterCard | null;

// ----- Page -----

export default function FinalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<FinalSetup | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [slots, setSlots] = useState<Placed[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [wrongPick, setWrongPick] = useState<{ slot: number; character: string } | null>(null);
  const [guess, setGuess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const wrongTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Chargement initial
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/final-setup", { cache: "no-store" });
        if (r.status === 401) {
          router.replace("/inscription");
          return;
        }
        if (r.status === 403) {
          toast("Tu dois d'abord valider les 10 étapes.", { variant: "info" });
          router.replace("/map");
          return;
        }
        const json = await r.json();
        if (!r.ok) {
          setLoadErr(json.error ?? "Erreur de chargement.");
          return;
        }
        const setup = json as FinalSetup;
        setData(setup);
        setSlots(new Array(setup.narrative_order.length).fill(null));
      } catch {
        setLoadErr("Erreur réseau.");
      }
    })();
    return () => {
      if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
    };
  }, [router, toast]);

  const narrative = data?.narrative_order ?? [];
  const allCharacters = data?.characters_to_place ?? [];

  // Personnages déjà placés correctement (par nom)
  const placedCharacterNames = new Set(
    slots.filter((s): s is CharacterCard => s !== null).map((s) => s.character)
  );

  // Toutes les cases sont-elles correctement remplies ?
  const allCorrect =
    slots.length > 0 &&
    slots.every((s, i) => s !== null && s.character === narrative[i]?.character);

  const openPicker = useCallback((slotIndex: number) => {
    // Si le slot est déjà correct, on ne fait rien (il est verrouillé).
    setWrongPick(null);
    setSelectedSlot(slotIndex);
  }, []);

  const closePicker = useCallback(() => {
    setSelectedSlot(null);
    setWrongPick(null);
  }, []);

  const handlePick = useCallback(
    (character: CharacterCard) => {
      if (selectedSlot === null) return;
      const expected = narrative[selectedSlot]?.character;
      const isCorrect = expected === character.character;

      if (!isCorrect) {
        // Animation rouge + shake sur la carte mauvaise pick
        setWrongPick({ slot: selectedSlot, character: character.character });
        if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
        wrongTimeoutRef.current = setTimeout(() => {
          setWrongPick(null);
        }, 700);
        return;
      }

      // Bon choix : on place, on ferme, on donne un petit feedback sonore via toast
      setSlots((prev) => {
        const next = [...prev];
        next[selectedSlot] = { ...character };
        return next;
      });
      setSelectedSlot(null);
      setWrongPick(null);
    },
    [narrative, selectedSlot]
  );

  function removeFromSlot(slotIndex: number) {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  }

  async function submit() {
    if (!guess.trim()) {
      toast("Écris le mot formé par les lettres.", { variant: "info" });
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/final", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: guess }),
      });
      const json = await r.json();
      if (!r.ok || json.ok === false) {
        toast(json.error ?? "Pas encore ! Réessaie.", { variant: "error" });
        setSubmitting(false);
        return;
      }
      router.replace("/congrats");
    } catch {
      toast("Erreur réseau.", { variant: "error" });
      setSubmitting(false);
    }
  }

  // ----- Render -----

  return (
    <main className="relative mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-5 sm:py-12">
      <Link
        href="/map"
        className="mb-4 inline-flex items-center gap-1 text-sm text-mp-ink-soft hover:text-mp-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à la carte
      </Link>

      {/* Hero */}
      <section className="relative mb-6 overflow-hidden rounded-3xl sunburst-bg-soft sunburst-fade-bottom p-6 text-center sm:p-10">
        <Sakura className="pointer-events-none absolute left-4 top-4 h-6 w-6 text-sakura-dark/70" aria-hidden />
        <Sakura className="pointer-events-none absolute right-6 top-8 h-5 w-5 text-sakura-dark/60" aria-hidden />
        <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-3">
          <ToriiIcon className="h-12 w-12 text-mp-red" aria-hidden />
          <h1 className="font-display italic text-3xl leading-none text-white sm:text-5xl mp-title-outline">
            Plus qu&apos;une &eacute;tape&nbsp;!
          </h1>
          <p className="max-w-md text-sm text-mp-ink sm:text-base">
            Pour chaque rôle, appuie sur la case et sélectionne le bon personnage. Les lettres apparaîtront au fur et à mesure.
          </p>
        </div>
      </section>

      <div className="mp-card p-5 sm:p-8">
        {loadErr && (
          <p className="mt-4 rounded-lg border border-mp-red/30 bg-mp-red/10 p-3 text-sm text-mp-red">
            {loadErr}
          </p>
        )}

        {!data ? (
          <div className="mt-6 flex items-center gap-2 text-mp-ink-soft">
            <span className="dot-spin" aria-hidden /> Chargement…
          </div>
        ) : (
          <>
            {/* Word preview */}
            <WordPreview slots={slots} narrative={narrative} />

            {/* Slots cliquables */}
            <section
              aria-label="Rôles narratifs à compléter"
              className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {narrative.map((entry, idx) => (
                <SlotButton
                  key={entry.role}
                  index={idx}
                  role={entry.role}
                  letter={entry.letter}
                  placed={slots[idx]}
                  onOpen={() => openPicker(idx)}
                  onRemove={() => removeFromSlot(idx)}
                />
              ))}
            </section>

            {/* Hint */}
            <p className="mt-5 text-center text-xs text-mp-ink-soft sm:text-sm">
              {slots.filter((s) => s !== null).length} / {narrative.length} personnages placés
            </p>
          </>
        )}

        {/* Zone de saisie finale */}
        <AnimatePresence>
          {allCorrect && (
            <motion.div
              key="final-input"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8 rounded-2xl border-2 border-mp-coral/50 bg-gradient-to-br from-mp-coral/10 to-mp-orange/10 p-5 sm:p-6 text-center"
            >
              <h2 className="font-display italic text-2xl text-mp-red sm:text-3xl">
                Le mot secret
              </h2>
              <p className="mt-1 text-sm text-mp-ink">
                Quel mot ces lettres forment-elles ?
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void submit();
                }}
                className="mt-4 flex flex-col items-center gap-3"
              >
                <input
                  type="text"
                  placeholder="ANGEL BEATS"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Mot formé par les 10 lettres"
                  className="w-full max-w-md rounded-2xl border-2 border-mp-sky/60 bg-white px-4 py-3 text-center font-display text-2xl font-bold uppercase tracking-widest text-mp-red placeholder:text-mp-ink-soft/40 focus-visible:border-mp-red focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mp-red/20 sm:text-3xl"
                />
                <Button type="submit" variant="gradient" loading={submitting} className="w-full max-w-md">
                  <Sparkles className="h-4 w-4" />
                  Valider ma réponse
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Picker modal */}
      <AnimatePresence>
        {selectedSlot !== null && data && (
          <PickerModal
            role={narrative[selectedSlot].role}
            characters={allCharacters}
            placedNames={placedCharacterNames}
            currentSlotCharacter={slots[selectedSlot]?.character ?? null}
            wrongPick={wrongPick?.slot === selectedSlot ? wrongPick.character : null}
            onPick={handlePick}
            onClose={closePicker}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

// ---------- Word preview ----------

function WordPreview({
  slots,
  narrative,
}: {
  slots: Placed[];
  narrative: NarrativeEntry[];
}) {
  const letters = narrative.map((entry, i) => {
    const placed = slots[i];
    const isCorrect = placed !== null && placed!.character === entry.character;
    return {
      char: isCorrect ? entry.letter : "·",
      filled: isCorrect,
    };
  });

  return (
    <div
      className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
      aria-live="polite"
      aria-label="Lettres révélées"
    >
      {letters.map((l, i) => (
        <span key={i} className="inline-flex items-center">
          <motion.span
            key={`${i}-${l.filled}`}
            initial={l.filled ? { scale: 0.6, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className={clsx(
              "flex h-10 w-9 items-center justify-center rounded-md border-2 font-display text-xl font-bold transition sm:h-12 sm:w-10 sm:text-2xl",
              l.filled
                ? "border-mp-orange bg-mp-orange/20 text-mp-red"
                : "border-mp-sky/40 bg-mp-white/70 text-mp-ink/30"
            )}
          >
            {l.char}
          </motion.span>
          {i === 4 && <span className="w-2 sm:w-3" aria-hidden="true" />}
        </span>
      ))}
    </div>
  );
}

// ---------- Slot button ----------

function SlotButton({
  index,
  role,
  letter,
  placed,
  onOpen,
  onRemove,
}: {
  index: number;
  role: string;
  letter: string;
  placed: Placed;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const isFilled = placed !== null;

  return (
    <div
      className={clsx(
        "relative rounded-2xl border-2 bg-white p-3 pt-4 shadow-mp-card transition-colors sm:p-4 sm:pt-5",
        isFilled
          ? "border-mp-red/80 bg-mp-red/5"
          : "border-dashed border-mp-sky/60"
      )}
    >
      <span
        aria-hidden
        className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-mp-red font-display text-xs font-bold text-white shadow-mp"
      >
        {index + 1}
      </span>
      <div className="mb-2 flex items-baseline justify-between gap-3 pl-4">
        <div className="text-xs font-semibold uppercase tracking-widest text-mp-ink-soft">
          {role}
        </div>
        {isFilled && (
          <span className="font-display text-2xl text-mp-red sm:text-3xl">
            {letter}
          </span>
        )}
      </div>

      {isFilled ? (
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-white p-2">
            <InitialBubble name={placed!.character} correct />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-mp-ink sm:text-base">
                {placed!.character}
              </div>
              <div className="truncate text-xs text-mp-ink-soft">
                {placed!.anime}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Retirer ce personnage"
            className="rounded-full p-1.5 text-mp-ink-soft hover:bg-mp-ink/5 hover:text-mp-ink"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="flex min-h-[60px] w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-mp-sky/50 bg-mp-sky-soft/30 px-3 py-2 text-sm font-semibold text-mp-red transition hover:border-mp-red hover:bg-mp-red/5 active:scale-[0.98]"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Choisir un personnage
        </button>
      )}
    </div>
  );
}

// ---------- Picker modal ----------

function PickerModal({
  role,
  characters,
  placedNames,
  currentSlotCharacter,
  wrongPick,
  onPick,
  onClose,
}: {
  role: string;
  characters: CharacterCard[];
  placedNames: Set<string>;
  currentSlotCharacter: string | null;
  wrongPick: string | null;
  onPick: (c: CharacterCard) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-mp-ink/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-mp-strong sm:rounded-3xl"
        style={{ paddingBottom: `calc(1.25rem + env(safe-area-inset-bottom))` }}
        role="dialog"
        aria-modal="true"
        aria-label={`Choisir le personnage pour ${role}`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-mp-coral">
              Qui est…
            </div>
            <h2 className="mt-1 font-display italic text-2xl text-mp-red sm:text-3xl">
              {role}&nbsp;?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-2 text-mp-ink-soft hover:bg-mp-ink/5 hover:text-mp-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {characters.map((c) => {
            const isPlaced = placedNames.has(c.character) && c.character !== currentSlotCharacter;
            const isWrong = wrongPick === c.character;

            return (
              <motion.button
                key={c.character}
                type="button"
                onClick={() => !isPlaced && onPick(c)}
                disabled={isPlaced}
                animate={
                  isWrong
                    ? { x: [0, -8, 8, -8, 8, -4, 4, 0] }
                    : { x: 0 }
                }
                transition={{ duration: 0.5 }}
                className={clsx(
                  "flex items-center gap-3 rounded-xl border-2 p-3 text-left transition",
                  isPlaced && "cursor-not-allowed opacity-40",
                  !isPlaced && !isWrong && "border-mp-sky/40 bg-white hover:border-mp-red hover:bg-mp-red/5 active:scale-[0.98]",
                  isWrong && "border-mp-red bg-mp-red/15 shadow-[0_0_0_4px_rgba(220,30,68,0.15)]"
                )}
              >
                <InitialBubble name={c.character} wrong={isWrong} />
                <div className="min-w-0 flex-1">
                  <div className={clsx(
                    "truncate text-sm font-semibold sm:text-base",
                    isWrong ? "text-mp-red" : "text-mp-ink"
                  )}>
                    {c.character}
                  </div>
                  <div className="truncate text-xs text-mp-ink-soft">
                    {c.anime}
                  </div>
                </div>
                {isPlaced && (
                  <Check className="h-4 w-4 shrink-0 text-mp-red" aria-label="Déjà placé" />
                )}
                {isWrong && (
                  <X className="h-5 w-5 shrink-0 text-mp-red" aria-label="Mauvais choix" />
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {wrongPick && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-xl border border-mp-red/30 bg-mp-red/10 p-3 text-center text-sm font-semibold text-mp-red"
              role="alert"
            >
              Ce n&apos;est pas le bon. Essaie avec un autre personnage.
            </motion.p>
          )}
        </AnimatePresence>

        <p className="mt-4 text-center text-xs text-mp-ink-soft">
          Besoin d&apos;aide&nbsp;? Reviens sur le stand Manga Paradise.
        </p>
      </motion.div>
    </motion.div>
  );
}

// ---------- Initial bubble ----------

function InitialBubble({
  name,
  correct,
  wrong,
}: {
  name: string;
  correct?: boolean;
  wrong?: boolean;
}) {
  const letter = (name.match(/[A-Za-zÀ-ÿ]/)?.[0] ?? "?").toUpperCase();
  return (
    <div
      aria-hidden
      className={clsx(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-display text-base font-bold sm:h-11 sm:w-11",
        wrong
          ? "border-mp-red bg-mp-red/10 text-mp-red"
          : correct
            ? "border-mp-red bg-white text-mp-red"
            : "border-mp-sky/50 bg-white text-mp-ink"
      )}
    >
      {letter}
    </div>
  );
}
