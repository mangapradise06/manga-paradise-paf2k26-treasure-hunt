import Link from "next/link";
import Image from "next/image";
import { Compass, MapPinned, Trophy } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center px-5 py-10 text-center sm:py-16">
      <div className="mb-6 flex flex-col items-center gap-3">
        <Image
          src="/logos/manga-paradise.svg"
          alt="Logo Manga Paradise"
          width={280}
          height={70}
          priority
        />
        <p className="chip border-treasure-gold/40 bg-treasure-gold/10 text-parchment-ink">
          Play Azure Festival 2026 — Nice
        </p>
      </div>

      <h1 className="font-display text-4xl leading-tight text-treasure-red drop-shadow-[0_2px_0_rgba(58,40,24,0.15)] sm:text-5xl md:text-6xl">
        Chasse au Trésor<br />
        <span className="text-parchment-ink">PAF 2K26</span>
      </h1>
      <p className="mt-4 max-w-xl text-parchment-ink/80 sm:text-lg">
        10 stands, 10 énigmes, 10 personnages à recruter. Rassemble leurs
        initiales, devine l'anime caché et tente de remporter une{" "}
        <strong>figurine officielle</strong>&nbsp;!
      </p>

      <section className="parchment-panel mt-8 w-full p-5 text-left sm:p-7">
        <h2 className="mb-3 font-display text-xl text-parchment-ink sm:text-2xl">
          Comment ça marche ?
        </h2>
        <ul className="space-y-3 text-parchment-ink/90">
          <li className="flex items-start gap-3">
            <MapPinned className="mt-0.5 h-5 w-5 shrink-0 text-treasure-red" />
            <span>
              Inscris-toi une seule fois et découvre ta carte avec 10 croix
              à explorer dans l'ordre du parcours.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Compass className="mt-0.5 h-5 w-5 shrink-0 text-treasure-red" />
            <span>
              À chaque stand, lis les 2 indices et devine le personnage d'anime
              associé. L'orthographe approximative est acceptée, pas de panique !
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-treasure-gold" />
            <span>
              Les 10 initiales forment le titre d'un anime. Devine-le pour
              entrer dans le tirage au sort final.
            </span>
          </li>
        </ul>
      </section>

      <Link href="/inscription" className="btn-primary mt-8 text-base sm:text-lg">
        Commencer l'aventure
      </Link>

      <p className="mt-10 max-w-prose text-xs text-parchment-ink/60">
        Événement organisé par l'association Manga Paradise (loi 1901). Tes
        données sont utilisées uniquement pour l'animation du jeu et le tirage
        au sort. Conformément au RGPD, tu peux demander leur suppression à tout
        moment à{" "}
        <a
          href="mailto:lucas.protin@manga-paradise.fr"
          className="underline hover:text-treasure-red"
        >
          lucas.protin@manga-paradise.fr
        </a>
        .
      </p>
    </main>
  );
}
