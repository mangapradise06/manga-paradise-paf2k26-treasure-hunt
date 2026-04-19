"use client";

import { useEffect } from "react";

/**
 * Composant Confetti — utilise canvas-confetti en dynamic import
 * pour éviter de charger la lib côté SSR.
 */
export default function Confetti({ fire }: { fire: boolean }) {
  useEffect(() => {
    if (!fire) return;
    let cancelled = false;
    (async () => {
      const mod = await import("canvas-confetti");
      if (cancelled) return;
      const confetti = mod.default;
      const duration = 1800;
      const end = Date.now() + duration;
      const colors = ["#d4af37", "#c0392b", "#e63946", "#27ae60", "#f5e6c8"];
      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 70,
          origin: { x: 0 },
          colors,
          scalar: 0.9,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 70,
          origin: { x: 1 },
          colors,
          scalar: 0.9,
        });
        if (Date.now() < end && !cancelled) requestAnimationFrame(frame);
      })();
      // burst central
      confetti({
        particleCount: 140,
        spread: 120,
        startVelocity: 45,
        origin: { x: 0.5, y: 0.3 },
        colors,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [fire]);
  return null;
}
