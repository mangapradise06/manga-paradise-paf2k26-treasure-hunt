"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Flag,
  HelpCircle,
  Lock,
  Trophy,
} from "lucide-react";
import clsx from "clsx";
import { Logo } from "./Logo";

interface StandLite {
  id: number;
  order_index: number;
  name: string;
  map_x: number;
  map_y: number;
}

interface Props {
  pseudo: string;
  stands: StandLite[];
  completedStandIds: number[];
  nextStandId: number | null;
}

type Status = "done" | "active" | "locked";

type StepAction = (standId: number, status: Status) => void;

const MINUTES_PER_STAND = 1.5;
const SCROLL_KEY = "mp-trail-scroll-y";

function statusOf(
  stand: StandLite,
  completed: Set<number>,
  nextId: number | null
): Status {
  if (completed.has(stand.id)) return "done";
  if (nextId === stand.id) return "active";
  return "locked";
}

export function TreasureTrail({
  pseudo,
  stands,
  completedStandIds,
  nextStandId,
}: Props) {
  const ordered = useMemo(
    () => [...stands].sort((a, b) => a.order_index - b.order_index),
    [stands]
  );
  const completed = useMemo(
    () => new Set(completedStandIds),
    [completedStandIds]
  );
  const total = ordered.length;
  const doneCount = completed.size;
  const remaining = Math.max(0, total - doneCount);
  const etaMinutes = Math.max(1, Math.round(remaining * MINUTES_PER_STAND));
  const allDone = total > 0 && doneCount >= total;
  const activeIndex = nextStandId
    ? ordered.findIndex((s) => s.id === nextStandId)
    : -1;

  const router = useRouter();
  const handleStepClick: StepAction = (standId, status) => {
    if (status === "locked") return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        SCROLL_KEY,
        `${window.scrollY}:${nextStandId ?? ""}`
      );
    }
    router.push(`/map/${standId}`);
  };

  return (
    <>
      <StickyHeader
        pseudo={pseudo}
        doneCount={doneCount}
        total={total}
        etaMinutes={etaMinutes}
        activeIndex={activeIndex}
        allDone={allDone}
        ordered={ordered}
        completed={completed}
        nextStandId={nextStandId}
        onStepClick={handleStepClick}
      />
      <Legend />
      <TrailContainer
        ordered={ordered}
        completed={completed}
        nextStandId={nextStandId}
        doneCount={doneCount}
      />
      <TrophyFooter doneCount={doneCount} total={total} allDone={allDone} />
    </>
  );
}

// ---------- Skeleton ----------

export function TrailSkeleton() {
  return (
    <>
      <div
        className="sticky top-0 z-40 border-b border-mp-sky/30 bg-white/95"
        style={{
          paddingTop: `calc(0.75rem + env(safe-area-inset-top))`,
          paddingBottom: "0.75rem",
        }}
        aria-hidden
      >
        <div className="mx-auto max-w-2xl px-4">
          <div className="h-3 w-28 animate-pulse rounded bg-mp-ink/5" />
          <div className="mt-2 h-7 w-56 animate-pulse rounded bg-mp-ink/5" />
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 animate-pulse rounded-full bg-mp-ink/5"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-3" aria-hidden>
        <div className="flex justify-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-6 w-24 animate-pulse rounded-full bg-mp-ink/5"
            />
          ))}
        </div>
      </div>
      <div
        className="mx-auto max-w-2xl px-4"
        role="status"
        aria-label="Chargement de ta carte au trésor"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              "flex min-h-[55vh] items-center",
              i % 2 === 0 ? "justify-start pl-[10%]" : "justify-end pr-[10%]"
            )}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="h-[72px] w-[72px] animate-pulse rounded-full bg-mp-ink/5" />
              <div className="h-2.5 w-20 animate-pulse rounded bg-mp-ink/5" />
              <div className="h-4 w-32 animate-pulse rounded bg-mp-ink/5" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ---------- Sticky header ----------

