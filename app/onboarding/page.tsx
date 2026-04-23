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
import { Sakura } from "@/components/icons/Sakura";

type PastilleTone = "red" | "coral" | "orange" | "sky";

const TONES: Record<
  PastilleTone,
  { wrapperBg: string; iconBg: string; iconColor: string }
> = {
  red: {
    wrapperBg: "bg-mp-red/10",
    iconBg: "bg-mp-red text-white",
    iconColor: "text-white",
  },
  coral: {
    wrapperBg: "bg-mp-coral/10",
    iconBg: "bg-mp-coral text-white",
    iconColor: "text-white",
  },
  orange: {
    wrapperBg: "bg-mp-orange/10",
    iconBg: "bg-mp-orange text-white",
    iconColor: "text-white",
  },
  sky: {
    wrapperBg: "bg-mp-sky/30",
    iconBg: "bg-mp-sky text-mp-ink",
    iconColor: "text-mp-ink",
  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Garde-fou : vérifie qu'on a bien une session + redirige si onboarding déjà vu.
  // Timeout court pour éviter tout spinner infini si l'API ne répond pas.
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    (async () => {
      try {
        const r = await fetch("/api/me", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (cancelled) return;
        if (r.status === 401) {
          router.replace("/inscription");
          return;
        }
        if (r.ok) {
          try {
            const data = (await r.json()) as { participant?: { onboarding_seen?: boolean } };
            if (!cancelled && data.participant?.onboarding_seen === true) {
              router.replace("/map");
              return;
            }
          } catch {
            /* ignore parse */
          }
        }
      } catch {
        /* best-effort */
      } finally {
        clearTimeout(timeoutId);
        if (!cancelled) setAuthChecked(true);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
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
        <div className="flex items-center gap-2 text-mp-ink-soft">
          <span className="dot-spin" aria-hidden /> Chargement…
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-5 pb-40 pt-6 sm:py-12">
      {/* Bannière gradient top */}
      <div className="mp-banner mb-5">
        <h1 className="font-display text-3xl italic sm:text-4xl">
          Bienvenue dans la chasse !
        </h1>
        <p className="mt-1 text-sm text-white/90 sm:text-base">
          Un petit briefing avant de partir à l&apos;aventure. Lis tranquillement, c&apos;est rapide.
        </p>
      </div>

      <div className="space-y-4">
        <Section
          tone="red"
          icon={<Target className="h-5 w-5" />}
          title="🎯 Le but"
        >
          <p>
            Retrouver 10 personnages d&apos;anime cachés dans 10 stands du Play
            Azur Festival 2026.
          </p>
        </Section>

        <Section
          tone="coral"
          icon={<ScrollText className="h-5 w-5" />}
          title="📜 Comment ça marche"
        >
          <ol className="mt-2 space-y-2">
            {[
              "Lis l'énigme de l'étape en cours.",
              "Trouve le stand qu'elle décrit. Pas de panique, il est forcément sur le site !",
              "Trouve quel personnage d'anime est associé à ce stand (parfois c'est écrit, parfois il faut demander aux bénévoles).",
              "Reviens dans l'app, tape le nom du personnage, et passe à l'étape suivante.",
              "Répète 10 fois pour débloquer la dernière épreuve.",
            ].map((txt, i) => (
              <li key={i} className="flex items-start gap-2">
                <Sakura size={18} className="mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold text-mp-red">
                    {i + 1}.
                  </span>{" "}
                  {txt}
                </span>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          tone="orange"
          icon={<Rocket className="h-5 w-5" />}
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
          tone="sky"
          icon={<Lightbulb className="h-5 w-5" />}
          title="💡 Astuces"
        >
          <ul className="mt-2 space-y-2">
            {[
              "Prends ton temps, la chasse dure toute la journée.",
              "Tu peux suspendre et revenir plus tard, ta progression est sauvegardée.",
              "Si tu es bloqué, un indice bonus apparaîtra après ton premier essai raté.",
            ].map((txt, i) => (
              <li key={i} className="flex items-start gap-2">
                <Sakura size={18} className="mt-0.5 shrink-0" />
                <span>{txt}</span>
              </li>
            ))}
            <li className="flex items-start gap-2">
              <Sakura size={18} className="mt-0.5 shrink-0" />
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                Une seule participation par email.
              </span>
            </li>
          </ul>
        </Section>

        <Section
          tone="red"
          icon={<Trophy className="h-5 w-5" />}
          title="🎁 Les récompenses"
        >
          <p>
            <span className="font-semibold">1er au scratch-test</span>{" "}
            (rapidité sur le samedi) et{" "}
            <span className="font-semibold">tirage au sort</span> parmi les
            finishers : goodies, mangas, places VIP.
          </p>
        </Section>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-mp-sky/40 bg-mp-sky-soft/60 p-4 text-sm text-mp-ink">
        <Compass className="h-5 w-5 shrink-0 text-mp-red" aria-hidden />
        <span>
          Dès que tu cliques sur <em>C&apos;est parti</em>, tu arrives sur ta
          carte au trésor. Bonne chasse !
        </span>
      </div>

      {/* CTA inline fallback desktop */}
      <div className="mt-6 hidden sm:block">
        <Button
          type="button"
          variant="gradient"
          onClick={handleStart}
          loading={submitting}
          className="w-full px-6 py-3 text-base sm:w-auto"
        >
          <MapPin className="h-4 w-4" aria-hidden />
          C&apos;est parti !
        </Button>
      </div>

      {/* Sticky CTA mobile */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center p-3 sm:hidden"
        style={{ paddingBottom: `calc(0.75rem + env(safe-area-inset-bottom))` }}
      >
        <div className="pointer-events-auto w-full max-w-md">
          <Button
            type="button"
            variant="gradient"
            onClick={handleStart}
            loading={submitting}
            className="w-full py-3 text-base shadow-mp-strong"
            style={{ minHeight: 52 }}
          >
            <Award className="h-5 w-5" aria-hidden />
            C&apos;est parti !
          </Button>
        </div>
      </div>
    </main>
  );
}

function Section({
  tone,
  icon,
  title,
  children,
}: {
  tone: PastilleTone;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <section
      className={`rounded-3xl border border-mp-sky/30 ${t.wrapperBg} p-5 sm:p-6`}
    >
      <h2 className="flex items-center gap-3 font-display italic text-xl text-mp-ink sm:text-2xl">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${t.iconBg}`}
        >
          {icon}
        </span>
        {title}
      </h2>
      <div className="mt-3 text-sm text-mp-ink sm:text-base">{children}</div>
    </section>
  );
}
