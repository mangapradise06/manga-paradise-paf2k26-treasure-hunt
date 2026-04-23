import Link from "next/link";
import Image from "next/image";
import { Compass, MapPinned, Trophy, ChevronRight } from "lucide-react";
import { MangaParadiseBackdrop } from "@/components/MangaParadiseBackdrop";
import { Logo } from "@/components/Logo";
import { ToriiIcon } from "@/components/icons/ToriiIcon";
import { Sakura } from "@/components/icons/Sakura";
import { Clouds } from "@/components/icons/Clouds";

export default function LandingPage() {
  return (
    <main className="relative">
      {/* ===== BANNIÈRE HORIZONTALE (logo officiel) ===== */}
      <div className="relative w-full">
        <Image
          src="/brand/banner-manga-paradise.webp"
          alt="Manga Paradise — L'appli des passionnés de pop culture japonaise"
          width={4249}
          height={1080}
          className="h-auto w-full"
          priority
          sizes="100vw"
        />
      </div>

      {/* ===== HERO ===== */}
      <MangaParadiseBackdrop variant="hero" height="64vh" withClouds withSakura>
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 pb-24 pt-10 text-center sm:pt-14">
          <div className="mb-5 flex flex-col items-center gap-3">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white/95 shadow-mp-strong">
              <Logo size={80} alt="Manga Paradise" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/25 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
              Play Azur Festival 2026 · Nice
            </span>
          </div>

          <h1 className="mp-title-outline font-display text-5xl italic leading-[0.95] tracking-wide sm:text-6xl md:text-7xl">
            CHASSE
            <br />
            AU TRÉSOR
          </h1>

          <p className="mt-5 max-w-xl text-base font-medium text-white/95 drop-shadow-[0_1px_0_rgba(179,23,57,0.5)] sm:text-lg">
            Play Azur Festival 2026 · 10 stands · 1 mot secret
          </p>

          <Link
            href="/inscription"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-mp-red shadow-mp-strong transition hover:bg-mp-sky-soft active:scale-[0.98] sm:text-lg"
          >
            <ToriiIcon size={22} color="#DC1E44" />
            Lancer l&apos;aventure
            <ChevronRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </MangaParadiseBackdrop>

      {/* ===== SECTION RÉCOMPENSE ===== */}
      <section className="relative mx-auto max-w-4xl px-5 pt-12 sm:pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-mp-red">
            À gagner
          </p>
          <h2 className="mt-2 font-display text-3xl italic text-mp-ink sm:text-4xl">
            Une figurine Tsume de Deku
          </h2>
          <p className="mt-3 text-sm text-mp-ink-soft sm:text-base">
            Izuku Midoriya (My Hero Academia) — édition officielle{" "}
            <strong>Tsume</strong> d&apos;une valeur de <strong>300&nbsp;€</strong>,
            à gagner par tirage au sort parmi tous les participants de la chasse au
            trésor du Play Azur Festival 2026.
          </p>
        </div>

        <div className="relative mt-8 overflow-hidden rounded-3xl shadow-mp-strong ring-2 ring-mp-red/20">
          <Image
            src="/brand/prize/deku-tsume.webp"
            alt="Figurine Tsume de Deku à gagner"
            width={2392}
            height={1080}
            className="h-auto w-full"
            priority={false}
            sizes="(max-width: 768px) 100vw, 900px"
          />
        </div>

        {/* Modalités du tirage */}
        <div className="mt-8 rounded-3xl border-2 border-mp-coral/40 bg-gradient-to-br from-mp-coral/10 via-mp-orange/10 to-mp-red/5 p-6 sm:p-8">
          <h3 className="font-display text-xl italic text-mp-red sm:text-2xl">
            Comment tenter ta chance ?
          </h3>
          <p className="mt-2 text-sm text-mp-ink sm:text-base">
            Plus tu participes, plus tu as de chances au tirage au sort.
          </p>

          <ul className="mt-6 space-y-5">
            {/* Bulle 1 : checkmark rouge */}
            <li className="flex items-center gap-4">
              <span
                aria-hidden
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-mp-red text-white shadow-mp-card sm:h-20 sm:w-20"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 sm:h-10 sm:w-10">
                  <polyline points="4 12 10 18 20 6" />
                </svg>
              </span>
              <span className="text-sm text-mp-ink sm:text-base">
                <strong>Tu participes 1 jour</strong> (samedi <em>ou</em> dimanche)
                <br />
                <span className="text-mp-ink-soft">→ inscription au tirage au sort.</span>
              </span>
            </li>

            {/* Bulle 2 : x2 corail */}
            <li className="flex items-center gap-4">
              <span
                aria-hidden
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-mp-coral font-display text-2xl italic font-extrabold text-white shadow-mp-card sm:h-20 sm:w-20 sm:text-3xl"
              >
                x2
              </span>
              <span className="text-sm text-mp-ink sm:text-base">
                <strong>Tu participes 2 jours</strong> (samedi <em>et</em> dimanche)
                <br />
                <span className="text-mp-ink-soft">→ 2 fois plus de chances de gagner.</span>
              </span>
            </li>

            {/* Bulle 3 : x3 orange */}
            <li className="flex items-center gap-4">
              <span
                aria-hidden
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-mp-orange font-display text-2xl italic font-extrabold text-white shadow-mp-card sm:h-20 sm:w-20 sm:text-3xl"
              >
                x3
              </span>
              <span className="text-sm text-mp-ink sm:text-base">
                <strong>Tu t&apos;inscris à la newsletter Manga Paradise</strong>
                <br />
                <span className="text-mp-ink-soft">→ 3 fois plus de chances de gagner.</span>
              </span>
            </li>
          </ul>

          <p className="mt-6 rounded-xl border border-mp-red/30 bg-white/70 p-3 text-xs text-mp-ink-soft sm:text-sm">
            Soit jusqu&apos;à <strong className="text-mp-red">3 chances maximum</strong> de remporter la figurine. Tirage live sur l&apos;<a href="https://www.instagram.com/mangaparadisesud/" target="_blank" rel="noopener" className="font-semibold text-mp-red underline decoration-mp-red/40 underline-offset-2 hover:decoration-mp-red">Instagram de Manga Paradise</a> à l&apos;issue du Play Azur Festival.
          </p>
        </div>
      </section>

      {/* ===== SECTION FEATURES ===== */}
      <section className="relative mx-auto max-w-5xl px-5 pb-16 pt-10 sm:pb-24 sm:pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-mp-red">
            Ton parcours
          </p>
          <h2 className="mt-2 font-display text-3xl italic text-mp-ink sm:text-4xl">
            Découvre · Explore · Gagne
          </h2>
          <p className="mt-3 text-sm text-mp-ink-soft sm:text-base">
            10 stands, 10 énigmes, 10 personnages à trouver. Rassemble leurs
            initiales, devine l&apos;anime caché et tente de remporter une
            figurine officielle.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          <FeatureCard
            tone="red"
            icon={<MapPinned className="h-6 w-6" />}
            title="Découvre"
            text="Une carte unique s'ouvre après ton inscription. 10 étapes à parcourir dans l'ordre."
          />
          <FeatureCard
            tone="coral"
            icon={<Compass className="h-6 w-6" />}
            title="Explore"
            text="Lis les indices, trouve le stand, rencontre le personnage. L'orthographe approximative est OK."
          />
          <FeatureCard
            tone="orange"
            icon={<Trophy className="h-6 w-6" />}
            title="Gagne"
            text="Les 10 initiales forment le titre d'un anime. Devine-le pour entrer dans le tirage au sort."
          />
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/inscription"
            className="btn-primary px-8 py-3 text-base"
          >
            Commencer l&apos;aventure
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ===== BULLE D'AIDE "Tu ne sais pas ?" ===== */}
      <section className="mx-auto max-w-3xl px-5 pt-4 pb-10">
        <div className="flex items-start gap-3 rounded-2xl border border-mp-sky/60 bg-mp-sky-soft/80 p-4 shadow-mp-card">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mp-red font-display text-2xl italic font-bold text-white">?</span>
          <div className="text-sm text-mp-ink sm:text-base">
            <p className="font-semibold text-mp-red">Tu ne sais pas ?</p>
            <p className="mt-1 text-mp-ink-soft">
              Pour toute question ou si tu es bloqué dans la chasse, retourne sur le <strong>stand Manga Paradise</strong> et demande un tip ou un coup de pouce aux bénévoles.
            </p>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative mt-8 overflow-hidden border-t border-mp-sky/40 bg-mp-sky-soft/60 pt-8">
        <Clouds
          className="pointer-events-none absolute inset-x-0 top-0 h-10 w-full -translate-y-1/2 opacity-60"
          color="#B9DBFF"
        />
        <div className="mx-auto max-w-3xl px-5 pb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-mp-red">
            <Sakura size={18} />
            Manga Paradise
            <Sakura size={18} />
          </div>
          <p className="mx-auto max-w-prose text-xs text-mp-ink-soft">
            Événement organisé par l&apos;association Manga Paradise (loi 1901). Tes
            données sont utilisées uniquement pour l&apos;animation du jeu et le
            tirage au sort. Conformément au RGPD, tu peux demander leur suppression
            à tout moment à{" "}
            <a
              href="mailto:lucas.protin@manga-paradise.fr"
              className="font-semibold text-mp-red underline"
            >
              lucas.protin@manga-paradise.fr
            </a>
            .
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  tone,
  icon,
  title,
  text,
}: {
  tone: "red" | "coral" | "orange";
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  const toneClasses = {
    red: { bg: "bg-mp-red", ring: "ring-mp-red/20" },
    coral: { bg: "bg-mp-coral", ring: "ring-mp-coral/20" },
    orange: { bg: "bg-mp-orange", ring: "ring-mp-orange/20" },
  }[tone];

  return (
    <div className="mp-card flex flex-col items-start gap-3 transition hover:-translate-y-0.5 hover:shadow-mp">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white ring-8 ${toneClasses.bg} ${toneClasses.ring}`}
      >
        {icon}
      </div>
      <h3 className="font-display text-xl italic text-mp-ink">{title}</h3>
      <p className="text-sm text-mp-ink-soft">{text}</p>
    </div>
  );
}
