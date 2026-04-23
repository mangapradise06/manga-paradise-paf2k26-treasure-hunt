"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ToriiIcon } from "@/components/icons/ToriiIcon";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <main className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="pointer-events-none absolute inset-0 sunburst-bg-soft opacity-40" aria-hidden />
      <div className="relative z-10 flex flex-col items-center">
        <ToriiIcon className="mb-4 h-16 w-16 text-mp-red opacity-70" aria-hidden />
        <p className="mb-1 font-display italic text-5xl text-mp-red mp-title-outline">
          OUPS…
        </p>
        <h1 className="font-display italic text-2xl text-mp-ink">
          Un coup de vent
        </h1>
        <p className="mt-2 text-sm text-mp-ink-soft">
          Une erreur inattendue est survenue. Réessaie dans quelques secondes.
        </p>
        <Button onClick={reset} variant="gradient" className="mt-6">
          Réessayer
        </Button>
      </div>
    </main>
  );
}