function StickyHeader({
  pseudo,
  doneCount,
  total,
  etaMinutes,
  activeIndex,
  allDone,
  ordered,
  completed,
  nextStandId,
  onStepClick,
}: {
  pseudo: string;
  doneCount: number;
  total: number;
  etaMinutes: number;
  activeIndex: number;
  allDone: boolean;
  ordered: StandLite[];
  completed: Set<number>;
  nextStandId: number | null;
  onStepClick: StepAction;
}) {
  const { scrollY } = useScroll();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const unsub = scrollY.on("change", (y) => setCompact(y > 100));
    return unsub;
  }, [scrollY]);

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 border-b-2 border-mp-red/20 bg-white/95",
        compact ? "pb-2" : "pb-3"
      )}
      style={{
        paddingTop: `calc(${compact ? "0.5rem" : "1rem"} + env(safe-area-inset-top))`,
      }}
    >
      <div className="mx-auto max-w-2xl px-4">
        {!compact && (
          <p className="text-[11px] font-semibold uppercase tracking-widest text-mp-coral">
            Konnichiwa, {pseudo} !
          </p>
        )}
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={clsx(
                "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-mp",
                compact ? "h-7 w-7" : "h-9 w-9"
              )}
              aria-hidden
            >
              <Logo size={compact ? 28 : 36} alt="Manga Paradise" />
            </div>
            <h1
              className={clsx(
                "font-display italic text-mp-red truncate",
                compact
                  ? "text-lg leading-tight"
                  : "text-2xl leading-tight sm:text-3xl"
              )}
            >
              Ta progression
            </h1>
          </div>
          <span className="shrink-0 rounded-full bg-mp-red px-3 py-1 font-display text-sm font-bold text-white shadow-mp">
            {doneCount}/{total}
          </span>
        </div>
        <SegmentedProgress
          ordered={ordered}
          completed={completed}
          nextStandId={nextStandId}
          doneCount={doneCount}
          total={total}
          activeIndex={activeIndex}
          onStepClick={onStepClick}
          className="mt-2"
        />
        {!compact && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-mp-ink-soft">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            <span aria-live="polite">
              {allDone
                ? "Toutes les étapes validées"
                : `~${etaMinutes} min restantes`}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

function SegmentedProgress({
  ordered,
  completed,
  nextStandId,
  doneCount,
  total,
  activeIndex,
  onStepClick,
  className,
}: {
  ordered: StandLite[];
  completed: Set<number>;
  nextStandId: number | null;
  doneCount: number;
  total: number;
  activeIndex: number;
  onStepClick: StepAction;
  className?: string;
}) {
  return (
    <div
      className={clsx("flex items-center gap-1.5", className)}
      role="progressbar"
      aria-valuenow={doneCount}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Progression : ${doneCount} sur ${total} étapes validées`}
    >
      <div className="flex flex-1 items-center gap-1">
        {ordered.map((stand, i) => {
          const status = statusOf(stand, completed, nextStandId);
          const isDone = status === "done";
          const isActive = status === "active";
          const isLocked = status === "locked";
          const label =
            isDone
              ? `Étape ${i + 1} — terminée`
              : isActive
                ? `Étape ${i + 1} — en cours`
                : `Étape ${i + 1} — verrouillée`;
          return (
            <button
              key={stand.id}
              type="button"
              onClick={() => onStepClick(stand.id, status)}
              disabled={isLocked}
              aria-disabled={isLocked}
              aria-label={label}
              title={label}
              className={clsx(
                "group relative h-3 flex-1 rounded-full",
                isLocked
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              )}
              tabIndex={isLocked ? -1 : 0}
            >
              <span
                className={clsx(
                  "pointer-events-none absolute inset-x-0 top-1/2 block h-1.5 -translate-y-1/2 rounded-full transition-colors",
                  isDone
                    ? "bg-gradient-to-r from-mp-coral to-mp-orange"
                    : isActive
                      ? "bg-mp-red/30"
                      : "bg-mp-sky/40",
                  isActive && "ring-2 ring-mp-red ring-offset-1 ring-offset-white"
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
      {activeIndex >= 0 && (
        <span className="sr-only">
          Étape actuelle : {activeIndex + 1} sur {total}
        </span>
      )}
    </div>
  );
}

// ---------- Legend ----------

function Legend() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-3">
      <ul className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <li className="chip">
          <CheckCircle2
            className="h-3.5 w-3.5 text-mp-red"
            aria-hidden
          />
          Validée
        </li>
        <li className="chip">
          <Flag className="h-3.5 w-3.5 text-mp-red" aria-hidden />
          En cours
        </li>
        <li className="chip">
          <Lock className="h-3.5 w-3.5 text-mp-ink-soft/80" aria-hidden />
          Verrouillée
        </li>
      </ul>
    </div>
  );
}

// ---------- Trail container ----------

function TrailContainer({
  ordered,
  completed,
  nextStandId,
  doneCount,
}: {
  ordered: StandLite[];
  completed: Set<number>;
  nextStandId: number | null;
  doneCount: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 15%"],
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only manipulate scroll when the map itself is the visible route —
    // on /map/[standId] the modal is open over the trail, we must not
    // consume the saved scroll key there.
    if (pathname !== "/map") return;

    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) {
      const [yStr, savedActive] = saved.split(":");
      sessionStorage.removeItem(SCROLL_KEY);
      const y = Number.parseInt(yStr, 10);
      const sameActive = savedActive === String(nextStandId ?? "");
      if (sameActive && Number.isFinite(y)) {
        requestAnimationFrame(() =>
          window.scrollTo({ top: y, behavior: "auto" })
        );
        return;
      }
      // active stand changed (user validated) → fall through and center
      // the new active station instead of restoring stale scroll
    }
    if (nextStandId != null) {
      const el = document.getElementById(`station-${nextStandId}`);
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({
            behavior: reducedMotion ? "auto" : "smooth",
            block: "center",
          });
        });
      }
    }
  }, [pathname, nextStandId, reducedMotion]);

  return (
    <div ref={containerRef} className="relative mx-auto max-w-2xl">
      <TrailDecor />
      <TrailPath
        total={ordered.length}
        doneCount={doneCount}
        scrollYProgress={scrollYProgress}
        reducedMotion={reducedMotion ?? false}
      />
      <ol className="relative list-none px-4">
        {ordered.map((s, idx) => {
          const status = statusOf(s, completed, nextStandId);
          const side: "left" | "right" = idx % 2 === 0 ? "left" : "right";
          return (
            <Station
              key={s.id}
              stand={s}
              status={status}
              side={side}
              reducedMotion={reducedMotion ?? false}
            />
          );
        })}
      </ol>
    </div>
  );
}

// ---------- Serpentine SVG path ----------

function buildSerpentinePath(total: number): {
  fullD: string;
  points: { x: number; y: number }[];
} {
  if (total === 0) return { fullD: "", points: [] };
  const points = Array.from({ length: total }, (_, i) => ({
    x: i % 2 === 0 ? 35 : 65,
    y: ((i + 0.5) * 100) / total,
  }));
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }
  return { fullD: d, points };
}

function TrailPath({
  total,
  doneCount,
  scrollYProgress,
  reducedMotion,
}: {
  total: number;
  doneCount: number;
  scrollYProgress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const { fullD } = useMemo(() => buildSerpentinePath(total), [total]);
  const progressRatio = total > 0 ? Math.min(1, (doneCount + 0.5) / total) : 0;

  const scrollPathLength = useTransform(
    scrollYProgress,
    [0, 1],
    [0, progressRatio]
  );
  const pathLength: MotionValue<number> | number = reducedMotion
    ? progressRatio
    : scrollPathLength;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <path
        d={fullD}
        fill="none"
        stroke="rgb(58 40 24 / 0.22)"
        strokeWidth="0.7"
        strokeDasharray="1.8 2.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <motion.path
        d={fullD}
        fill="none"
        stroke="var(--mp-red)"
        strokeWidth="1.2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ pathLength }}
      />
    </svg>
  );
}

// ---------- Station ----------

function Station({
  stand,
  status,
  side,
  reducedMotion,
}: {
  stand: StandLite;
  status: Status;
  side: "left" | "right";
  reducedMotion: boolean;
}) {
  const router = useRouter();
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, {
    once: true,
    margin: "0px 0px -20% 0px",
  });

  const handleNavigate = () => {
    if (status !== "active") return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        SCROLL_KEY,
        `${window.scrollY}:${stand.id}`
      );
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(12);
      } catch {
        /* no-op */
      }
    }
    router.push(`/map/${stand.id}`);
  };

  return (
    <li
      ref={ref}
      id={`station-${stand.id}`}
      className={clsx(
        "relative flex min-h-[55vh] items-center sm:min-h-[60vh]",
        side === "left" ? "justify-start pl-[6%]" : "justify-end pr-[6%]"
      )}
    >
      <motion.div
        className="flex max-w-[280px] flex-col items-center gap-3 text-center"
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        animate={
          reducedMotion || inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }
        }
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <StationCircle
          status={status}
          order={stand.order_index}
          standName={stand.name}
          onActivate={handleNavigate}
          reducedMotion={reducedMotion}
        />
        <StationLabel
          status={status}
          order={stand.order_index}
          name={stand.name}
        />
        {status === "active" && (
          <StationCard onActivate={handleNavigate} reducedMotion={reducedMotion} />
        )}
      </motion.div>
    </li>
  );
}

function StationCircle({
  status,
  order,
  standName,
  onActivate,
  reducedMotion,
}: {
  status: Status;
  order: number;
  standName: string;
  onActivate: () => void;
  reducedMotion: boolean;
}) {
  const orderBadge = (
    <span
      className="absolute -bottom-1 -right-1 flex h-6 min-w-[24px] items-center justify-center rounded-full border-2 border-white bg-mp-ink px-1 font-display text-[10px] font-bold text-white"
      aria-hidden
    >
      {order}
    </span>
  );

  if (status === "active") {
    return (
      <motion.button
        type="button"
        onClick={onActivate}
        aria-label={`Étape ${order} en cours. Ouvrir l'énigme.`}
        className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-mp-coral to-mp-orange text-white shadow-mp-strong focus-visible:outline-none"
        whileTap={{ scale: 0.94 }}
      >
        {!reducedMotion && (
          <>
            <span
              className="pointer-events-none absolute inset-0 -z-10 hidden rounded-full bg-mp-coral/30 motion-safe:animate-pulse-ring md:block"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute -inset-2 -z-10 rounded-full border-2 border-mp-coral/40"
              aria-hidden
            />
          </>
        )}
        <Flag className="h-8 w-8" strokeWidth={2.2} aria-hidden />
        {orderBadge}
      </motion.button>
    );
  }

  if (status === "done") {
    return (
      <div
        role="img"
        aria-label={`Étape ${order} validée : ${standName}`}
        className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-white bg-mp-red text-white shadow-mp"
      >
        <CheckCircle2 className="h-8 w-8" strokeWidth={2.2} aria-hidden />
        {orderBadge}
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`Étape ${order} verrouillée. Termine les étapes précédentes d'abord.`}
      className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-mp-sky/60 bg-mp-sky/40 text-mp-ink-soft/80"
    >
      <Lock className="h-7 w-7" strokeWidth={2} aria-hidden />
      <span
        className="absolute -bottom-1 -right-1 flex h-6 min-w-[24px] items-center justify-center rounded-full border-2 border-white bg-mp-ink/70 px-1 font-display text-[10px] font-bold text-white"
        aria-hidden
      >
        {order}
      </span>
    </div>
  );
}

