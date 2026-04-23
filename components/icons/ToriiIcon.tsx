import type { SVGProps } from "react";

interface Props extends Omit<SVGProps<SVGSVGElement>, "size" | "fill"> {
  size?: number | string;
  color?: string;
}

/**
 * Torii SVG — pilier shintô stylisé, couleur mp-red par défaut.
 * Forme : 2 piliers verticaux + linteau courbe + traverse supérieure.
 */
export function ToriiIcon({ size, color = "currentColor", ...rest }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden={rest["aria-label"] ? undefined : true}
      {...rest}
    >
      {/* Linteau supérieur (kasagi) avec courbe */}
      <path
        d="M3 10 Q24 3 45 10 L45 14 L3 14 Z"
        fill={color}
      />
      {/* Traverse (shimaki) */}
      <rect x="6" y="16" width="36" height="4" rx="1" fill={color} />
      {/* Pilier gauche */}
      <rect x="9" y="20" width="5" height="24" fill={color} />
      {/* Pilier droit */}
      <rect x="34" y="20" width="5" height="24" fill={color} />
      {/* Petit gakuzuka central (planche verticale sous traverse) */}
      <rect x="22" y="20" width="4" height="6" fill={color} opacity="0.85" />
    </svg>
  );
}

export default ToriiIcon;
