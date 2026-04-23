"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { ArrowLeft, RotateCcw, Scroll, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/Toast";

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

type SlotState = (CharacterCard & { feedback?: "ok" | "ko" }) | null;

// ----- Page -----

export default function FinalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<FinalSetup | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotState[]>([]);
  const [pool, setPool] = useState<CharacterCard[]>([]);
  const [activeCard, setActiveCard] = useState<CharacterCard | null>(null);
  const [guess, setGuess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const feedbackTimeouts = useRef<Record<number, ReturnType<typeof setTimeout>>>(
    {}
  );

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
        setPool(setup.characters_to_place);
      } catch {
        setLoadErr("Erreur réseau.");
      }
    })();
    return () => {
      Object.values(feedbackTimeouts.current).forEach((t) => clearTimeout(t));
    };
  }, [router, toast]);

  // Sensors : mouse + touch + keyboard.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const narrative = data?.narrative_order ?? [];

  // Toutes les cases sont-elles remplies ?
  const allPlaced = slots.length > 0 && slots.every((s) => s !== null);
  // Tous correctement placés ?
  const allCorrect =
    allPlaced &&
    slots.every((s, i) => s && s.character === narrative[i]?.character);

  const handleDragStart = useCallback(
    (evt: DragStartEvent) => {
      const id = String(evt.active.id);
      const found = findCardById(id, pool, slots);
      setActiveCard(found);
    },
    [pool, slots]
  );

  const handleDragEnd = useCallback(
    (evt: DragEndEvent) => {
      setActiveCard(null);
      const activeId = String(evt.active.id);
      const overId = evt.over?.id ? String(evt.over.id) : null;
      if (!overId) return;

      // L'id de slot commence par "slot-<index>"
      const slotMatch = overId.match(/^slot-(\d+)$/);
      if (!slotMatch) return;
      const slotIndex = Number(slotMatch[1]);
      if (!Number.isFinite(slotIndex)) return;

      // Identifier la source : pool ou autre slot
      const card = findCardById(activeId, pool, slots);
      if (!card) return;

      const expected = narrative[slotIndex]?.character;
      const isCorrect = expected === card.character;

      if (!isCorrect) {
        // Retour au pool + flash rouge bref sur le slot
        setSlots((prev) => {
          const next = [...prev];
          // Si la carte venait d'un autre slot, on l'y laisse (pas de déplacement).
          // Marque visuellement le slot cible en rouge.
          next[slotIndex] = prev[slotIndex]
            ? { ...prev[slotIndex]!, feedback: "ko" }
            : null;
          return next;
        });
        // Si elle venait d'un slot, on l'enlève de ce slot pour la renvoyer au pool.
        const srcMatch = activeId.match(/^slot-card-(\d+)$/);
        if (srcMatch) {
          const srcIdx = Number(srcMatch[1]);
          setSlots((prev) => {
            const next = [...prev];
            next[srcIdx] = null;
            return next;
          });
          setPool((prev) => addToPool(prev, card));
        }
        scheduleClearFeedback(slotIndex);
        return;
      }

      // Placement correct : on nettoie l'ancien emplacement + on remplit le slot.
      setSlots((prev) => {
        const next = [...prev];
        // si le slot contenait déjà une carte → on la renvoie au pool
        const previousCard = prev[slotIndex];
        if (previousCard) {
          setPool((p) =>
            addToPool(
              p,
              // strip feedback
              { character: previousCard.character, anime: previousCard.anime }
            )
          );
        }
        next[slotIndex] = { ...card, feedback: "ok" };
        return next;
      });
      // Si la carte venait d'un slot, vider ce slot source.
      const srcMatch = activeId.match(/^slot-card-(\d+)$/);
      if (srcMatch) {
        const srcIdx = Number(srcMatch[1]);
        if (srcIdx !== slotIndex) {
          setSlots((prev) => {
            const next = [...prev];
            next[srcIdx] = null;
            return next;
          });
        }
      } else {
        // la carte venait du pool → on la retire
        setPool((prev) => prev.filter((c) => cardId(c) !== activeId));
      }
      scheduleClearFeedback(slotIndex);
    },
    [narrative, pool, slots]
  );

  function scheduleClearFeedback(slotIndex: number) {
    const existing = feedbackTimeouts.current[slotIndex];
    if (existing) clearTimeout(existing);
    feedbackTimeouts.current[slotIndex] = setTimeout(() => {
      setSlots((prev) => {
        const next = [...prev];
        const current = next[slotIndex];
        if (current && current.feedback) {
          next[slotIndex] = {
            character: current.character,
            anime: current.anime,
          };
        }
        return next;
      });
    }, 700);
  }

  function removeFromSlot(slotIndex: number) {
    setSlots((prev) => {
      const card = prev[slotIndex];
      if (!card) return prev;
      setPool((p) =>
        addToPool(p, { character: card.character, anime: card.anime })
      );
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
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-5 sm:py-12">
      <Link
        href="/map"
        className="mb-4 inline-flex items-center gap-1 text-sm text-parchment-ink/70 hover:text-parchment-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à la carte
      </Link>

      <div className="parchment-panel p-5 sm:p-8">
        <div className="mb-3 flex items-center gap-3">
          <Scroll className="h-7 w-7 text-treasure-gold" />
          <h1 className="font-display text-2xl text-treasure-red sm:text-3xl">
            Épreuve finale
          </h1>
        </div>
        <p className="text-sm text-parchment-ink/80 sm:text-base">
          Plus qu&apos;une étape : reconstitue le mot secret. Fais glisser chaque
          personnage sur son rôle narratif. Les lettres apparaîtront au fur et à
          mesure.
        </p>

        {loadErr && (
          <p className="mt-4 rounded-lg border border-treasure-red/30 bg-treasure-red/5 p-3 text-sm text-treasure-red">
            {loadErr}
          </p>
        )}

        {!data ? (
          <div className="mt-6 flex items-center gap-2 text-parchment-ink/70">
            <span className="dot-spin" aria-hidden /> Chargement…
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Word preview */}
            <WordPreview slots={slots} narrative={narrative} />

            {/* Drop slots */}
            <section
              aria-label="Rôles narratifs à compléter"
              className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {narrative.map((entry, idx) => (
                <SlotDropZone
                  key={entry.role}
                  index={idx}
                  role={entry.role}
                  expectedLetter={entry.letter}
                  card={slots[idx]}
                  isCorrect={
                    slots[idx] !== null &&
                    slots[idx]!.character === entry.character
                  }
                  onRemove={() => removeFromSlot(idx)}
                />
              ))}
            </section>

            {/* Pool */}
            <section
              aria-label="Personnages à placer"
              className="mt-8 rounded-2xl border-2 border-dashed border-parchment-ink/25 bg-parchment-light/40 p-3 sm:p-4"
            >
              <h2 className="mb-3 font-display text-sm uppercase tracking-widest text-parchment-ink/70">
                Personnages recrutés ({pool.length})
              </h2>
              {pool.length === 0 ? (
                <p className="py-4 text-center text-sm text-parchment-ink/60">
                  Tous les personnages sont placés.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {pool.map((c) => (
                    <DraggableCard
                      key={cardId(c)}
                      id={cardId(c)}
                      card={c}
                      variant="pool"
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Drag overlay pour le retour visuel */}
            <DragOverlay dropAnimation={null}>
              {activeCard ? (
                <CardSurface card={activeCard} dragging />
              ) : null}
            </DragOverlay>
          </DndContext>
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
              className="mt-8 rounded-2xl border-2 border-treasure-gold/60 bg-treasure-gold/10 p-4 sm:p-5"
            >
              <h2 className="font-display text-xl text-treasure-red">
                Le mot secret
              </h2>
              <p className="mt-1 text-sm text-parchment-ink/80">
                Quel mot ces lettres forment-elles ?
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void submit();
                }}
                className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"
              >
                <Input
                  label="Mot formé par les 10 lettres"
                  placeholder="ANGEL BEATS"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1"
                />
                <Button type="submit" variant="gold" loading={submitting}>
                  <Sparkles className="h-4 w-4" />
                  Valider ma réponse
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ---------- Helpers ----------

function cardId(c: CharacterCard): string {
  return `pool-${c.character}`;
}

function findCardById(
  id: string,
  pool: CharacterCard[],
  slots: SlotState[]
): CharacterCard | null {
  if (id.startsWith("pool-")) {
    return pool.find((c) => cardId(c) === id) ?? null;
  }
  const m = id.match(/^slot-card-(\d+)$/);
  if (m) {
    const idx = Number(m[1]);
    const s = slots[idx];
    if (s) return { character: s.character, anime: s.anime };
  }
  return null;
}

function addToPool(pool: CharacterCard[], card: CharacterCard): CharacterCard[] {
  if (pool.some((c) => c.character === card.character)) return pool;
  return [...pool, card];
}

// ---------- Word preview ----------

function WordPreview({
  slots,
  narrative,
}: {
  slots: SlotState[];
  narrative: NarrativeEntry[];
}) {
  // Groupe ANGEL BEATS = 5 + 5. Pour l'affichage, on insère un espace
  // entre la 5e et la 6e lettre (correspond au nom ANGEL BEATS).
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
          <span
            className={clsx(
              "flex h-10 w-9 items-center justify-center rounded-md border-2 font-display text-xl font-bold transition sm:h-12 sm:w-10 sm:text-2xl",
              l.filled
                ? "border-treasure-gold bg-treasure-gold/20 text-treasure-red"
                : "border-parchment-ink/20 bg-parchment-light/40 text-parchment-ink/30"
            )}
          >
            {l.char}
          </span>
          {i === 4 && (
            <span className="w-2 sm:w-3" aria-hidden="true" />
          )}
        </span>
      ))}
    </div>
  );
}

// ---------- Slot drop zone ----------

function SlotDropZone({
  index,
  role,
  expectedLetter,
  card,
  isCorrect,
  onRemove,
}: {
  index: number;
  role: string;
  expectedLetter: string;
  card: SlotState;
  isCorrect: boolean;
  onRemove: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `slot-${index}` });
  const feedback = card?.feedback;

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "relative rounded-2xl border-2 p-3 transition-colors sm:p-4",
        card
          ? isCorrect
            ? feedback === "ok"
              ? "border-treasure-green bg-treasure-green/15"
              : "border-treasure-gold/60 bg-parchment-light"
            : "border-parchment-ink/30 bg-parchment-light"
          : isOver
            ? "border-treasure-red bg-treasure-red/10"
            : "border-dashed border-parchment-ink/30 bg-parchment-light/40",
        feedback === "ko" && "border-treasure-red bg-treasure-red/15"
      )}
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-widest text-parchment-ink/60">
          {index + 1}. {role}
        </div>
        {isCorrect && (
          <span className="font-display text-2xl text-treasure-red sm:text-3xl">
            {expectedLetter}
          </span>
        )}
      </div>
      {card ? (
        <DraggableSlotCard index={index} card={card} onRemove={onRemove} />
      ) : (
        <div className="flex h-[72px] items-center justify-center text-sm italic text-parchment-ink/50">
          Dépose ici le personnage
        </div>
      )}
    </div>
  );
}