function StationLabel({
  status,
  order,
  name,
}: {
  status: Status;
  order: number;
  name: string;
}) {
  const paddedOrder = String(order).padStart(2, "0");
  return (
    <div className="flex flex-col items-center gap-0.5">
      <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-mp-ink-soft">
        Étape {paddedOrder}
        {status === "active" ? " · En cours" : ""}
      </p>
      {status === "done" ? (
        <>
          <p className="text-[15px] font-semibold text-mp-ink">
            {name}
          </p>
          <p className="text-xs text-mp-ink-soft">
            Initiale :{" "}
            <span className="gold-initial">
              {(name[0] ?? "").toUpperCase()}
            </span>
          </p>
        </>
      ) : status === "active" ? (
        <p className="text-[15px] font-semibold text-mp-ink">
          À découvrir
        </p>
      ) : (
        <p className="inline-flex items-center gap-1 text-[14px] text-mp-ink-soft">
          <Lock className="h-3.5 w-3.5" aria-hidden />
          Verrouillée
        </p>
      )}
    </div>
  );
}

function StationCard({
  onActivate,
  reducedMotion,
}: {
  onActivate: () => void;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 22,
        delay: 0.08,
      }}
      className="w-full max-w-[280px] rounded-2xl border-2 border-mp-coral/40 bg-gradient-to-br from-white to-mp-sky-soft p-4 text-left shadow-mp-card"
    >
      <div className="mb-2 flex items-center gap-2 text-mp-red">
        <HelpCircle className="h-5 w-5" strokeWidth={2} aria-hidden />
        <span className="font-display text-sm font-bold italic uppercase tracking-wider">
          Énigme à résoudre
        </span>
      </div>
      <p className="mb-3 text-sm leading-snug text-mp-ink">
        Un stand t&apos;attend au festival. Résous son énigme pour poursuivre
        l&apos;aventure.
      </p>
      <motion.button
        type="button"
        onClick={onActivate}
        whileTap={{ scale: 0.97 }}
        className="btn-gradient w-full"
        style={{ minHeight: 48 }}
      >
        Ouvrir l&apos;énigme
        <ChevronRight className="h-4 w-4" aria-hidden />
      </motion.button>
    </motion.div>
  );
}

