import type { SVGProps } from "react";

interface Props extends Omit<SVGProps<SVGSVGElement>, "size"> {
  className?: string;
  color?: string;
}

/**
 * Bande de nuages moelleux, pensée pour être posée en bas d'une zone hero
 * (ou en haut d'une zone blanche comme transition).
 * Par défaut, couleur bleu ciel mp-sky.
 */
export function Clouds({
  className,
  color = "#B9DBFF",
  ...rest
}: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
      {...rest}
    >
      <defs>
        <filter id="mp-clouds-blur" x="-5%" y="-20%" width="110%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <g fill={color} filter="url(#mp-clouds-blur)">
        {/* Couche arrière (plus claire) */}
        <g opacity="0.65">
          <ellipse cx="120" cy="80" rx="150" ry="36" />
          <ellipse cx="360" cy="90" rx="180" ry="40" />
          <ellipse cx="640" cy="75" rx="160" ry="36" />
          <ellipse cx="900" cy="92" rx="190" ry="42" />
          <ellipse cx="1140" cy="78" rx="140" ry="34" />
        </g>
        {/* Couche avant */}
        <g>
          <ellipse cx="80" cy="110" rx="110" ry="28" />
          <ellipse cx="260" cy="108" rx="140" ry="30" />
          <ellipse cx="470" cy="112" rx="120" ry="28" />
          <ellipse cx="680" cy="108" rx="150" ry="32" />
          <ellipse cx="920" cy="112" rx="130" ry="30" />
          <ellipse cx="1120" cy="108" rx="120" ry="28" />
        </g>
      </g>
    </svg>
  );
}

export default Clouds;
