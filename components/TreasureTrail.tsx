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

  return (
    <>
      <StickyHeader
        pseudo={pseudo}
        doneCount={doneCount}
        total={total}
        etaMinutes={etaMinutes}
        activeIndex={activeIndex}
        allDone={allDone}
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
        className="sticky top-0 z-40 border-b border-parchment-ink/10 bg-parchment-light/80 backdrop-blur-md"
        style={{
          paddingTop: `calc(0.75rem + env(safe-area-inset-top))`,
          paddingBottom: "0.75rem",
        }}
        aria-hidden
      >
        <div className="mx-auto max-w-2xl px-4">
          <div className="h-3 w-28 animate-pulse rounded bg-parchment-ink/10" />
          <div className="mt-2 h-7 w-56 animate-pulse rounded bg-parchment-ink/10" />
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 animate-pulse rounded-full bg-parchment-ink/10"
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
              className="h-6 w-24 animate-pulse rounded-full bg-parchment-ink/10"
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
              <div className="h-[72px] w-[72px] animate-pulse rounded-full bg-parchment-ink/10" />
              <div className="h-2.5 w-20 animate-pulse rounded bg-parchment-ink/10" />
              <div className="h-4 w-32 animate-pulse rounded bg-parchment-ink/10" />
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
}: {
  pseudo: string;
  doneCount: number;
  total: number;
  etaMinutes: number;
  activeIndex: number;
  allDone: boolean;
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
        "sticky top-0 z-40 border-b border-parchment-ink/15 bg-parchment-light/85 backdrop-blur-md transition-[padding] duration-200 ease-out",
        compact ? "pb-2" : "pb-3"
      )}
      style={{
        paddingTop: `calc(${compact ? "0.5rem" : "1rem"} + env(safe-area-inset-top))`,
      }}
    >
      <div className="mx-auto max-w-2xl px-4">
        {!compact && (
          <p className="text-[11px] uppercase tracking-widest text-parchment-ink/60">
            Ahoy, {pseudo} !
          </p>
        )}
        <h1
          className={clsx(
            "font-display text-treasure-red transition-[font-size] duration-200",
            compact ? "text-lg leading-tight" : "text-2xl leading-tight sm:text-3xl"
          )}
        >
          Ta carte au trésor
        </h1>
        <SegmentedProgress
          doneCount={doneCount}
          total={total}
          activeIndex={activeIndex}
          className="mt-2"
        />
        {!compact && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-parchment-ink/70">
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
  doneCount,
  total,
  activeIndex,
  className,
}: {
  doneCount: number;
  total: number;
  activeIndex: number;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
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
        {Array.from({ length: total }).map((_, i) => {
          const isDone = i < doneCount;
          const isActive = i === activeIndex;
          return (
            <span
              key={i}
              className={clsx(
                "h-1.5 flex-1 rounded-full transition-colors duration-300 ease-out",
                isDone
                  ? "bg-treasure-red"
                  : isActive
                    ? "bg-treasure-red/55"
                    : "bg-parchment-ink/15",
                isActive && !reducedMotion && "motion-safe:animate-pulse"
              )}
              aria-hidden
            />
          );
        })}
      </div>
      <span className="ml-1 shrink-0 font-display text-sm text-treasure-red">
        {doneCount}/{total}
      </span>
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
            className="h-3.5 w-3.5 text-treasure-green"
            aria-hidden
          />
          Validée
        </li>
        <li className="chip">
          <Flag className="h-3.5 w-3.5 text-treasure-red" aria-hidden />
          En cours
        </li>
        <li className="chip">
          <Lock className="h-3.5 w-3.5 text-parchment-ink/50" aria-hidden />
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
        stroke="var(--treasure-red)"
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
      className="absolute -bottom-1 -right-1 flex h-6 min-w-[24px] items-center justify-center rounded-full border-2 border-parchment-light bg-parchment-ink px-1 font-display text-[10px] font-bold text-parchment-light"
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
        className="relative flex h-20 w-20 items-center justify-center rounded-full bg-treasure-red text-parchment-light shadow-treasure focus-visible:outline-none"
        whileTap={{ scale: 0.94 }}
      >
        {!reducedMotion && (
          <>
            <span
              className="pointer-events-none absolute inset-0 -z-10 animate-pulse-ring rounded-full bg-treasure-red/45"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute -inset-2 -z-10 rounded-full border-2 border-treasure-red/30"
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
        className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-parchment-ink/25 bg-treasure-green text-parchment-light shadow-treasure"
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
      className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-parchment-dark bg-parchment-light/60 text-parchment-ink/50"
    >
      <Lock className="h-7 w-7" strokeWidth={2} aria-hidden />
      <span
        className="absolute -bottom-1 -right-1 flex h-6 min-w-[24px] items-center justify-center rounded-full border-2 border-parchment-light bg-parchment-ink/70 px-1 font-display text-[10px] font-bold text-parchment-light"
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
      <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-parchment-ink/60">
        Étape {paddedOrder}
        {status === "active" ? " · En cours" : ""}
      </p>
      {status === "done" ? (
        <>
          <p className="text-[15px] font-semibold text-parchment-ink">
            {name}
          </p>
          <p className="text-xs text-parchment-ink/70">
            Initiale :{" "}
            <span className="gold-initial">
              {(name[0] ?? "").toUpperCase()}
            </span>
          </p>
        </>
      ) : status === "active" ? (
        <p className="text-[15px] font-semibold text-parchment-ink">
          À découvrir
        </p>
      ) : (
        <p className="inline-flex items-center gap-1 text-[14px] text-parchment-ink/55">
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
      className="w-full max-w-[280px] rounded-2xl border-2 border-treasure-red/60 bg-parchment-light p-4 text-left shadow-treasure"
    >
      <div className="mb-2 flex items-center gap-2 text-treasure-red">
        <HelpCircle className="h-5 w-5" strokeWidth={2} aria-hidden />
        <span className="font-display text-sm font-bold uppercase tracking-wider">
          Énigme à résoudre
        </span>
      </div>
      <p className="mb-3 text-sm leading-snug text-parchment-ink/85">
        Un stand t&apos;attend au festival. Résous son énigme pour poursuivre
        l&apos;aventure.
      </p>
      <motion.button
        type="button"
        onClick={onActivate}
        whileTap={{ scale: 0.97 }}
        className="btn-primary w-full"
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
          "mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 shadow-treasure",
          allDone
            ? "border-treasure-gold bg-treasure-gold/25"
            : "border-parchment-dark bg-parchment-light/50"
        )}
      >
        <Trophy
          className={clsx(
            "h-10 w-10",
            allDone
              ? "text-treasure-gold motion-safe:animate-pulse"
              : "text-parchment-ink/45"
          )}
          strokeWidth={2}
          aria-hidden
        />
      </div>
      <h2 className="font-display text-2xl text-treasure-red">
        Le trésor final
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-snug text-parchment-ink/75">
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
          <p className="mt-3 text-xs text-parchment-ink/60">
            Termine les {total} étapes pour tenter le code final ({doneCount}/
            {total})
          </p>
        </>
      )}
    </section>
  );
}

