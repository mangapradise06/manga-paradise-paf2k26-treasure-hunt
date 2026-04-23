"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShareButtons } from "@/components/ShareButtons";
import { Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Sakura } from "@/components/icons/Sakura";
import { Clouds } from "@/components/icons/Clouds";

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
    <main className="relative min-h-screen overflow-hidden">
      <Confetti fire={Boolean(me)} />

      {/* Hero with sunburst */}
      <section className="relative overflow-hidden sunburst-bg sunburst-fade-bottom pb-14 pt-12 sm:pb-20 sm:pt-20">
        {/* Floating sakura petals */}
        <Sakura
          className="pointer-events-none absolute left-6 top-10 h-7 w-7 text-sakura-dark/80 motion-safe:animate-float-slow"
          aria-hidden
        />
        <Sakura
          className="pointer-events-none absolute right-8 top-16 h-6 w-6 text-sakura-dark/70 motion-safe:animate-float-slow"
          style={{ animationDelay: "1.5s" }}
          aria-hidden
        />
        <Sakura
          className="pointer-events-none absolute left-12 bottom-24 h-5 w-5 text-sakura-dark/60 motion-safe:animate-float-slow"
          style={{ animationDelay: "0.7s" }}
          aria-hidden
        />
        <Sakura
          className="pointer-events-none absolute right-14 bottom-20 h-6 w-6 text-sakura-dark/60 motion-safe:animate-float-slow"
          style={{ animationDelay: "2.1s" }}
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-4 px-5 text-center">
          <div className="mb-2 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white/90 shadow-mp-strong motion-safe:animate-torii-bounce">
            <Logo size={96} alt="Manga Paradise" priority />
          </div>

          <h1 className="font-display italic text-4xl leading-none text-white sm:text-6xl mp-title-outline">
            FÉLICITATIONS&nbsp;!
          </h1>

          {me?.participant.pseudo && (
            <p className="font-display text-xl italic text-white drop-shadow sm:text-2xl">
              {me.participant.pseudo}
            </p>
          )}

          <p className="mt-2 max-w-xl text-sm text-mp-ink sm:text-base">
            Tu as percé le secret de la chasse au trésor PAF 2K26. Le nom de
            l&apos;anime caché était bien <strong>ANGEL BEATS</strong>.
          </p>
        </div>
      </section>

      {/* Results card */}
      <section className="relative z-10 mx-auto -mt-4 max-w-2xl px-5 pb-10 sm:pb-16">
        <div className="mp-card p-6 text-left sm:p-8">
          <div className="mb-2 flex items-center gap-2 font-display text-xl italic text-mp-red">
            <Sparkles className="h-5 w-5 text-mp-orange" aria-hidden />
            Tirage au sort
          </div>
          <p className="text-sm text-mp-ink sm:text-base">
            Tu es officiellement inscrit·e au tirage au sort final pour gagner
            une{" "}
            <strong>figurine officielle d&apos;une valeur d&apos;environ 300&nbsp;€</strong>.
            Le tirage aura lieu à la fin du Play Azure Festival 2026. Le ou la
            gagnant·e sera contacté·e par email directement. Bonne chance&nbsp;!
          </p>
          <p className="mt-3 text-xs text-mp-ink-soft">
            Tu peux refermer cette page — ta participation est bien enregistrée.
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-mp-coral">
            Partage ton exploit
          </p>
          <ShareButtons />
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="text-sm text-mp-ink-soft underline-offset-4 hover:text-mp-red hover:underline"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </section>

      {/* Cloud band footer */}
      <Clouds
        className="pointer-events-none absolute inset-x-0 bottom-0 w-full text-mp-sky-soft"
        aria-hidden
      />
    </main>
  );
}
