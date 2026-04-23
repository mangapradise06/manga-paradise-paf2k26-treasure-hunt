import type { SVGProps } from "react";

interface Props extends Omit<SVGProps<SVGSVGElement>, "size"> {
  size?: number | string;
  petal?: string;
  core?: string;
}

/**
 * Pétale de cerisier — fleur 5 pétales.
 * Utilisée comme bullet point sakura dans les listes.
 */
export function Sakura({
  size = 20,
  petal = "#FDD0E0",
  core = "#F48BB2",
  ...rest
}: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden={rest["aria-label"] ? undefined : true}
      {...rest}
    >
      {/* 5 pétales disposés autour du centre (rotation 72deg) */}
      <g>
        {[0, 72, 144, 216, 288].map((deg) => (
          <path
            key={deg}
            d="M16 16 C14 10 14 6 16 3 C18 6 18 10 16 16 Z"
            fill={petal}
            transform={`rotate(${deg} 16 16)`}
          />
        ))}
      </g>
      {/* Petites échancrures (V au sommet de chaque pétale) */}
      <g opacity="0.55">
        {[0, 72, 144, 216, 288].map((deg) => (
          <path
            key={deg}
            d="M16 3 L15 5 L16 4.2 L17 5 Z"
            fill={core}
            transform={`rotate(${deg} 16 16)`}
          />
        ))}
      </g>
      {/* Coeur */}
      <circle cx="16" cy="16" r="2.6" fill={core} />
    </svg>
  );
}

export default Sakura;
