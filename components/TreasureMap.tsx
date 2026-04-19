"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useToast } from "./Toast";

interface StandLite {
  id: number;
  order_index: number;
  name: string;
  map_x: number;
  map_y: number;
}

interface Props {
  stands: StandLite[];
  completedStandIds: number[];
  nextStandId: number | null;
}

type Status = "done" | "active" | "locked";

function statusOf(
  stand: StandLite,
  completed: Set<number>,
  nextId: number | null
): Status {
  if (completed.has(stand.id)) return "done";
  if (nextId === stand.id) return "active";
  return "locked";
}

/**
 * Carte au trésor : SVG overlay positionné en absolute par-dessus l'image de fond.
 * viewBox 100x100 (coordonnées en %), preserveAspectRatio=none pour suivre
 * le ratio de l'image de fond.
 */
export function TreasureMap({ stands, completedStandIds, nextStandId }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const completed = new Set(completedStandIds);

  const ordered = [...stands].sort((a, b) => a.order_index - b.order_index);

  function handleClick(s: StandLite, status: Status) {
    if (status === "locked") {
      const needed = ordered.find((st) => !completed.has(st.id));
      toast(
        needed
          ? `Tu dois d'abord compléter l'étape ${needed.order_index} — ${needed.name}.`
          : "Cette étape est verrouillée.",
        { variant: "info" }
      );
      return;
    }
    router.push(`/map/${s.id}`);
  }

  // Trait pointillé entre croix complétées (+ vers la active)
  const pathPoints: { x: number; y: number }[] = [];
  for (const s of ordered) {
    if (completed.has(s.id)) pathPoints.push({ x: s.map_x, y: s.map_y });
  }
  // On trace aussi le segment jusqu'à la prochaine active si elle existe
  const activeStand = ordered.find((s) => s.id === nextStandId) ?? null;
  const pathForDone =
    pathPoints.length >= 2
      ? pathPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
      : null;
  const lastDone = pathPoints.at(-1);
  const dashedToActive =
    lastDone && activeStand
      ? `M ${lastDone.x} ${lastDone.y} L ${activeStand.map_x} ${activeStand.map_y}`
      : null;

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div
        className="parchment-panel relative overflow-hidden rounded-2xl p-1 sm:p-2"
        style={{ aspectRatio: "3 / 2" }}
      >
        {/* Fond carte */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/map/treasure-map-bg.svg"
          alt="Carte au trésor — Play Azure Festival 2026"
          className="absolute inset-0 h-full w-full rounded-xl object-cover"
          draggable={false}
        />

        {/* Overlay SVG */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-label="Carte des 10 étapes de la chasse au trésor"
        >
          {/* Trait des étapes validées */}
          {pathForDone && (
            <path
              d={pathForDone}
              fill="none"
              stroke="#27ae60"
              strokeWidth="0.5"
              strokeDasharray="1.2 1.2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              opacity="0.85"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-24"
                dur="1.2s"
                repeatCount="indefinite"
              />
            </path>
          )}
          {/* Trait pointillé vers la prochaine étape */}
          {dashedToActive && (
            <path
              d={dashedToActive}
              fill="none"
              stroke="#c0392b"
              strokeWidth="0.45"
              strokeDasharray="0.9 1.4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              opacity="0.9"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-24"
                dur="1.2s"
                repeatCount="indefinite"
              />
            </path>
          )}
        </svg>

        {/* Croix positionnées en absolute — boutons accessibles */}
        {ordered.map((s) => {
          const st = statusOf(s, completed, nextStandId);
          const label =
            st === "done"
              ? `Étape ${s.order_index} validée — ${s.name}`
              : st === "active"
              ? `Étape ${s.order_index} en cours — ${s.name}. Cliquer pour ouvrir l'énigme.`
              : `Étape ${s.order_index} verrouillée — termine d'abord les étapes précédentes.`;

          return (
            <button
              key={s.id}
              onClick={() => handleClick(s, st)}
              aria-label={label}
              title={label}
              className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
              style={{ left: `${s.map_x}%`, top: `${s.map_y}%` }}
            >
              <Cross status={st} order={s.order_index} />
              <span className="sr-only">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Légende */}
      <ul className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-parchment-ink/80 sm:gap-3">
        <li className="chip">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: "#27ae60" }}
          />
          Validée
        </li>
        <li className="chip">
          <span
            className="inline-block h-3 w-3 animate-pulse-ring rounded-full"
            style={{ background: "#c0392b" }}
          />
          En cours
        </li>
        <li className="chip">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: "#7f8c8d" }}
          />
          Verrouillée
        </li>
      </ul>
    </div>
  );
}

function Cross({ status, order }: { status: Status; order: number }) {
  const color =
    status === "done"
      ? "#27ae60"
      : status === "active"
      ? "#c0392b"
      : "#7f8c8d";
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: order * 0.03 }}
      className="relative"
    >
      {/* Halo clignotant si active */}
      {status === "active" && (
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-ring rounded-full"
          aria-hidden
          style={{
            width: 54,
            height: 54,
            background: "rgba(192, 57, 43, 0.35)",
            boxShadow: "0 0 0 6px rgba(192,57,43,0.25)",
          }}
        />
      )}
      {/* Pin */}
      <div
        className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-parchment-ink/80 bg-parchment-light shadow-treasure transition-transform group-hover:scale-110 sm:h-11 sm:w-11"
        style={{ color }}
      >
        {status === "done" ? (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M5 5L19 19M19 5L5 19" />
          </svg>
        )}
      </div>
      {/* Numéro */}
      <span
        className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-parchment-ink px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-parchment-light shadow"
        aria-hidden
      >
        {order}
      </span>
    </motion.div>
  );
}
