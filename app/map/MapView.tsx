"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TreasureMap } from "@/components/TreasureMap";
import { ProgressBar } from "@/components/ProgressBar";
import { useToast } from "@/components/Toast";
import { LogOut, Sparkles } from "lucide-react";

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
  const { toast } = useToast();
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
        // déjà fini → /congrats
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

  // Les modales sont des pages enfants qui rendent ce MapView → elles
  // peuvent rafraîchir les données via router.refresh() et nous recharger.
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
      <main className="mx-auto max-w-xl px-5 py-10 text-center">
        <span className="dot-spin" aria-hidden />
        <p className="mt-3 text-parchment-ink/70">Chargement de la carte…</p>
      </main>
    );
  }

  const completedIds = me.progress.map((p) => p.stand_id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-parchment-ink/60">
            Ahoy, {me.participant.pseudo || me.participant.first_name} !
          </p>
          <h1 className="font-display text-2xl text-treasure-red sm:text-3xl">
            Ta carte au trésor
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {completedIds.length >= 10 && (
            <Link href="/final" className="btn-gold">
              <Sparkles className="h-4 w-4" /> Épreuve finale
            </Link>
          )}
          <button
            onClick={async () => {
              // simple : clear cookie côté client n'est pas possible httpOnly,
              // mais navigation vers /inscription suffit à recommencer.
              toast("Pour changer d'identité, vide les cookies.", {
                variant: "info",
              });
            }}
            className="btn-ghost hidden sm:inline-flex"
            aria-label="Se déconnecter"
          >
            <LogOut className="h-4 w-4" /> Quitter
          </button>
        </div>
      </header>

      <ProgressBar value={completedIds.length} total={10} className="mb-5" />

      <TreasureMap
        stands={me.stands}
        completedStandIds={completedIds}
        nextStandId={me.nextStandId}
      />

      <p className="mx-auto mt-6 max-w-prose text-center text-sm text-parchment-ink/70">
        Clique sur la croix rouge clignotante pour découvrir l'énigme du stand en
        cours. Les étapes suivantes se dévoilent à mesure de tes réussites.
      </p>

      {children}
    </main>
  );
}
