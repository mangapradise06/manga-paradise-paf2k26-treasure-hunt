import type { ReactNode } from "react";
import { Clouds } from "./icons/Clouds";
import { Sakura } from "./icons/Sakura";
import clsx from "clsx";

/**
 * Fond d'écran signature Manga Paradise :
 *  - sun-burst radial CSS rouge/orange au top
 *  - bande de nuages en bas de zone accent (transition)
 *  - décoration optionnelle (pétales sakura)
 *
 * Usage :
 *   <MangaParadiseBackdrop variant="hero" height="60vh">
 *     <HeroContent />
 *   </MangaParadiseBackdrop>
 */
interface Props {
  children?: ReactNode;
  variant?: "hero" | "soft" | "full";
  height?: string;
  withClouds?: boolean;
  withSakura?: boolean;
  className?: string;
}

export function MangaParadiseBackdrop({
  children,
  variant = "hero",
  height = "60vh",
  withClouds = true,
  withSakura = false,
  className,
}: Props) {
  const isFull = variant === "full";
  const isSoft = variant === "soft";

  return (
    <section
      className={clsx(
        "relative w-full overflow-hidden",
        isSoft ? "bg-mp-white" : "bg-mp-coral",
        className
      )}
      style={{ minHeight: isFull ? "100vh" : height }}
    >
      {/* Sun-burst radial */}
      <div
        aria-hidden
        className={clsx(
          "pointer-events-none absolute inset-0",
          isSoft ? "sunburst-bg-soft" : "sunburst-bg",
          "sunburst-fade-bottom"
        )}
      />

      {/* Léger voile blanc pour lisibilité du texte (sur accent uniquement) */}
      {!isSoft && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-mp-coral/10"
        />
      )}

      {/* Pétales sakura flottants en décor (optionnel) */}
      {withSakura && (
        <>
          <Sakura
            className="absolute left-4 top-8 animate-float-slow opacity-80"
            size={28}
          />
          <Sakura
            className="absolute right-6 top-14 animate-float-slow opacity-60"
            size={22}
            style={{ animationDelay: "0.8s" }}
          />
          <Sakura
            className="absolute left-1/2 top-2 animate-float-slow opacity-70"
            size={18}
            style={{ animationDelay: "1.5s" }}
          />
        </>
      )}

      {/* Contenu central */}
      <div className="relative z-10 flex min-h-full flex-col">{children}</div>

      {/* Nuages en transition vers zone blanche */}
      {withClouds && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0">
          <Clouds className="h-16 w-full sm:h-20" color="#FFFFFF" />
        </div>
      )}
    </section>
  );
}

export default MangaParadiseBackdrop;
