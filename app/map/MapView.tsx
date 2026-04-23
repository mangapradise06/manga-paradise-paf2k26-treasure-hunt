"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TreasureTrail, TrailSkeleton } from "@/components/TreasureTrail";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { RotateCcw } from "lucide-react";
import { StuckHint } from "@/components/StuckHint";

interface StandLite {
  id: number;
  order_index: number;
  name: string;
  map_x: number;
  map_y: number;
}
interface MeData {
  participant: {
    pseudo: string;
    first_name: string;
    completed_at: string | null;
    onboarding_seen?: boolean;
    reset_used?: boolean;
  };
  progress: { stand_id: number }[];
  stands: StandLite[];
  nextStandId: number | null;
}

export default function MapView({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const [me, setMe] = useState<MeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

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
      if (data.participant.onboarding_seen === false) {
        router.replace("/onboarding");
        return;
      }
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

  async function confirmReset() {
    setResetting(true);
    try {
      const r = await fetch("/api/reset", { method: "POST" });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast(json.error ?? "Reset impossible.", { variant: "error" });
        setResetting(false);
        return;
      }
      toast("Progression réinitialisée.", { variant: "success" });
      setConfirmOpen(false);
      setResetting(false);
      // Recharge la page pour repartir proprement
      window.location.href = "/map";
    } catch {
      toast("Erreur réseau.", { variant: "error" });
      setResetting(false);
    }
  }

  if (error) {
    return (
      <main className="mx-auto max-w-xl px-5 py-10 text-center">
        <p className="text-mp-red">{error}</p>
        <button onClick={load} className="btn-ghost mt-4">
          Réessayer
        </button>
      </main>
    );
  }

  if (!me) {
    return (
      <main className="map-bg">
        <TrailSkeleton />
      </main>
    );
  }

  const completedIds = me.progress.map((p) => p.stand_id);
  const canReset = me.participant.reset_used === false;

  return (
    <main className="map-bg">
      <TreasureTrail
        pseudo={me.participant.pseudo || me.participant.first_name}
        stands={me.stands}
        completedStandIds={completedIds}
        nextStandId={me.nextStandId}
      />

      {canReset && (
        <section
          className="mx-auto max-w-2xl px-4 pb-16 text-center"
          style={{ paddingBottom: `calc(4rem + env(safe-area-inset-bottom))` }}
        >
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border-2 border-mp-red bg-transparent px-4 py-2 text-xs font-semibold text-mp-red transition hover:bg-mp-red/5"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Tu as un bug ? Recommencer la chasse
          </button>
        </section>
      )}

      <Dialog
        open={confirmOpen}
        onClose={() => (resetting ? undefined : setConfirmOpen(false))}
        title="Recommencer la chasse ?"
        subtitle="Cette action efface ta progression et ne peut être utilisée qu'une seule fois."
      >
        <div className="space-y-4">
          <p className="text-sm text-mp-ink">
            Es-tu sûr ? Toutes tes étapes validées et tes essais seront remis à
            zéro. Ton compte reste le même, tu repartiras de l&apos;étape 1.
          </p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={resetting}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={confirmReset}
              loading={resetting}
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Confirmer le reset
            </Button>
          </div>
        </div>
      </Dialog>

      {children}

      {/* Joker flottant : coup de pouce si bloqué */}
      <StuckHint variant="floating" align="left" />
    </main>
  );
}
