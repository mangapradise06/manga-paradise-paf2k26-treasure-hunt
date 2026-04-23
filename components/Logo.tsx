import Image from "next/image";
import clsx from "clsx";

interface Props {
  size?: number;
  /**
   * - "icon" : affiche uniquement le logo carré (torii sur fond rouge).
   * - "full" : même image pour l'instant (on n'a qu'une version carrée du logo officiel).
   *   La bannière large est gérée séparément par le composant Image dans la landing.
   */
  variant?: "icon" | "full";
  className?: string;
  priority?: boolean;
  /** Affichage du texte alternatif. Accessibilité. */
  alt?: string;
  /** Arrondir en cercle (par défaut true) */
  rounded?: boolean;
}

/**
 * Logo officiel Manga Paradise.
 * Utilise le WebP optimisé (10 KB) en priorité, avec fallback automatique via next/image.
 * Les variantes "icon" et "full" pointent toutes deux vers le logo carré 512x512
 * car c'est la seule version disponible côté logo (la bannière horizontale est une asset dédiée).
 */
export function Logo({
  size = 48,
  variant = "icon",
  className,
  priority = false,
  alt = "Manga Paradise",
  rounded = true,
}: Props) {
  const src = "/brand/logo-manga-paradise.webp";
  void variant;

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={clsx(
        "object-contain",
        rounded && "rounded-full",
        className
      )}
      sizes={`${size}px`}
    />
  );
}

export default Logo;