// ---------- Decorative elements (pirate-map feel, pointer-events-none) ----------

function TrailDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <Mountain style={{ top: "8%", left: "2%" }} />
      <Palm style={{ top: "22%", right: "2%" }} />
      <CompassRose style={{ top: "44%", left: "3%" }} />
      <Boat style={{ top: "64%", right: "2%" }} />
      <Skull style={{ top: "84%", left: "3%" }} />
    </div>
  );
}

const decorInk = "rgb(58 40 24 / 0.5)";
const decorFill = "rgb(58 40 24 / 0.18)";
const decorStroke = 1.5;

function Mountain({ style }: { style: React.CSSProperties }) {
  return (
    <svg
      width="64"
      height="50"
      viewBox="0 0 64 50"
      className="absolute opacity-80"
      style={style}
      aria-hidden
    >
      <path
        d="M2 46 L18 18 L26 28 L38 8 L62 46 Z"
        fill={decorFill}
        stroke={decorInk}
        strokeWidth={decorStroke}
        strokeLinejoin="round"
      />
      <path
        d="M38 8 L34 16 M38 8 L42 16"
        stroke={decorInk}
        strokeWidth={1}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Palm({ style }: { style: React.CSSProperties }) {
  return (
    <svg
      width="52"
      height="66"
      viewBox="0 0 52 66"
      className="absolute opacity-80"
      style={style}
      aria-hidden
    >
      <path
        d="M26 64 Q24 42 22 22"
        stroke={decorInk}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M23 22 Q10 14 3 22 Q13 18 22 28"
        fill={decorFill}
        stroke={decorInk}
        strokeWidth={decorStroke}
        strokeLinejoin="round"
      />
      <path
        d="M23 22 Q36 8 48 18 Q38 18 24 28"
        fill={decorFill}
        stroke={decorInk}
        strokeWidth={decorStroke}
        strokeLinejoin="round"
      />
      <path
        d="M23 22 Q14 6 24 2 Q28 12 27 24"
        fill={decorFill}
        stroke={decorInk}
        strokeWidth={decorStroke}
        strokeLinejoin="round"
      />
      <path
        d="M26 64 Q22 60 18 62 M26 64 Q30 60 34 62"
        stroke={decorInk}
        strokeWidth={1.2}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CompassRose({ style }: { style: React.CSSProperties }) {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      className="absolute opacity-80"
      style={style}
      aria-hidden
    >
      <circle
        cx="28"
        cy="28"
        r="24"
        fill="rgb(58 40 24 / 0.08)"
        stroke={decorInk}
        strokeWidth={decorStroke}
      />
      <circle
        cx="28"
        cy="28"
        r="17"
        fill="none"
        stroke={decorInk}
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <path
        d="M28 6 L32 28 L28 50 L24 28 Z"
        fill="rgb(192 57 43 / 0.3)"
        stroke={decorInk}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <path
        d="M6 28 L28 24 L50 28 L28 32 Z"
        fill="rgb(58 40 24 / 0.14)"
        stroke={decorInk}
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <circle cx="28" cy="28" r="2.2" fill={decorInk} />
    </svg>
  );
}

function Boat({ style }: { style: React.CSSProperties }) {
  return (
    <svg
      width="62"
      height="52"
      viewBox="0 0 62 52"
      className="absolute opacity-80"
      style={style}
      aria-hidden
    >
      <path
        d="M4 36 L58 36 L50 46 L12 46 Z"
        fill={decorFill}
        stroke={decorInk}
        strokeWidth={decorStroke}
        strokeLinejoin="round"
      />
      <line
        x1="31"
        y1="36"
        x2="31"
        y2="6"
        stroke={decorInk}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d="M31 8 L48 22 L31 24 Z"
        fill={decorFill}
        stroke={decorInk}
        strokeWidth={1.3}
        strokeLinejoin="round"
      />
      <path
        d="M31 12 L15 24 L31 26 Z"
        fill={decorFill}
        stroke={decorInk}
        strokeWidth={1.3}
        strokeLinejoin="round"
      />
      <path
        d="M2 46 Q10 44 14 46 T26 46 T38 46 T50 46 T60 46"
        stroke={decorInk}
        strokeWidth={1}
        fill="none"
      />
    </svg>
  );
}

function Skull({ style }: { style: React.CSSProperties }) {
  return (
    <svg
      width="48"
      height="52"
      viewBox="0 0 48 52"
      className="absolute opacity-80"
      style={style}
      aria-hidden
    >
      <path
        d="M6 20 Q6 4 24 4 Q42 4 42 20 Q42 30 37 34 L37 40 L31 40 L31 44 L27 44 L27 38 L21 38 L21 44 L17 44 L17 40 L11 40 L11 34 Q6 30 6 20 Z"
        fill={decorFill}
        stroke={decorInk}
        strokeWidth={decorStroke}
        strokeLinejoin="round"
      />
      <circle cx="17" cy="20" r="3" fill={decorInk} />
      <circle cx="31" cy="20" r="3" fill={decorInk} />
      <path
        d="M21 28 L24 32 L27 28"
        stroke={decorInk}
        strokeWidth={1.3}
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}
