"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

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
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="mb-2 font-display text-5xl text-treasure-red">Oups…</p>
      <h1 className="font-display text-2xl">Un coup de tempête</h1>
      <p className="mt-2 text-parchment-ink/70">
        Une erreur inattendue est survenue. Réessaie dans quelques secondes.
      </p>
      <Button onClick={reset} className="mt-6">
        Réessayer
      </Button>
    </main>
  );
}
