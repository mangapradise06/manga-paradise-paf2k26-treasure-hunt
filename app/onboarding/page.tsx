"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Compass,
  Lightbulb,
  Mail,
  MapPin,
  Rocket,
  ScrollText,
  Target,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Garde-fou : vérifie qu'on a bien une session + redirige si onboarding déjà vu.
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/me", { cache: "no-store" });
        if (r.status === 401) {
          router.replace("/inscription");
          return;
        }
        if (r.ok) {
          // Si l'utilisateur a déjà complété son onboarding, on saute.
          if (typeof document !== "undefined") {
            const seen = document.cookie
              .split(";")
              .some((c) => c.trim().startsWith("pp_onboarding=1"));
            if (seen) {
              router.replace("/map");
              return;
            }
          }
        }
      } catch {
        /* on laisse la page s'afficher en best-effort */
      }
      setAuthChecked(true);
    })();
  }, [router]);

  async function handleStart() {
    setSubmitting(true);
    try {
      const r = await fetch("/api/onboarding-seen", { method: "POST" });
      if (!r.ok) {
        toast("Impossible d'enregistrer, réessaie.", { variant: "error" });
        setSubmitting(false);
        return;
      }
    } catch {
      toast("Erreur réseau.", { variant: "error" });
      setSubmitting(false);
      return;
    }
    router.replace("/map");
  }

  if (!authChecked) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-5">
        <div className="flex items-center gap-2 text-parchment-ink/70">
          <span className="dot-spin" aria-hidden /> Chargement…
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-5 pb-40 pt-8 sm:py-12">
      <div className="parchment-panel p-6 sm:p-8">
        <h1 className="font-display text-3xl text-treasure-red sm:text-4xl">
          Bienvenue dans la chasse au trésor Manga Paradise !
        </h1>
        <p className="mt-3 text-sm text-parchment-ink/80 sm:text-base">
          Un petit briefing avant de partir à l&apos;aventure. Lis tranquillement,
          c&apos;est rapide.
        </p>

        <Section
          icon={<Target className="h-5 w-5 text-treasure-red" />}
          title="🎯 Le but"
        >
          <p>
            Retrouver 10 personnages d&apos;anime cachés dans 10 stands du Play
            Azur Festival 2026.
          </p>
        </Section>

        <Section
          icon={<ScrollText className="h-5 w-5 text-treasure-red" />}
          title="📜 Comment ça marche"
        >
          <ol className="mt-2 space-y-2 pl-5 [list-style:decimal]">
            <li>Lis l&apos;énigme de l&apos;étape en cours.</li>
            <li>
              Trouve le stand qu&apos;elle décrit. Pas de panique, il est
              forcément sur le site !
            </li>
            <li>
              Une fois sur place, trouve quel personnage d&apos;anime est
              associé à ce stand (parfois c&apos;est écrit, parfois il faut
              demander aux bénévoles).
            </li>
            <li>
              Reviens dans l&apos;app, tape le nom du personnage, et passe à
              l&apos;étape suivante.
            </li>
            <li>Répète 10 fois pour débloquer la dernière épreuve.</li>
          </ol>
        </Section>

        <Section
          icon={<Rocket className="h-5 w-5 text-treasure-red" />}
          title="⚡ L'épreuve finale"
        >
          <p>
            Quand tu auras trouvé les 10 personnages, tu devras reconstituer un
            mot secret en associant chaque personnage à son rôle narratif. Le
            personnage et son rôle t&apos;aideront à former un mot culte de la
            pop culture japonaise.
          </p>
        </Section>

        <Section
          icon={<Lightbulb className="h-5 w-5 text-treasure-red" />}
          title="💡 Astuces"
        >
          <ul className="mt-2 space-y-2 pl-5 [list-style:disc]">
            <li>Prends ton temps, la chasse dure toute la journée.</li>
            <li>
              Tu peux suspendre et revenir plus tard, ta progression est
              sauvegardée.
            </li>
            <li>
              Si tu es bloqué, un indice bonus apparaîtra après ton premier
              essai raté.
            </li>
            <li>
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                Une seule participation par email.
              </span>
            </li>
          </ul>
        </Section>

        <Section
          icon={<Trophy className="h-5 w-5 text-treasure-red" />}
          title="🎁 Les récompenses"
        >
          <p>
            <span className="font-semibold">1er au scratch-test</span>{" "}
            (rapidité sur le samedi) et{" "}
            <span className="font-semibold">tirage au sort</span> parmi les
            finishers : goodies, mangas, places VIP.
          </p>
        </Section>

        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-parchment-ink/15 bg-parchment-light/60 p-4 text-sm text-parchment-ink/80">
          <Compass className="h-5 w-5 shrink-0 text-treasure-gold" aria-hidden />
          <span>
            Dès que tu cliques sur <em>C&apos;est parti</em>, tu arrives sur ta
            carte au trésor. Bonne chasse !
          </span>
        </div>

        {/* CTA inline (fallback) — le sticky ci-dessous est prioritaire sur mobile */}
        <div className="mt-6 hidden sm:block">
          <Button
            type="button"
            variant="primary"
            onClick={handleStart}
            loading={submitting}
            className="w-full sm:w-auto"
          >
            <MapPin className="h-4 w-4" aria-hidden />
            C&apos;est parti !
          </Button>
        </div>
      </div>

      {/* Sticky CTA mobile */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center p-3 sm:hidden"
        style={{ paddingBottom: `calc(0.75rem + env(safe-area-inset-bottom))` }}
      >
        <div className="pointer-events-auto flex w-full max-w-md items-center justify-center rounded-full border border-parchment-ink/10 bg-parchment-light/95 px-3 py-2 shadow-treasure backdrop-blur-md">
          <Button
            type="button"
            variant="primary"
            onClick={handleStart}
            loading={submitting}
            className="w-full"
            style={{ minHeight: 48 }}
          >
            <Award className="h-4 w-4" aria-hidden />
            C&apos;est parti !
          </Button>
        </div>
      </div>
    </main>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 border-t border-parchment-ink/10 pt-5 first-of-type:mt-6 first-of-type:border-t-0 first-of-type:pt-4">
      <h2 className="flex items-center gap-2 font-display text-xl text-treasure-red sm:text-2xl">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-treasure-red/10">
          {icon}
        </span>
        {title}
      </h2>
      <div className="mt-2 text-sm text-parchment-ink/85 sm:text-base">
        {children}
      </div>
    </section>
  );
}
