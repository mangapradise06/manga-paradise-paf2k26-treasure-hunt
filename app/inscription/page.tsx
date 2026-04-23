"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { ArrowLeft, Info, MapPinned, Trophy, Users } from "lucide-react";
import { ToriiIcon } from "@/components/icons/ToriiIcon";
import { Sakura } from "@/components/icons/Sakura";

interface FieldErrors {
  pseudo?: string;
  rgpd?: string;
}

export default function InscriptionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pseudo, setPseudo] = useState("");
  const [rgpd, setRgpd] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  function validate(): FieldErrors {
    const errs: FieldErrors = {};
    if (!pseudo.trim()) errs.pseudo = "Choisis un pseudo";
    if (!rgpd) errs.rgpd = "Nécessaire pour participer";
    return errs;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    let res: Response;
    try {
      res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudo: pseudo.trim(), rgpd }),
      });
    } catch {
      toast("Erreur réseau, réessaie.", { variant: "error" });
      setLoading(false);
      return;
    }

    let json: { ok?: boolean; error?: string; field?: keyof FieldErrors } = {};
    try {
      json = await res.json();
    } catch {
      /* non-JSON */
    }
    if (!res.ok || !json.ok) {
      const msg = json.error ?? `Inscription impossible (${res.status}).`;
      if (json.field) setErrors((prev) => ({ ...prev, [json.field!]: msg }));
      toast(msg, { variant: "error" });
      setLoading(false);
      return;
    }
    router.push("/onboarding");
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-xl flex-col px-5 py-8 sm:py-12">
      {/* Décor sakura */}
      <Sakura
        className="pointer-events-none absolute -top-2 right-4 opacity-70 sm:right-8"
        size={40}
        aria-hidden="true"
      />
      <Sakura
        className="pointer-events-none absolute bottom-16 left-2 opacity-50 sm:left-6"
        size={28}
        aria-hidden="true"
      />

      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-mp-ink-soft hover:text-mp-red"
      >
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      {/* Ruban gradient header */}
      <div className="mp-banner mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25">
            <ToriiIcon size={22} color="#ffffff" />
          </div>
          <h1 className="font-display text-3xl italic sm:text-4xl">
            Entrée dans l&apos;aventure
          </h1>
        </div>
        <p className="mt-1 text-sm text-white/90 sm:text-base">
          On ne te demande que ton pseudo pour l&apos;instant. Tes coordonnées
          seront récoltées à la fin, une fois le mot secret trouvé.
        </p>
      </div>

      {/* Rappel des règles */}
      <div className="mp-card mb-5 p-5 sm:p-6">
        <h2 className="font-display text-lg italic text-mp-red sm:text-xl">
          Avant de partir…
        </h2>
        <ul className="mt-3 space-y-2.5 text-sm text-mp-ink">
          <li className="flex items-start gap-2">
            <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-mp-red" aria-hidden />
            <span>
              10 stands à découvrir dans l&apos;ordre : une énigme, un indice, un
              personnage d&apos;anime à identifier.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-mp-coral" aria-hidden />
            <span>
              Une chasse différente sera proposée samedi et dimanche. Chaque
              journée te donne 1 chance au tirage.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-mp-orange" aria-hidden />
            <span>
              À la clé : une <strong>figurine Tsume de Deku</strong> (My Hero
              Academia), valeur 300&nbsp;€, tirée au sort en live sur Instagram.
            </span>
          </li>
        </ul>
      </div>

      <div className="mp-card p-6 sm:p-8">
        <div
          role="note"
          className="mb-5 flex items-start gap-2 rounded-2xl border border-mp-coral/30 bg-mp-coral/10 p-3 text-sm text-mp-ink"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-mp-coral" aria-hidden />
          <p>
            Tes <strong>coordonnées (nom, email, newsletter)</strong> te seront
            demandées une fois la chasse terminée, via un formulaire dédié. Pour
            l&apos;instant, juste un pseudo pour s&apos;identifier.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input
            label="Ton pseudo"
            name="pseudo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            error={errors.pseudo}
            maxLength={40}
            hint="C'est ce nom qui s'affichera tout au long de la chasse."
            required
            autoFocus
          />

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={rgpd}
              onChange={(e) => setRgpd(e.target.checked)}
              className="mt-1 h-4 w-4 accent-mp-red"
              aria-describedby="rgpd-hint"
            />
            <span id="rgpd-hint" className="text-mp-ink">
              J&apos;autorise Manga Paradise à utiliser ce pseudo pour
              m&apos;identifier pendant la chasse au trésor. (obligatoire)
              {errors.rgpd && (
                <span className="mt-1 block text-xs text-mp-red">
                  {errors.rgpd}
                </span>
              )}
            </span>
          </label>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full px-6 py-3 text-base sm:w-auto"
          >
            <ToriiIcon size={18} color="#ffffff" />
            Lancer l&apos;aventure
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-mp-ink-soft">
        Manga Paradise (association loi 1901). Tes données ne seront utilisées
        que pour l&apos;animation de la chasse au trésor.
      </p>
    </main>
  );
}
