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
              Play Azure Festival 2026 · Nice
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
            10 stands, 10 énigmes, 10 personnages à recruter. Rassemble leurs
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