// ---------- Trophy footer ----------

function TrophyFooter({
  doneCount,
  total,
  allDone,
}: {
  doneCount: number;
  total: number;
  allDone: boolean;
}) {
  return (
    <section
      className="mx-auto mt-6 max-w-2xl px-4 pt-10 text-center"
      style={{ paddingBottom: `calc(3rem + env(safe-area-inset-bottom))` }}
    >
      <div
        className={clsx(
          "mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 shadow-mp",
          allDone
            ? "border-mp-orange bg-gradient-to-br from-mp-coral/30 to-mp-orange/40"
            : "border-mp-sky/60 bg-mp-sky/30"
        )}
      >
        <Trophy
          className={clsx(
            "h-10 w-10",
            allDone ? "text-mp-red" : "text-mp-ink-soft/70"
          )}
          strokeWidth={2}
          aria-hidden
        />
      </div>
      <h2 className="font-display text-2xl text-mp-red">
        Le trésor final
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-snug text-mp-ink-soft">
        {allDone
          ? "Toutes les étapes sont validées. À toi de deviner l'anime caché."
          : "Devine l'anime caché une fois les 10 étapes complétées."}
      </p>

      {allDone ? (
        <Link
          href="/final"
          className="btn-gold mt-6 inline-flex px-8"
          style={{ minHeight: 48 }}
        >
          Tenter ma chance
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="btn-gold mt-6 inline-flex px-8 opacity-40"
            style={{ minHeight: 48 }}
          >
            Tenter ma chance
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
          <p className="mt-3 text-xs text-mp-ink-soft">
            Termine les {total} étapes pour tenter le code final ({doneCount}/
            {total})
          </p>
        </>
      )}
    </section>
  );
}

// ---------- Decorative elements (Manga Paradise feel) ----------

function TrailDecor() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* Illustration de fond : carte trésor verticale Manga Paradise
          Départ rouge en haut (torii) → arrivée livre doré tout en bas.
          Tirée en cover pleine largeur, opacité réduite pour que les
          cartes d'étape restent lisibles. */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "url('/map/treasure-map-bg.webp')",
          backgroundSize: "100% auto",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top center",
        }}
      />
      {/* Voile blanc dégradé pour apaiser la lisibilité sur mobile */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(248,251,255,0.55) 0%, rgba(248,251,255,0.35) 20%, rgba(248,251,255,0.35) 80%, rgba(248,251,255,0.55) 100%)",
        }}
      />
    </div>
  );
}