// ---------- Draggables ----------

function DraggableCard({
  id,
  card,
  variant,
}: {
  id: string;
  card: CharacterCard;
  variant: "pool" | "slot";
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });

  return (
    <button
      ref={setNodeRef}
      type="button"
      aria-label={`Personnage ${card.character}, ${card.anime}. Glisser vers un rôle narratif.`}
      {...attributes}
      {...listeners}
      className={clsx(
        "touch-none select-none rounded-xl border-2 px-3 py-2 text-left shadow-sm transition active:scale-95",
        variant === "pool"
          ? "border-parchment-ink/25 bg-parchment-light hover:border-treasure-red"
          : "border-treasure-gold/60 bg-parchment-light/95",
        isDragging && "opacity-30"
      )}
    >
      <CardSurface card={card} />
    </button>
  );
}

function DraggableSlotCard({
  index,
  card,
  onRemove,
}: {
  index: number;
  card: Exclude<SlotState, null>;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <DraggableCard
          id={`slot-card-${index}`}
          card={{ character: card.character, anime: card.anime }}
          variant="slot"
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Retirer ce personnage"
        className="rounded-full p-1.5 text-parchment-ink/60 hover:bg-parchment-ink/10 hover:text-parchment-ink"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}

// ---------- Card surface (shared visual) ----------

function CardSurface({
  card,
  dragging,
}: {
  card: CharacterCard;
  dragging?: boolean;
}): ReactNode {
  return (
    <div
      className={clsx(
        "flex items-center gap-3",
        dragging &&
          "rounded-xl border-2 border-treasure-red bg-parchment-light p-2 shadow-treasure"
      )}
    >
      <CharacterSilhouette name={card.character} />
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-parchment-ink sm:text-base">
          {card.character}
        </div>
        <div className="truncate text-xs text-parchment-ink/60">
          {card.anime}
        </div>
      </div>
    </div>
  );
}

function CharacterSilhouette({ name }: { name: string }) {
  // Silhouette placeholder simple : initiale sur disque neutre.
  const letter = (name.match(/[A-Za-zÀ-ÿ]/)?.[0] ?? "?").toUpperCase();
  return (
    <div
      aria-hidden
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-parchment-ink/25 bg-parchment-light font-display text-base font-bold text-parchment-ink sm:h-11 sm:w-11"
    >
      {letter}
    </div>
  );
}
