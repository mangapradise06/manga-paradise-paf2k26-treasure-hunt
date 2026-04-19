"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/Toast";
import { ArrowLeft, Scroll } from "lucide-react";

interface CharRow {
  order_index: number;
  name: string;
  initial: string;
  anime_name: string;
}

export default function FinalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [chars, setChars] = useState<CharRow[] | null>(null);
  const [guess, setGuess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/final/characters", { cache: "no-store" });
      if (r.status === 401) {
        router.replace("/inscription");
        return;
      }
      if (r.status === 403) {
        toast("Tu dois d'abord valider les 10 étapes.", { variant: "info" });
        router.replace("/map");
        return;
      }
      const json = await r.json();
      if (!r.ok) {
        setLoadErr(json.error ?? "Erreur de chargement.");
        return;
      }
      setChars(json.characters as CharRow[]);
    })();
  }, [router, toast]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guess.trim()) {
      toast("Écris le titre de l'anime mystère.", { variant: "info" });
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/final", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess }),
      });
      const json = await r.json();
      if (!r.ok || json.ok === false) {
        toast(json.error ?? "Pas encore ! Réessaie.", { variant: "error" });
        setLoading(false);
        return;
      }
      router.replace("/congrats");
    } catch {
      toast("Erreur réseau.", { variant: "error" });
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
      <Link
        href="/map"
        className="mb-4 inline-flex items-center gap-1 text-sm text-parchment-ink/70 hover:text-parchment-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à la carte
      </Link>
      <div className="parchment-panel p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <Scroll className="h-7 w-7 text-treasure-gold" />
          <h1 className="font-display text-3xl text-treasure-red sm:text-4xl">
            Épreuve finale
          </h1>
        </div>
        <p className="text-parchment-ink/80">
          Tu as recruté 10 personnages légendaires. Observe leurs initiales en or
          — mises bout à bout, elles forment le titre d'un anime culte. Devine
          lequel pour accéder au tirage au sort.
        </p>

        {loadErr && <p className="mt-4 text-treasure-red">{loadErr}</p>}
        {!chars ? (
          <div className="mt-6 flex items-center gap-2 text-parchment-ink/70">
            <span className="dot-spin" aria-hidden /> Chargement…
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {chars.map((c) => {
              const idx = c.name
                .toLowerCase()
                .indexOf(c.initial.toLowerCase());
              const before = idx >= 0 ? c.name.slice(0, idx) : "";
              const letter =
                idx >= 0 ? c.name.slice(idx, idx + 1) : c.initial;
              const after = idx >= 0 ? c.name.slice(idx + 1) : c.name;
              return (
                <li
                  key={c.order_index}
                  className="flex items-center gap-3 rounded-xl border border-parchment-ink/15 bg-parchment-light/70 px-3 py-2"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-parchment-ink font-display text-xs font-bold text-parchment-light">
                    {c.order_index}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold text-parchment-ink">
                      {before}
                      <span className="gold-initial">{letter}</span>
                      {after}
                    </div>
                    <div className="text-xs text-parchment-ink/60">
                      {c.anime_name}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <form onSubmit={onSubmit} className="mt-7 space-y-3">
          <Input
            label="Quel est l'anime formé par les 10 initiales ?"
            placeholder="Ex. NARUTO SHIPPUDEN"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <Button type="submit" variant="primary" loading={loading}>
            Valider ma réponse
          </Button>
        </form>
      </div>
    </main>
  );
}
