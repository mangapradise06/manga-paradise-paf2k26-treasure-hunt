"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TreasureTrail, TrailSkeleton } from "@/components/TreasureTrail";

interface StandLite {
  id: number;
  order_index: number;
  name: string;
  map_x: number;
  map_y: number;
}
interface MeData {
  participant: { pseudo: string; first_name: string; completed_at: string | null };
  progress: { stand_id: number }[];
  stands: StandLite[];
  nextStandId: number | null;
}

export default function MapView({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const [me, setMe] = useState<MeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/me", { cache: "no-store" });
      if (r.status === 401) {
        router.replace("/inscription");
        return;
      }
      if (!r.ok) {
        setError("Impossible de charger ta progression.");
        return;
      }
      const data = (await r.json()) as MeData;
      setMe(data);
      if (data.participant.completed_at) {
        router.replace("/congrats");
      } else if (data.progress.length >= 10) {
        router.replace("/final");
      }
    } catch {
      setError("Erreur réseau.");
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener("mp:progress-updated", handler);
    return () => window.removeEventListener("mp:progress-updated", handler);
  }, [load]);

  if (error) {
    return (
      <main className="mx-auto max-w-xl px-5 py-10 text-center">
        <p className="text-treasure-red">{error}</p>
        <button onClick={load} className="btn-ghost mt-4">
          Réessayer
        </button>
      </main>
    );
  }

  if (!me) {
    return (
      <main>
        <TrailSkeleton />
      </main>
    );
  }

  const completedIds = me.progress.map((p) => p.stand_id);

  return (
    <main>
      <TreasureTrail
        pseudo={me.participant.pseudo || me.participant.first_name}
        stands={me.stands}
        completedStandIds={completedIds}
        nextStandId={me.nextStandId}
      />
      {children}
    </main>
  );
}
