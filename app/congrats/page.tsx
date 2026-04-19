"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShareButtons } from "@/components/ShareButtons";
import { Trophy, Sparkles } from "lucide-react";

const Confetti = dynamic(() => import("@/components/Confetti"), { ssr: false });

interface Me {
  participant: {
    first_name: string;
    pseudo: string;
    is_winner_eligible: boolean;
    completed_at: string | null;
  };
}

export default function CongratsPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/me", { cache: "no-store" });
      if (r.status === 401) {
        router.replace("/inscription");
        return;
      }
      const json = (await r.json()) as Me;
      if (!json.participant.is_winner_eligible) {
        router.replace("/final");
        return;
      }
      setMe(json);
    })();
  }, [router]);

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 text-center sm:py-16">
      <Confetti fire={Boolean(me)} />
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-treasure-gold text-parchment-ink shadow-treasure">
          <Trophy className="h-10 w-10" />
        </div>
      </div>
      <h1 className="font-display text-4xl text-treasure-red sm:text-5xl">
        Félicitations{me?.participant.pseudo ? `, ${me.participant.pseudo}` : ""}&nbsp;!
      </h1>
      <p className="mt-3 text-lg text-parchment-ink/80">
        Tu as percé le secret de la chasse au trésor PAF 2K26. Le nom de l'anime
        caché était bien <strong>ANGEL BEATS</strong>.
      </p>

      <div className="parchment-panel mt-8 p-6 text-left sm:p-8">
        <div className="mb-2 flex items-center gap-2 font-display text-xl text-parchment-ink">
          <Sparkles className="h-5 w-5 text-treasure-gold" />
          Tirage au sort
        </div>
        <p className="text-sm text-parchment-ink/80">
          Tu es officiellement inscrit·e au tirage au sort final pour gagner une{" "}
          <strong>figurine officielle d'une valeur d'environ 300&nbsp;€</strong>.
          Le tirage aura lieu à la fin du Play Azure Festival 2026. Le ou la
          gagnant·e sera contacté·e par email directement. Bonne chance&nbsp;!
        </p>
        <p className="mt-3 text-xs text-parchment-ink/60">
          Tu peux refermer cette page — ta participation est bien enregistrée.
        </p>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-parchment-ink/60">
          Partage ton exploit
        </p>
        <ShareButtons />
      </div>

      <Link href="/" className="mt-10 inline-block text-sm text-parchment-ink/60 underline">
        Retour à l'accueil
      </Link>
    </main>
  );
}
