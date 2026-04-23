"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Compass,
  HelpCircle,
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
              <>Lis attentivement l&apos;énigme de l&apos;étape en cours.</>,
              <>
                Essaie de deviner de quel stand on parle grâce aux indices
                qui apparaissent en dessous. Si tu ne trouves pas,
                n&apos;hésite pas à revenir sur le stand Manga Paradise :
                on est là pour t&apos;aider.
              </>,
              <>
                Une fois sur le bon stand, trouve le personnage d&apos;anime
                qui lui est associé.{" "}
                <em>
                  (N&apos;hésite pas à demander à l&apos;exposant qui gère
                  le stand de te montrer le personnage en question —
                  c&apos;est fait pour.)
                </em>
              </>,
              <>
                Reviens dans l&apos;app, tape le{" "}
                <strong>prénom + nom complet</strong> du personnage,
                exactement comme l&apos;exposant te l&apos;a donné. Pas de
                faute, sinon l&apos;app ne valide pas. Exemple : «&nbsp;Nagisa
                Shiota&nbsp;» et pas juste «&nbsp;Nagisa&nbsp;».
              </>,
              <>
                Répète ça 10 fois pour débloquer la dernière épreuve et
                trouver le mot secret final.
              </>,
            ].map((node, i) => (
              <li key={i} className="flex items-start gap-2">
                <Sakura size={16} className="mt-1 shrink-0" />
                <span>
                  <span className="font-semibold text-mp-red">
                    {i + 1}.
                  </span>{" "}
                  {node}
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
            Quand tu auras trouvé les 10 personnages, l&apos;app te
            demandera d&apos;associer chaque personnage à son{" "}
            <strong>rôle narratif</strong>.
          </p>
          <p className="mt-3">
            Chaque personnage a un rôle que tu vas devoir retrouver.
            Voici les 10 rôles que tu croiseras :
          </p>
          <ul className="mt-2 space-y-1.5">
            {[
              "Le stratège",
              "L'assassin",
              "Le sensei",
              "La mort",
              "Le carnivore",
              "La hyène",
              "L'alchimiste",
              "L'orphelin",
              "Le capitaine",
              "La princesse",
            ].map((r) => (
              <li key={r} className="flex items-start gap-2">
                <Sakura size={14} className="mt-1 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3">
            Une fois que tu auras bien associé chaque personnage à son
            rôle, prends la{" "}
            <strong>première lettre de chaque personnage</strong> dans
            l&apos;ordre donné : ça te révèle le nom d&apos;un anime culte.
            Saisis ce nom d&apos;anime pour valider l&apos;épreuve et tu
            seras inscrit au tirage.
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
              "Une seule participation par adresse email.",
              "Si tu es bloqué, un indice bonus apparaîtra après ton premier essai raté.",
              "Tu peux suspendre et revenir plus tard, ta progression est sauvegardée.",
            ].map((txt, i) => (
              <li key={i} className="flex items-start gap-2">
                <Sakura size={16} className="mt-1 shrink-0" />
                <span className="inline-flex items-center gap-1">
                  {txt.startsWith("Une seule") && (
                    <Mail className="h-3.5 w-3.5" aria-hidden />
                  )}
                  {txt}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          tone="sky"
          icon={<HelpCircle className="h-5 w-5" />}
          title="Tu ne sais pas ?"
        >
          <p>
            Pour toute question ou si tu restes bloqué sur une étape,
            retourne sur le <strong>stand Manga Paradise</strong> : on est là
            pour te donner un tip ou une aide.
          </p>
        </Section>

        <Section
          tone="red"
          icon={<Trophy className="h-5 w-5" />}
          title="🎁 Les récompenses"
        >
          <p>
            Une <strong>figurine Tsume de Deku</strong> (Izuku Midoriya, My Hero Academia) d&apos;une valeur de <strong>300&nbsp;€</strong>, à gagner par tirage au sort parmi tous les participants de la chasse au trésor du Play Azur Festival 2026.
          </p>
          <p className="mt-3 text-sm text-mp-ink-soft">
            Le tirage au sort aura lieu en live sur l&apos;Instagram <strong>@mangaparadise_officiel</strong> à l&apos;issue de l&apos;événement.
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
